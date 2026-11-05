import type { Room } from "./types";

export interface RoomFilterCriteria {
  /** Requested attendee count; null means "no capacity filter". */
  attendees: number | null;
  /** Required equipment; a room must have ALL of these. Empty = no filter. */
  equipment: string[];
}

export interface AttendeesParseResult {
  value: number | null;
  error: string | null;
}

const normalize = (s: string): string => s.trim().toLowerCase();

/**
 * Parses the raw attendee input. Blank input means "no filter".
 * Invalid input returns an error message and no value (no capacity filter).
 */
export function parseAttendees(input: string): AttendeesParseResult {
  if (input.trim() === "") return { value: null, error: null };
  const n = Number(input);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { value: null, error: "Attendee count must be a whole number." };
  }
  if (n < 1) {
    return { value: null, error: "Attendee count must be at least 1." };
  }
  return { value: n, error: null };
}

/** F1: keeps rooms whose capacity is >= the requested attendee count. */
export function filterRoomsByCapacity(rooms: Room[], attendees: number | null): Room[] {
  if (attendees === null) return [...rooms];
  return rooms.filter((r) => r.capacity >= attendees);
}

/** F2: keeps rooms that contain ALL required equipment items. */
export function filterRoomsByEquipment(rooms: Room[], required: string[]): Room[] {
  if (required.length === 0) return [...rooms];
  return rooms.filter((r) => {
    const have = new Set(r.equipment.map(normalize));
    return required.every((item) => have.has(normalize(item)));
  });
}

/** Applies both filters. Never mutates its inputs; always returns a new array. */
export function filterRooms(rooms: Room[], criteria: RoomFilterCriteria): Room[] {
  return filterRoomsByEquipment(
    filterRoomsByCapacity(rooms, criteria.attendees),
    criteria.equipment
  );
}

/** Distinct equipment names across the catalog, sorted (returns a new array). */
export function getEquipmentOptions(rooms: Room[]): string[] {
  const unique = new Set<string>();
  rooms.forEach((r) => r.equipment.forEach((e) => unique.add(e)));
  return [...unique].sort((a, b) => a.localeCompare(b));
}

/**
 * Returns the selected room only if it is currently visible and not blocked;
 * otherwise null. Prevents a hidden or invalid room staying selected.
 */
export function findSelectableRoom(
  selectedRoomId: string | null,
  visibleRooms: Room[]
): Room | null {
  if (selectedRoomId === null) return null;
  const room = visibleRooms.find((r) => r.id === selectedRoomId);
  return room && !room.blocked ? room : null;
}

/** Same rule as findSelectableRoom, but returns just the room id (or null). */
export function reconcileSelection(
  selectedRoomId: string | null,
  visibleRooms: Room[]
): string | null {
  return findSelectableRoom(selectedRoomId, visibleRooms)?.id ?? null;
}

/** Returns a NEW equipment list with the item added or removed. */
export function toggleEquipment(current: string[], item: string): string[] {
  return current.includes(item) ? current.filter((e) => e !== item) : [...current, item];
}

export interface FilterChangeOutcome {
  visibleRooms: Room[];
  /** The selection that remains valid after the change (null if none). */
  selectedRoomId: string | null;
  /** True when a previously selected room had to be cleared by this change. */
  selectionCleared: boolean;
}

/**
 * Pure description of what happens when the filters change: which rooms are
 * visible, and whether the current selection survives (F5 / no hidden selection).
 */
export function resolveFilterChange(
  allRooms: Room[],
  selectedRoomId: string | null,
  attendeesStr: string,
  equipment: string[]
): FilterChangeOutcome {
  const visibleRooms = filterRooms(allRooms, {
    attendees: parseAttendees(attendeesStr).value,
    equipment,
  });
  const remaining = reconcileSelection(selectedRoomId, visibleRooms);
  return {
    visibleRooms,
    selectedRoomId: remaining,
    selectionCleared: selectedRoomId !== null && remaining === null,
  };
}
