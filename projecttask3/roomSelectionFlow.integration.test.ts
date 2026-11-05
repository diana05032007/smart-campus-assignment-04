import { describe, it, expect } from "vitest";
import { rooms } from "./data/roomCatalog";
import { CURRENT_TIME } from "./constants";
import {
  filterRooms,
  findSelectableRoom,
  getEquipmentOptions,
  parseAttendees,
  resolveFilterChange,
  toggleEquipment,
} from "./roomFilters";
import { evaluateRequest } from "./intervalInput";

/**
 * Integration test: data layer → filtering → selection rules → interval parsing
 * → availability rules, using the REAL modules (no mocks).
 *
 * `view` and `changeFilters` combine the modules in the same order as the
 * useRoomAvailability hook. The hook itself is not rendered here (no DOM test
 * library is installed), so this covers the application logic end to end, not React.
 */

interface Session {
  selectedRoomId: string | null;
  attendeesStr: string;
  equipment: string[];
  startStr: string;
  endStr: string;
}

const ids = (list: { id: string }[]) => list.map((r) => r.id);

function view(s: Session) {
  const visibleRooms = filterRooms(rooms, {
    attendees: parseAttendees(s.attendeesStr).value,
    equipment: s.equipment,
  });
  const selectedRoom = findSelectableRoom(s.selectedRoomId, visibleRooms);
  const evaluation = evaluateRequest(selectedRoom, s.startStr, s.endStr, CURRENT_TIME);
  return { visibleRooms, selectedRoom, evaluation };
}

function changeFilters(s: Session, attendeesStr: string, equipment: string[]) {
  const change = resolveFilterChange(rooms, s.selectedRoomId, attendeesStr, equipment);
  const session: Session = {
    ...s,
    attendeesStr,
    equipment,
    selectedRoomId: change.selectedRoomId,
  };
  return { session, selectionCleared: change.selectionCleared };
}

describe("integration: filter → select room → evaluate availability", () => {
  it("keeps filtering, selection and availability results consistent through a full user session", () => {
    const dataSnapshot = JSON.stringify(rooms);
    let s: Session = { selectedRoomId: null, attendeesStr: "", equipment: [], startStr: "", endStr: "" };

    // 1. Initial state: whole catalog visible, nothing selected, idle result
    let v = view(s);
    expect(ids(v.visibleRooms)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(getEquipmentOptions(rooms)).toContain("Video Conferencing");
    expect(v.evaluation.result.decision).toBe("idle");

    // 2. F1 + F2: 20 attendees AND Projector AND Video Conferencing
    let equipment = toggleEquipment([], "Projector");
    equipment = toggleEquipment(equipment, "Video Conferencing");
    ({ session: s } = changeFilters(s, "20", equipment));
    v = view(s);
    expect(ids(v.visibleRooms)).toEqual(["r1", "r2"]);

    // 3. Times entered but no room selected yet: parsed, but still idle
    s = { ...s, startStr: "600", endStr: "660" };
    v = view(s);
    expect(v.evaluation.durationLabel).toBe("60 min");
    expect(v.evaluation.result.decision).toBe("idle");

    // 4. Select r1: touching its 540–600 booking is allowed (AC4)
    s = { ...s, selectedRoomId: "r1" };
    v = view(s);
    expect(v.selectedRoom?.id).toBe("r1");
    expect(v.evaluation.result.available).toBe(true);

    // 5. F5: switch to r2, same interval → uses r2's OWN booking
    s = { ...s, selectedRoomId: "r2" };
    v = view(s);
    const r2Details = v.evaluation.result.details.join("\n");
    expect(v.evaluation.result.available).toBe(false);
    expect(r2Details).toContain("Physics Lab Prep");
    expect(r2Details).not.toContain("Calculus II");

    // 6. Tighten capacity to 30: r2 leaves the list, so its selection is cleared
    const tightened = changeFilters(s, "30", equipment);
    s = tightened.session;
    v = view(s);
    expect(ids(v.visibleRooms)).toEqual(["r1"]);
    expect(tightened.selectionCleared).toBe(true);
    expect(v.selectedRoom).toBeNull();
    expect(v.evaluation.result.decision).toBe("idle");

    // 7. Select r1 again and evaluate several intervals (AC1, AC2, AC4)
    s = { ...s, selectedRoomId: "r1", startStr: "700", endStr: "760" };
    v = view(s);
    expect(v.evaluation.result.available).toBe(false);
    expect(v.evaluation.result.details.join("\n")).toContain("Calculus II");

    s = { ...s, startStr: "900", endStr: "1020" }; // exactly 120 minutes
    v = view(s);
    expect(v.evaluation.result.available).toBe(true);
    expect(v.evaluation.durationLabel).toBe("120 min");

    s = { ...s, endStr: "1021" }; // 121 minutes
    v = view(s);
    expect(v.evaluation.result.available).toBe(false);
    expect(v.evaluation.result.message).toBe("Invalid interval");
    expect(v.evaluation.validation?.reason).toBe("Bookings cannot be longer than 120 minutes.");

    // 8. F3: filters that match only the blocked room → it can never be selected
    //    or reported as available, even with a valid free interval
    ({ session: s } = changeFilters(s, "20", ["Computers"]));
    s = { ...s, selectedRoomId: "r3", startStr: "660", endStr: "720" };
    v = view(s);
    expect(ids(v.visibleRooms)).toEqual(["r3"]);
    expect(v.selectedRoom).toBeNull();
    expect(v.evaluation.result.available).toBe(false);
    const blocked = rooms.find((r) => r.id === "r3")!;
    const direct = evaluateRequest(blocked, "660", "720", CURRENT_TIME);
    expect(direct.result.available).toBe(false);
    expect(direct.result.message).toBe("Room is blocked");

    // 9. F4: nothing matches → empty list and a cleared selection
    const none = changeFilters(s, "99", []);
    s = none.session;
    v = view(s);
    expect(v.visibleRooms).toEqual([]);
    expect(none.selectionCleared).toBe(true);
    expect(v.selectedRoom).toBeNull();

    // 10. Clearing filters restores the catalog; original data never mutated (AC5)
    ({ session: s } = changeFilters(s, "", []));
    expect(ids(view(s).visibleRooms)).toEqual(["r1", "r2", "r3", "r4"]);
    expect(JSON.stringify(rooms)).toBe(dataSnapshot);
  });
});
