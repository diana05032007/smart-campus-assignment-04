import type { Room, Booking, CheckResult, ValidationResult } from "./types";
import { MAX_BOOKING_MINUTES, MINUTES_IN_DAY } from "./constants";

export function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export function validateInterval(
  start: number,
  end: number,
  currentTime: number
): ValidationResult {
  if (isNaN(start) || isNaN(end)) {
    return { ok: false, reason: "Please enter valid times." };
  }
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    return { ok: false, reason: "Times must be whole minutes." };
  }
  if (start < 0 || end > MINUTES_IN_DAY) {
    return { ok: false, reason: `Times must be within 00:00–24:00 (0–${MINUTES_IN_DAY} minutes).` };
  }
  if (start >= end) {
    return { ok: false, reason: "Start time must be earlier than end time." };
  }
  if (start <= currentTime) {
    return {
      ok: false,
      reason: `Start time must be after the current time (${minutesToLabel(currentTime)}).`,
    };
  }
  if (end - start > MAX_BOOKING_MINUTES) {
    return { ok: false, reason: `Bookings cannot be longer than ${MAX_BOOKING_MINUTES} minutes.` };
  }
  return { ok: true, reason: "" };
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Touching endpoints are allowed: [10,20] and [20,30] do NOT overlap
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number,
  existingBookings: Booking[]
): CheckResult {
  if (!room) {
    return {
      decision: "unavailable",
      available: false,
      message: "Select a room",
      details: ["Please choose a room to check availability."],
    };
  }

  const validation = validateInterval(start, end, currentTime);
  if (!validation.ok) {
    return {
      decision: "unavailable",
      available: false,
      message: "Invalid interval",
      details: [validation.reason],
    };
  }

  if (room.blocked) {
    return {
      decision: "unavailable",
      available: false,
      message: "Room is blocked",
      details: [
        `${room.name} is currently blocked and cannot be booked. Please choose another room.`,
      ],
    };
  }

  const conflicts = existingBookings.filter(
    (b) => b.roomId === room.id && overlaps(start, end, b.start, b.end)
  );

  if (conflicts.length > 0) {
    return {
      decision: "unavailable",
      available: false,
      message: "Time slot unavailable",
      details: [
        `${room.name} is not available from ${minutesToLabel(start)} to ${minutesToLabel(end)}.`,
        ...conflicts.map(
          (b) =>
            `• ${b.title} — ${minutesToLabel(b.start)} to ${minutesToLabel(b.end)}`
        ),
      ],
    };
  }

  return {
    decision: "available",
    available: true,
    message: "Room is available!",
    details: [
      `${room.name} is available from ${minutesToLabel(start)} to ${minutesToLabel(end)}.`,
      `Duration: ${end - start} min. Capacity: ${room.capacity}. Type: ${room.type}.`,
    ],
  };
}

/**
 * Checks availability using the room's OWN bookings.
 * Delegates to checkAvailability so validation, blocked-room and overlap rules
 * stay in a single place.
 */
export function checkRoomAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number
): CheckResult {
  return checkAvailability(room, start, end, currentTime, room ? room.bookings : []);
}
