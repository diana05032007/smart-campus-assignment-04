# Task #03 — Refactoring Report

Starting point: the Task #02 project (`project-task02.zip`). Behaviour is meant to be unchanged.
This document separates **what was executed** from **what was not** (see "Verification").

## Refactoring plan (as executed)
1. Move repeated rule numbers (120, 1440, fixed current time) into `src/constants.ts`.
2. Split the data layer: `src/data/bookings.ts`, `src/data/roomCatalog.ts`; keep `src/sampleData.ts` as a re-export barrel.
3. Add `src/intervalInput.ts` (pure): parse inputs and evaluate a request once.
4. Add `src/hooks/useRoomAvailability.ts`: all React state; `App.tsx` becomes layout + wiring.
5. Extract repeated rendering: `ResultPanel`, `TimeField`, `Notice`.
6. Add tests only for new pure modules; keep all earlier tests unchanged.

## Diagrams
`docs/architecture-before.mmd` (actual Task #02) and `docs/architecture-after.mmd` (final).
Both were rendered successfully with the Mermaid library in a headless browser (syntax check).

## Design decisions
1. **Pure `evaluateRequest` + thin hook.** Parsing, the live validation hint, the duration label and the
   availability result used to be computed by separate expressions inside `App.tsx`. They now come from one pure
   function, and the hook only owns React state. Rules can be unit-tested without React.
2. **Single source for rule values.** `MAX_BOOKING_MINUTES`, `MINUTES_IN_DAY` and `CURRENT_TIME` live in
   `constants.ts`. Eight copies of the 120/1440 literals across `availability.ts`, `Timeline.tsx` and
   `App.tsx` are now one definition each. `Timeline` also reuses `isDrawableInterval` instead of its own range check.
3. **Data split with frozen sample data.** Catalog and bookings are separate modules; `attachBookings` is pure and
   the sample data is frozen, so an accidental mutation throws (AC5) instead of silently corrupting data.
4. **Style table instead of repeated ternaries.** `ResultPanel` uses one `Record<Decision, styles>`; `App.tsx`
   had 9 `result.decision` branches before and 0 now.

## Remaining limitations / technical debt
- `checkAvailability` still calls `validateInterval` itself, and `evaluateRequest` calls it once more for the live
  hint, so validation runs twice per evaluation (pure and cheap, but still duplicated work).
- `Booking.roomId` is kept for compatibility, so `checkAvailability` still filters by `roomId` even when handed `room.bookings`.
- `Timeline` still has its own `TICK_INTERVAL` (unrelated to the 120-minute rule) and presentational constants.
- Domain strings (error messages) are still inline in `availability.ts`; no i18n layer.
- The hook and components have no automated tests in the repository (no jsdom / Testing Library installed).
- Unrelated debt intentionally left: unused `@supabase/supabase-js` dependency, `animate-in` classes without the plugin.
