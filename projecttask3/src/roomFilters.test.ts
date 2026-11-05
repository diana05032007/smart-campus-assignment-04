import { describe, it, expect } from "vitest";
import {
  filterRooms,
  filterRoomsByCapacity,
  filterRoomsByEquipment,
  getEquipmentOptions,
  parseAttendees,
  reconcileSelection,
} from "./roomFilters";
import { rooms } from "./sampleData";
import type { Room } from "./types";

const ids = (list: Room[]) => list.map((r) => r.id);

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value as object).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

describe("parseAttendees", () => {
  it("F1: blank input means no capacity filter", () => {
    expect(parseAttendees("")).toEqual({ value: null, error: null });
    expect(parseAttendees("   ")).toEqual({ value: null, error: null });
  });

  it("F1: parses a valid whole number", () => {
    expect(parseAttendees("25")).toEqual({ value: 25, error: null });
  });

  it("F1: rejects zero, negatives and decimals with a message", () => {
    expect(parseAttendees("0").value).toBeNull();
    expect(parseAttendees("0").error).toMatch(/at least 1/);
    expect(parseAttendees("-3").error).toMatch(/at least 1/);
    expect(parseAttendees("2.5").error).toMatch(/whole number/);
    expect(parseAttendees("abc").error).toMatch(/whole number/);
  });
});

describe("filterRoomsByCapacity (F1)", () => {
  it("returns all rooms when attendees is null", () => {
    expect(ids(filterRoomsByCapacity(rooms, null))).toEqual(["r1", "r2", "r3", "r4"]);
  });

  it("keeps rooms with capacity greater than the request", () => {
    expect(ids(filterRoomsByCapacity(rooms, 21))).toEqual(["r1", "r2"]);
  });

  it("keeps rooms whose capacity equals the request (>= boundary)", () => {
    expect(ids(filterRoomsByCapacity(rooms, 25))).toEqual(["r1", "r2"]);
    expect(ids(filterRoomsByCapacity(rooms, 12))).toEqual(["r1", "r2", "r3", "r4"]);
  });

  it("excludes rooms one seat too small", () => {
    expect(ids(filterRoomsByCapacity(rooms, 26))).toEqual(["r1"]);
    expect(ids(filterRoomsByCapacity(rooms, 13))).toEqual(["r1", "r2", "r3"]);
  });

  it("returns an empty list when the request exceeds every capacity", () => {
    expect(filterRoomsByCapacity(rooms, 41)).toEqual([]);
  });
});

describe("filterRoomsByEquipment (F2)", () => {
  it("returns all rooms when no equipment is required", () => {
    expect(ids(filterRoomsByEquipment(rooms, []))).toEqual(["r1", "r2", "r3", "r4"]);
  });

  it("matches a single required item", () => {
    expect(ids(filterRoomsByEquipment(rooms, ["Microphone"]))).toEqual(["r1"]);
    expect(ids(filterRoomsByEquipment(rooms, ["Whiteboard"]))).toEqual(["r1", "r2", "r3", "r4"]);
  });

  it("requires ALL selected items, not just any", () => {
    expect(ids(filterRoomsByEquipment(rooms, ["Projector", "Video Conferencing"]))).toEqual([
      "r1",
      "r2",
    ]);
    // "Computers" exists only in r3 and "Microphone" only in r1: no room has both
    expect(filterRoomsByEquipment(rooms, ["Computers", "Microphone"])).toEqual([]);
  });

  it("ignores case and surrounding whitespace when matching", () => {
    expect(ids(filterRoomsByEquipment(rooms, ["  microphone "]))).toEqual(["r1"]);
  });

  it("returns no rooms for unknown equipment", () => {
    expect(filterRoomsByEquipment(rooms, ["Telescope"])).toEqual([]);
  });
});

describe("filterRooms (combined)", () => {
  it("applies capacity and equipment together", () => {
    expect(
      ids(filterRooms(rooms, { attendees: 30, equipment: ["Video Conferencing"] }))
    ).toEqual(["r1"]);
  });

  it("F4: yields an empty result when the combination matches nothing", () => {
    expect(filterRooms(rooms, { attendees: 30, equipment: ["Computers"] })).toEqual([]);
  });

  it("F3: blocked rooms that match remain flagged as blocked", () => {
    const result = filterRooms(rooms, { attendees: null, equipment: ["Computers"] });
    expect(ids(result)).toEqual(["r3"]);
    expect(result[0].blocked).toBe(true);
  });

  it("AC5: does not mutate or reorder its inputs and returns new arrays", () => {
    const frozen = deepFreeze(rooms.map((r) => ({ ...r, equipment: [...r.equipment], bookings: r.bookings.map((b) => ({ ...b })) })));
    const equipment = Object.freeze(["Projector"]) as string[];
    expect(() => filterRooms(frozen, { attendees: 10, equipment })).not.toThrow();
    const all = filterRoomsByCapacity(frozen, null);
    expect(all).not.toBe(frozen);
    expect(ids(frozen)).toEqual(["r1", "r2", "r3", "r4"]);
  });
});

describe("getEquipmentOptions", () => {
  it("returns distinct, sorted equipment names covering the catalog", () => {
    expect(getEquipmentOptions(rooms)).toEqual([
      "Computers",
      "Microphone",
      "Projector",
      "Video Conferencing",
      "Whiteboard",
    ]);
  });
});

describe("reconcileSelection (no hidden or invalid selection)", () => {
  it("keeps a selected room that is still visible and not blocked", () => {
    expect(reconcileSelection("r2", rooms)).toBe("r2");
  });

  it("clears the selection when the room is filtered out", () => {
    const visible = filterRoomsByCapacity(rooms, 30); // only r1
    expect(reconcileSelection("r2", visible)).toBeNull();
  });

  it("clears the selection when the visible list is empty", () => {
    expect(reconcileSelection("r1", [])).toBeNull();
  });

  it("never keeps a blocked room selected", () => {
    expect(reconcileSelection("r3", rooms)).toBeNull();
  });

  it("returns null when nothing is selected", () => {
    expect(reconcileSelection(null, rooms)).toBeNull();
  });
});
