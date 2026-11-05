import { useMemo, useState } from "react";
import type { Room } from "@/types";
import { evaluateRequest } from "@/intervalInput";
import {
  filterRooms,
  findSelectableRoom,
  getEquipmentOptions,
  parseAttendees,
  resolveFilterChange,
  toggleEquipment,
} from "@/roomFilters";

export const SELECTION_CLEARED_NOTICE =
  "Your selected room no longer matches the filters, so the selection was cleared.";

/**
 * Owns all UI state (filters, selection, time inputs) and derives the view model.
 * Business rules live in pure modules (availability, roomFilters, intervalInput);
 * this hook only wires them to React state.
 */
export function useRoomAvailability(allRooms: Room[], currentTime: number) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [attendeesStr, setAttendeesStr] = useState("");
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  const attendees = useMemo(() => parseAttendees(attendeesStr), [attendeesStr]);
  const equipmentOptions = useMemo(() => getEquipmentOptions(allRooms), [allRooms]);

  // F1/F2: rooms that satisfy the current filters
  const visibleRooms = useMemo(
    () => filterRooms(allRooms, { attendees: attendees.value, equipment: requiredEquipment }),
    [allRooms, attendees.value, requiredEquipment]
  );

  // Only a visible, non-blocked room can be selected (never hidden/invalid)
  const selectedRoom = useMemo(
    () => findSelectableRoom(selectedRoomId, visibleRooms),
    [selectedRoomId, visibleRooms]
  );

  // F5: the evaluation always uses the selected room's own bookings
  const evaluation = useMemo(
    () => evaluateRequest(selectedRoom, startStr, endStr, currentTime),
    [selectedRoom, startStr, endStr, currentTime]
  );

  const applyFilters = (nextAttendeesStr: string, nextEquipment: string[]) => {
    const change = resolveFilterChange(allRooms, selectedRoomId, nextAttendeesStr, nextEquipment);
    setAttendeesStr(nextAttendeesStr);
    setRequiredEquipment(nextEquipment);
    if (change.selectionCleared) {
      setSelectedRoomId(null);
      setSelectionNotice(SELECTION_CLEARED_NOTICE);
    }
  };

  return {
    // data for rendering
    totalRooms: allRooms.length,
    visibleRooms,
    equipmentOptions,
    selectedRoom,
    selectionNotice,
    attendeesStr,
    attendeesError: attendees.error,
    requiredEquipment,
    startStr,
    endStr,
    evaluation,
    // actions
    setAttendees: (value: string) => applyFilters(value, requiredEquipment),
    toggleEquipmentFilter: (item: string) =>
      applyFilters(attendeesStr, toggleEquipment(requiredEquipment, item)),
    clearFilters: () => applyFilters("", []),
    selectRoom: (id: string) => {
      setSelectedRoomId(id);
      setSelectionNotice(null);
    },
    setStartStr,
    setEndStr,
    reset: () => {
      setSelectedRoomId(null);
      setSelectionNotice(null);
      setStartStr("");
      setEndStr("");
    },
  };
}
