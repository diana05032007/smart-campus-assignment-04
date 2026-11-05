import { describe, it, expect } from "vitest";
import { evaluateRequest, IDLE_RESULT, isDrawableInterval, parseMinutes } from "./intervalInput";
import { rooms } from "./data/roomCatalog";
import { CURRENT_TIME, MAX_BOOKING_MINUTES, MINUTES_IN_DAY } from "./constants";

const room = (id: string) => rooms.find((r) => r.id === id)!;

describe("shared constants", () => {
  it("keeps the original rule values", () => {
    expect(MAX_BOOKING_MINUTES).toBe(120);
    expect(MINUTES_IN_DAY).toBe(1440);
    expect(CURRENT_TIME).toBe(540);
  });
});

describe("parseMinutes", () => {
  it("returns null for blank input", () => {
    expect(parseMinutes("")).toBeNull();
  });
  it("parses numbers, including zero", () => {
    expect(parseMinutes("0")).toBe(0);
    expect(parseMinutes("660")).toBe(660);
  });
  it("returns null for non-numeric text", () => {
    expect(parseMinutes("abc")).toBeNull();
  });
});

describe("isDrawableInterval", () => {
  it("accepts intervals inside the day, including both day edges", () => {
    expect(isDrawableInterval(0, 1440)).toBe(true);
    expect(isDrawableInterval(600, 660)).toBe(true);
  });
  it("rejects missing, empty, reversed or out-of-range intervals", () => {
    expect(isDrawableInterval(null, 660)).toBe(false);
    expect(isDrawableInterval(600, null)).toBe(false);
    expect(isDrawableInterval(600, 600)).toBe(false);
    expect(isDrawableInterval(700, 600)).toBe(false);
    expect(isDrawableInterval(-1, 60)).toBe(false);
    expect(isDrawableInterval(1380, 1441)).toBe(false);
  });
  it("still draws intervals that booking validation would reject (unchanged behaviour)", () => {
    expect(isDrawableInterval(500, 560)).toBe(true); // starts before current time
    expect(isDrawableInterval(600, 800)).toBe(true); // longer than 120 minutes
  });
});

describe("evaluateRequest", () => {
  it("is idle with no room, even for a complete interval", () => {
    const e = evaluateRequest(null, "600", "660", CURRENT_TIME);
    expect(e.result).toEqual(IDLE_RESULT);
    expect(e.result.decision).toBe("idle");
    expect(e.start).toBe(600);
    expect(e.end).toBe(660);
  });

  it("is idle when the end time is missing", () => {
    const e = evaluateRequest(room("r1"), "660", "", CURRENT_TIME);
    expect(e.result.decision).toBe("idle");
    expect(e.validation).toBeNull();
    expect(e.durationLabel).toBeNull();
  });

  it("gives a live validation hint even before a room is selected", () => {
    const e = evaluateRequest(null, "500", "560", CURRENT_TIME);
    expect(e.validation?.ok).toBe(false);
    expect(e.validation?.reason).toMatch(/after the current time/);
    expect(e.result.decision).toBe("idle");
  });

  it("AC4: touching endpoints are available (r1 busy 540–600 and 720–840)", () => {
    expect(evaluateRequest(room("r1"), "600", "660", CURRENT_TIME).result.available).toBe(true);
    expect(evaluateRequest(room("r1"), "660", "720", CURRENT_TIME).result.available).toBe(true);
  });

  it("AC4: overlapping intervals are rejected", () => {
    const e = evaluateRequest(room("r1"), "700", "760", CURRENT_TIME);
    expect(e.result.available).toBe(false);
    expect(e.result.message).toBe("Time slot unavailable");
  });

  it("AC2: exactly 120 minutes is allowed, 121 is rejected", () => {
    expect(evaluateRequest(room("r4"), "900", "1020", CURRENT_TIME).result.available).toBe(true);
    const tooLong = evaluateRequest(room("r4"), "900", "1021", CURRENT_TIME);
    expect(tooLong.result.available).toBe(false);
    expect(tooLong.result.details[0]).toBe("Bookings cannot be longer than 120 minutes.");
  });

  it("AC1: reports the original range message", () => {
    const e = evaluateRequest(room("r4"), "1380", "1441", CURRENT_TIME);
    expect(e.validation?.reason).toBe("Times must be within 00:00–24:00 (0–1440 minutes).");
  });

  it("AC3: a blocked room is never available (domain level, bypassing the UI guard)", () => {
    const e = evaluateRequest(room("r3"), "660", "720", CURRENT_TIME);
    expect(e.result.available).toBe(false);
    expect(e.result.message).toBe("Room is blocked");
  });

  it("F5: the result follows the room it is evaluated for", () => {
    expect(evaluateRequest(room("r1"), "600", "660", CURRENT_TIME).result.available).toBe(true);
    expect(evaluateRequest(room("r2"), "600", "660", CURRENT_TIME).result.available).toBe(false);
  });

  it("formats the duration label (and a dash for a non-positive span)", () => {
    expect(evaluateRequest(null, "600", "660", CURRENT_TIME).durationLabel).toBe("60 min");
    expect(evaluateRequest(null, "700", "600", CURRENT_TIME).durationLabel).toBe("—");
  });
});
