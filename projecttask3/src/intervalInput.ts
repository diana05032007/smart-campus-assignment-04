import type { CheckResult, Room, ValidationResult } from "./types";
import { MINUTES_IN_DAY } from "./constants";
import { checkRoomAvailability, validateInterval } from "./availability";

/** Result shown before a room and a complete interval are provided. */
export const IDLE_RESULT: CheckResult = Object.freeze({
  decision: "idle",
  available: false,
  message: "Awaiting input",
  details: Object.freeze(["Select a room and enter a time interval to check availability."]) as string[],
}) as CheckResult;

/** Parses a raw input string to minutes. Blank or non-numeric input → null. */
export function parseMinutes(raw: string): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  return isNaN(n) ? null : n;
}

/**
 * Whether an interval can be drawn on the 00:00–24:00 timeline.
 * (Drawing is intentionally more lenient than booking validation: it ignores the
 * current time and the 120-minute limit, exactly as before the refactoring.)
 */
export function isDrawableInterval(start: number | null, end: number | null): boolean {
  return start !== null && end !== null && start >= 0 && end <= MINUTES_IN_DAY && start < end;
}

export interface RequestEvaluation {
  start: number | null;
  end: number | null;
  /** Live input hint; null until both times are numbers (independent of room). */
  validation: ValidationResult | null;
  /** "N min", "—" for a non-positive span, or null until both times are numbers. */
  durationLabel: string | null;
  /** Availability decision, or IDLE_RESULT when room/times are incomplete. */
  result: CheckResult;
}

/**
 * Single entry point that turns the raw form input into everything the UI needs:
 * parsed times, live validation hint, duration label and the availability result.
 */
export function evaluateRequest(
  room: Room | null,
  startStr: string,
  endStr: string,
  currentTime: number
): RequestEvaluation {
  const start = parseMinutes(startStr);
  const end = parseMinutes(endStr);
  const bothEntered = start !== null && end !== null;

  return {
    start,
    end,
    validation: bothEntered ? validateInterval(start, end, currentTime) : null,
    durationLabel: bothEntered ? (end - start > 0 ? `${end - start} min` : "—") : null,
    result:
      room && bothEntered ? checkRoomAvailability(room, start, end, currentTime) : IDLE_RESULT,
  };
}
