import type { Booking } from "../types";

/**
 * Original flat booking records (unchanged since Task #02).
 * Each record and the array itself are frozen, so accidental mutation throws
 * instead of silently corrupting shared sample data (AC5).
 */
const bookingRecords: Booking[] = [
  { id: "b1", roomId: "r1", start: 540, end: 600, title: "Intro to Algorithms" },
  { id: "b2", roomId: "r1", start: 720, end: 840, title: "Calculus II" },
  { id: "b3", roomId: "r2", start: 600, end: 660, title: "Physics Lab Prep" },
  { id: "b4", roomId: "r4", start: 480, end: 540, title: "Group Study" },
];

export const bookings: Booking[] = Object.freeze(
  bookingRecords.map((b) => Object.freeze(b))
) as Booking[];
