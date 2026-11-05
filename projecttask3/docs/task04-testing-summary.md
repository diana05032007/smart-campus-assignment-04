# Task #04 — Automated Testing Summary

## Automated tests (Vitest, `npm test`)
| File | Tests | Scope |
|---|---|---|
| `availability.test.ts` | 17 | Original rules: AC1–AC5 on `checkAvailability` (unit) |
| `roomFilters.test.ts` | 23 | F1–F4 filtering, attendee parsing, selection reconciliation (unit) |
| `roomCatalog.test.ts` | 13 | Catalog data, per-room bookings, F3/F5 via `checkRoomAvailability` |
| `data.test.ts` | 6 | Data-layer split, frozen sample data, `attachBookings` |
| `intervalInput.test.ts` | 17 | Input parsing and request evaluation |
| `roomFilterChange.test.ts` | 9 | Filter-change / selection-reconciliation rules |
| `roomSelectionFlow.integration.test.ts` | 1 | **Integration**: filter → select → evaluate (see below) |

Expected total: **86 tests in 7 files** (85 previously verified in Bolt + 1 new).

## Integration test
`src/roomSelectionFlow.integration.test.ts` — "keeps filtering, selection and availability results
consistent through a full user session". It uses the real modules `data/roomCatalog`, `constants`,
`roomFilters` and `intervalInput` (which in turn runs `availability`), with no mocks, and walks one
user session: capacity + ALL-equipment filtering (F1, F2), selecting a room, availability with touching
endpoints (AC4), switching rooms to use each room's own bookings (F5), a selection cleared when filters
exclude the room, 120 vs 121 minutes (AC2), blocked room never available (F3), empty result (F4), and
original data unchanged (AC5).

Limitation: it combines the modules in the same order as `useRoomAvailability`, but it does not render
React (no jsdom / Testing Library installed). It is an application-logic integration test, not a DOM UI test.

## Manual UI checks (not automated)
Performed manually in Bolt.new by the student: capacity filtering, ALL-equipment filtering, empty state,
room switching and availability results. Responsive layout and visual styling (AC6) remain manual checks.
