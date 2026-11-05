import { describe, it, expect } from "vitest";
import { checkAvailability } from "./availability";
import type { Room, Booking } from "./types";

// Default fixture used across the decision tests.
// Times are integer minutes after midnight.
const CURRENT_TIME = 540;
const ROOM_ID = "r1";
const EXISTING_BOOKING: Booking = {
  id: "b1",
  roomId: ROOM_ID,
  start: 600,
  end: 660,
  title: "Existing Booking",
};

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: ROOM_ID,
    name: "Room A-101",
    building: "Engineering Block",
    capacity: 40,
    type: "Lecture Hall",
    blocked: false,
    ...overrides,
  };
}

function makeBookings(): Booking[] {
  // Fresh independent copy so no test can mutate shared state.
  return [
    {
      id: EXISTING_BOOKING.id,
      roomId: EXISTING_BOOKING.roomId,
      start: EXISTING_BOOKING.start,
      end: EXISTING_BOOKING.end,
      title: EXISTING_BOOKING.title,
    },
  ];
}

// Independent deep copy for the data-preservation test.
function deepCopyBookings(bookings: Booking[]): Booking[] {
  return bookings.map((b) => ({ ...b }));
}

// Two bookings in a fixed order for T15, so accidental in-place reordering can
// be detected. Order is intentionally non-sorted (by start time): the later
// booking is listed first. The second booking is placed so it touches but does
// not overlap the 660–720 candidate (Allowed), while the 600–660 booking makes
// 630–690 Unavailable via overlap.
function makeT15Bookings(): Booking[] {
  return [
    { id: "b2", roomId: ROOM_ID, start: 720, end: 780, title: "Second Booking" },
    { id: "b1", roomId: ROOM_ID, start: 600, end: 660, title: "Existing Booking" },
  ];
}

// NOTE (traceability): AC6 (responsive layout / visible validation feedback) and
// the visible/display part of AC5 are intentionally checked manually, not by this
// unit suite. This suite only verifies the decision logic and internal data
// preservation of checkAvailability.

describe("checkAvailability — first automated suite", () => {
  it("T01: 660–720 → Available — AC4 touching after is allowed", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });

  it("T02: 540–570 → Unavailable — AC1 start equals current time", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 540, 570, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T03: 720–720 → Unavailable — AC1 zero duration", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T04: 750–720 → Unavailable — AC1 reversed interval", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 750, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T05: 1380–1441 → Unavailable — AC1 end exceeds 1440", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 1380, 1441, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T06: 720–840 → Available — AC2 exactly 120 minutes is allowed", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 840, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });

  it("T07: 720–841 → Unavailable — AC2 121 minutes is too long", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 720, 841, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T08: 570–600 → Available — AC4 touching before is allowed", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 570, 600, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });

  it("T09: 630–690 → Unavailable — AC4 partial overlap", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T10: 570–690 → Unavailable — AC4 candidate contains the existing booking", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 570, 690, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T11: 615–645 → Unavailable — AC4 candidate lies inside the existing booking", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 615, 645, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T12: 600–660 → Unavailable — AC4 identical interval", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 600, 660, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T13: 660–720 with room.blocked = true → Unavailable — AC3", () => {
    const room = makeRoom({ blocked: true });
    const bookings = makeBookings();
    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
  });

  it("T14: 630–690 with existingBookings = [] → Available — AC4", () => {
    const room = makeRoom();
    const result = checkAvailability(room, 630, 690, CURRENT_TIME, []);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });

  it("T15: data-preservation — booking data unchanged after Available and Unavailable checks — AC5", () => {
    const room = makeRoom();
    const bookings = makeT15Bookings();
    const snapshot = deepCopyBookings(bookings);

    // Three checks exercising both Available and Unavailable decisions, with a
    // repeat of the Available case to confirm repeated calls do not mutate state.
    const first = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(first.available).toBe(true);
    expect(first.decision).toBe("available");

    const second = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);
    expect(second.available).toBe(false);
    expect(second.decision).toBe("unavailable");

    const third = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    expect(third.available).toBe(true);
    expect(third.decision).toBe("available");

    // Booking count unchanged.
    expect(bookings).toHaveLength(snapshot.length);
    // Original bookings array deep-equals the pre-call snapshot (order preserved).
    expect(bookings).toEqual(snapshot);
  });

  it("T16: 541–570 → Available — AC1 smallest valid start after currentTime", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 541, 570, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });

  it("T17: 1320–1440 → Available — AC1/AC2 end at day boundary and duration exactly 120 minutes", () => {
    const room = makeRoom();
    const bookings = makeBookings();
    const result = checkAvailability(room, 1320, 1440, CURRENT_TIME, bookings);
    expect(result.available).toBe(true);
    expect(result.decision).toBe("available");
  });
});
