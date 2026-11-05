export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  type: string;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number; // minutes from 00:00
  title: string;
}

export type Decision = "available" | "unavailable" | "idle";

export interface ValidationResult {
  ok: boolean;
  reason: string;
}

export interface CheckResult {
  decision: Decision;
  available: boolean;
  message: string;
  details: string[];
}
