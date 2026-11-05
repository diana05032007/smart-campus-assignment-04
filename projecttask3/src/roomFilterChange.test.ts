import { describe, it, expect } from "vitest";
import { findSelectableRoom, resolveFilterChange, toggleEquipment } from "./roomFilters";
import { rooms } from "./data/roomCatalog";

const ids = (list: { id: string }[]) => list.map((r) => r.id);

describe("toggleEquipment", () => {
  it("adds a missing item and removes a present one, returning new arrays", () => {
    const start = ["Projector"];
    const added = toggleEquipment(start, "Whiteboard");
    expect(added).toEqual(["Projector", "Whiteboard"]);
    expect(start).toEqual(["Projector"]);
    expect(toggleEquipment(added, "Projector")).toEqual(["Whiteboard"]);
  });
});

describe("findSelectableRoom", () => {
  it("returns the room object when visible and not blocked", () => {
    expect(findSelectableRoom("r2", rooms)?.id).toBe("r2");
  });
  it("returns null for hidden, blocked, unknown or missing selections", () => {
    expect(findSelectableRoom("r2", rooms.filter((r) => r.id !== "r2"))).toBeNull();
    expect(findSelectableRoom("r3", rooms)).toBeNull();
    expect(findSelectableRoom("zz", rooms)).toBeNull();
    expect(findSelectableRoom(null, rooms)).toBeNull();
  });
});

describe("resolveFilterChange (F5: no hidden or invalid selection)", () => {
  it("keeps a selection that still matches the new filters", () => {
    const out = resolveFilterChange(rooms, "r1", "30", []);
    expect(ids(out.visibleRooms)).toEqual(["r1"]);
    expect(out.selectedRoomId).toBe("r1");
    expect(out.selectionCleared).toBe(false);
  });

  it("clears a selection that is filtered out and says so", () => {
    const out = resolveFilterChange(rooms, "r2", "30", []);
    expect(out.selectedRoomId).toBeNull();
    expect(out.selectionCleared).toBe(true);
  });

  it("clears the selection when nothing matches (empty state, F4)", () => {
    const out = resolveFilterChange(rooms, "r1", "99", ["Computers"]);
    expect(out.visibleRooms).toEqual([]);
    expect(out.selectionCleared).toBe(true);
  });

  it("does not report a cleared selection when nothing was selected", () => {
    const out = resolveFilterChange(rooms, null, "99", []);
    expect(out.selectionCleared).toBe(false);
    expect(out.selectedRoomId).toBeNull();
  });

  it("treats an invalid attendee value as no capacity filter", () => {
    const out = resolveFilterChange(rooms, "r4", "abc", []);
    expect(ids(out.visibleRooms)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(out.selectedRoomId).toBe("r4");
  });

  it("applies ALL selected equipment together with capacity", () => {
    const out = resolveFilterChange(rooms, null, "20", ["Projector", "Whiteboard"]);
    expect(ids(out.visibleRooms)).toEqual(["r1", "r2", "r3"]);
  });
});
