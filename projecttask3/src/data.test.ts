import { describe, it, expect } from "vitest";
import { bookings } from "./data/bookings";
import { attachBookings, rooms } from "./data/roomCatalog";
import * as barrel from "./sampleData";
import type { Booking, RoomDefinition } from "./types";

describe("data layer split", () => {
  it("sampleData re-exports exactly the same data as the new modules", () => {
    expect(barrel.rooms).toBe(rooms);
    expect(barrel.bookings).toBe(bookings);
    expect(barrel.CURRENT_TIME).toBe(540);
  });

  it("freezes sample bookings and room data so mutation cannot go unnoticed (AC5)", () => {
    expect(Object.isFrozen(bookings)).toBe(true);
    bookings.forEach((b) => expect(Object.isFrozen(b)).toBe(true));
    expect(Object.isFrozen(rooms)).toBe(true);
    rooms.forEach((r) => {
      expect(Object.isFrozen(r)).toBe(true);
      expect(Object.isFrozen(r.bookings)).toBe(true);
      expect(Object.isFrozen(r.equipment)).toBe(true);
    });
  });

  it("rejects attempts to mutate frozen booking data", () => {
    expect(() => {
      (bookings[0] as Booking).start = 1;
    }).toThrow();
    expect(() => {
      bookings.push({ id: "x", roomId: "r1", start: 1, end: 2, title: "x" });
    }).toThrow();
  });
});

describe("attachBookings", () => {
  const defs: RoomDefinition[] = [
    { id: "a", name: "A", building: "B", capacity: 5, type: "T", blocked: false, equipment: ["X"] },
    { id: "b", name: "B", building: "B", capacity: 6, type: "T", blocked: true, equipment: [] },
  ];
  const list: Booking[] = [
    { id: "1", roomId: "a", start: 10, end: 20, title: "one" },
    { id: "2", roomId: "b", start: 30, end: 40, title: "two" },
    { id: "3", roomId: "a", start: 50, end: 60, title: "three" },
  ];

  it("gives each room only its own bookings, in original order", () => {
    const result = attachBookings(defs, list);
    expect(result[0].bookings.map((b) => b.id)).toEqual(["1", "3"]);
    expect(result[1].bookings.map((b) => b.id)).toEqual(["2"]);
  });

  it("does not mutate its inputs", () => {
    const defsCopy = JSON.parse(JSON.stringify(defs));
    const listCopy = JSON.parse(JSON.stringify(list));
    attachBookings(defs, list);
    expect(defs).toEqual(defsCopy);
    expect(list).toEqual(listCopy);
    expect("bookings" in defs[0]).toBe(false);
  });

  it("gives an empty bookings list to a room without bookings", () => {
    expect(attachBookings([defs[1]], [list[0]])[0].bookings).toEqual([]);
  });
});
