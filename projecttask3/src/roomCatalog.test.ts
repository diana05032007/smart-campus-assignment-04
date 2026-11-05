import { describe, it, expect } from "vitest";
import { rooms, bookings, CURRENT_TIME } from "./sampleData";
import { checkRoomAvailability } from "./availability";

// Original booking records exactly as they existed before the catalog change.
const ORIGINAL_BOOKINGS = [
  { id: "b1", roomId: "r1", start: 540, end: 600, title: "Intro to Algorithms" },
  { id: "b2", roomId: "r1", start: 720, end: 840, title: "Calculus II" },
  { id: "b3", roomId: "r2", start: 600, end: 660, title: "Physics Lab Prep" },
  { id: "b4", roomId: "r4", start: 480, end: 540, title: "Group Study" },
];

const room = (id: string) => rooms.find((r) => r.id === id)!;

describe("room catalog data", () => {
  it("keeps the four original rooms with their identities", () => {
    expect(rooms.map((r) => [r.id, r.name, r.capacity, r.blocked])).toEqual([
      ["r1", "Room A-101", 40, false],
      ["r2", "Room B-205", 25, false],
      ["r3", "Lab C-3", 20, true],
      ["r4", "Room D-110", 12, false],
    ]);
  });

  it("gives every room an id, name, capacity, equipment list, blocked flag and bookings", () => {
    expect(rooms.length).toBeGreaterThanOrEqual(4);
    rooms.forEach((r) => {
      expect(typeof r.id).toBe("string");
      expect(typeof r.name).toBe("string");
      expect(r.capacity).toBeGreaterThan(0);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(r.equipment.length).toBeGreaterThan(0);
      expect(typeof r.blocked).toBe("boolean");
      expect(Array.isArray(r.bookings)).toBe(true);
    });
  });

  it("preserves the original booking data unchanged", () => {
    expect(bookings).toEqual(ORIGINAL_BOOKINGS);
  });

  it("associates each original booking with exactly its own room, none lost", () => {
    expect(room("r1").bookings.map((b) => b.id)).toEqual(["b1", "b2"]);
    expect(room("r2").bookings.map((b) => b.id)).toEqual(["b3"]);
    expect(room("r3").bookings).toEqual([]);
    expect(room("r4").bookings.map((b) => b.id)).toEqual(["b4"]);
    rooms.forEach((r) => r.bookings.forEach((b) => expect(b.roomId).toBe(r.id)));
    const all = rooms.flatMap((r) => r.bookings);
    expect(all).toHaveLength(ORIGINAL_BOOKINGS.length);
    expect(all).toEqual(expect.arrayContaining(ORIGINAL_BOOKINGS));
  });

  it("uses the fixed current time of 09:00", () => {
    expect(CURRENT_TIME).toBe(540);
  });
});

describe("checkRoomAvailability uses the room's own bookings", () => {
  it("F5: the same interval gives different results for different rooms", () => {
    // 600–660 touches r1's 540–600 booking (allowed) but equals r2's own booking.
    expect(checkRoomAvailability(room("r1"), 600, 660, CURRENT_TIME).available).toBe(true);
    expect(checkRoomAvailability(room("r2"), 600, 660, CURRENT_TIME).available).toBe(false);
  });

  it("F5: another room's bookings never cause a conflict", () => {
    // 720–780 conflicts with r1's b2 only.
    expect(checkRoomAvailability(room("r1"), 720, 780, CURRENT_TIME).available).toBe(false);
    expect(checkRoomAvailability(room("r2"), 720, 780, CURRENT_TIME).available).toBe(true);
    expect(checkRoomAvailability(room("r4"), 720, 780, CURRENT_TIME).available).toBe(true);
  });

  it("F5: conflict details list only the selected room's bookings", () => {
    const result = checkRoomAvailability(room("r2"), 610, 650, CURRENT_TIME);
    expect(result.decision).toBe("unavailable");
    const text = result.details.join("\n");
    expect(text).toContain("Physics Lab Prep");
    expect(text).not.toContain("Calculus II");
  });

  it("AC4: touching endpoints stay allowed with per-room bookings", () => {
    expect(checkRoomAvailability(room("r2"), 660, 720, CURRENT_TIME).available).toBe(true);
    expect(checkRoomAvailability(room("r2"), 540 + 1, 600, CURRENT_TIME).available).toBe(true);
  });

  it("F3: the blocked room is never available, even with a valid free interval", () => {
    const result = checkRoomAvailability(room("r3"), 660, 720, CURRENT_TIME);
    expect(result.available).toBe(false);
    expect(result.decision).toBe("unavailable");
    expect(result.message).toBe("Room is blocked");
  });

  it("AC1/AC2: validation still applies through the room-based check", () => {
    expect(checkRoomAvailability(room("r1"), 540, 570, CURRENT_TIME).available).toBe(false);
    expect(checkRoomAvailability(room("r4"), 900, 1021, CURRENT_TIME).available).toBe(false);
    expect(checkRoomAvailability(room("r4"), 900, 1020, CURRENT_TIME).available).toBe(true);
  });

  it("returns the 'Select a room' result when no room is given", () => {
    expect(checkRoomAvailability(null, 600, 660, CURRENT_TIME).available).toBe(false);
  });

  it("AC5: booking data is not mutated by repeated checks", () => {
    const snapshot = JSON.parse(JSON.stringify(rooms));
    rooms.forEach((r) => {
      checkRoomAvailability(r, 600, 660, CURRENT_TIME);
      checkRoomAvailability(r, 720, 780, CURRENT_TIME);
    });
    expect(JSON.parse(JSON.stringify(rooms))).toEqual(snapshot);
    expect(bookings).toEqual(ORIGINAL_BOOKINGS);
  });
});
