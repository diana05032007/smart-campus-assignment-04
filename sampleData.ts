import type { Room, Booking } from "./types";

export const CURRENT_TIME = 540; // 9:00 AM in minutes

export const rooms: Room[] = [
  {
    id: "r1",
    name: "Room A-101",
    building: "Engineering Block",
    capacity: 40,
    type: "Lecture Hall",
    blocked: false,
  },
  {
    id: "r2",
    name: "Room B-205",
    building: "Science Wing",
    capacity: 25,
    type: "Seminar Room",
    blocked: false,
  },
  {
    id: "r3",
    name: "Lab C-3",
    building: "Tech Center",
    capacity: 20,
    type: "Computer Lab",
    blocked: true,
  },
  {
    id: "r4",
    name: "Room D-110",
    building: "Library Annex",
    capacity: 12,
    type: "Study Room",
    blocked: false,
  },
];

export const bookings: Booking[] = [
  { id: "b1", roomId: "r1", start: 540, end: 600, title: "Intro to Algorithms" },
  { id: "b2", roomId: "r1", start: 720, end: 840, title: "Calculus II" },
  { id: "b3", roomId: "r2", start: 600, end: 660, title: "Physics Lab Prep" },
  { id: "b4", roomId: "r4", start: 480, end: 540, title: "Group Study" },
];
