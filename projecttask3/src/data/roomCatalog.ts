import type { Booking, Room, RoomDefinition } from "../types";
import { bookings } from "./bookings";

/** Fictional room catalog (no bookings attached yet). */
const roomDefinitions: RoomDefinition[] = [
  {
    id: "r1",
    name: "Room A-101",
    building: "Engineering Block",
    capacity: 40,
    type: "Lecture Hall",
    blocked: false,
    equipment: ["Projector", "Whiteboard", "Microphone", "Video Conferencing"],
  },
  {
    id: "r2",
    name: "Room B-205",
    building: "Science Wing",
    capacity: 25,
    type: "Seminar Room",
    blocked: false,
    equipment: ["Projector", "Whiteboard", "Video Conferencing"],
  },
  {
    id: "r3",
    name: "Lab C-3",
    building: "Tech Center",
    capacity: 20,
    type: "Computer Lab",
    blocked: true,
    equipment: ["Computers", "Projector", "Whiteboard"],
  },
  {
    id: "r4",
    name: "Room D-110",
    building: "Library Annex",
    capacity: 12,
    type: "Study Room",
    blocked: false,
    equipment: ["Whiteboard"],
  },
];

/**
 * Pure: builds rooms that each carry their own bookings (matched by roomId).
 * Inputs are never modified; returned rooms and their arrays are frozen.
 */
export function attachBookings(definitions: RoomDefinition[], allBookings: Booking[]): Room[] {
  return definitions.map((definition) =>
    Object.freeze({
      ...definition,
      equipment: Object.freeze([...definition.equipment]) as string[],
      bookings: Object.freeze(
        allBookings.filter((b) => b.roomId === definition.id)
      ) as Booking[],
    })
  );
}

export const rooms: Room[] = Object.freeze(attachBookings(roomDefinitions, bookings)) as Room[];
