import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Building2,
  Info,
} from "lucide-react";
import type { Room, Decision } from "@/types";
import { rooms as sampleRooms, bookings as sampleBookings, CURRENT_TIME } from "@/sampleData";
import { checkAvailability, minutesToLabel, validateInterval } from "@/availability";
import RoomCard from "@/components/RoomCard";
import Timeline from "@/components/Timeline";

export default function App() {
  const [roomList] = useState<Room[]>(sampleRooms);
  const [bookingList] = useState(sampleBookings);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");

  const selectedRoom = useMemo(
    () => roomList.find((r) => r.id === selectedRoomId) ?? null,
    [roomList, selectedRoomId]
  );

  const roomBookings = useMemo(
    () => (selectedRoom ? bookingList.filter((b) => b.roomId === selectedRoom.id) : []),
    [bookingList, selectedRoom]
  );

  const startMin = startStr ? Number(startStr) : NaN;
  const endMin = endStr ? Number(endStr) : NaN;
  const validStart = !isNaN(startMin) ? startMin : null;
  const validEnd = !isNaN(endMin) ? endMin : null;

  // Live validation feedback for the inputs
  const liveValidation = useMemo(() => {
    if (isNaN(startMin) || isNaN(endMin)) return null;
    return validateInterval(startMin, endMin, CURRENT_TIME);
  }, [startMin, endMin]);

  const result = useMemo(() => {
    if (!selectedRoom || isNaN(startMin) || isNaN(endMin)) {
      return {
        decision: "idle" as Decision,
        available: false,
        message: "Awaiting input",
        details: ["Select a room and enter a time interval to check availability."],
      };
    }
    return checkAvailability(selectedRoom, startMin, endMin, CURRENT_TIME, bookingList);
  }, [selectedRoom, startMin, endMin, bookingList]);

  const handleReset = () => {
    setSelectedRoomId(null);
    setStartStr("");
    setEndStr("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              Smart Campus — Room Availability
            </h1>
            <p className="text-xs text-slate-400">
              Check whether a room is free for your desired time slot.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-600">
              {minutesToLabel(CURRENT_TIME)}
            </span>
            <span className="hidden sm:inline">current time</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Room selection */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              1. Select a Room
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roomList.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                selected={room.id === selectedRoomId}
                onSelect={() => setSelectedRoomId(room.id)}
              />
            ))}
          </div>
        </section>

        {/* Time input + timeline */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              2. Enter Time Interval
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Start time (minutes from 00:00)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                  placeholder="e.g. 600"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                />
                {validStart !== null && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    {minutesToLabel(validStart)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                End time (minutes from 00:00)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                  placeholder="e.g. 660"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                />
                {validEnd !== null && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    {minutesToLabel(validEnd)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inline validation hint */}
          {liveValidation && !liveValidation.ok && (
            <div className="mb-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{liveValidation.reason}</span>
            </div>
          )}

          {validStart !== null && validEnd !== null && !isNaN(startMin) && !isNaN(endMin) && (
            <div className="mb-4 text-xs text-slate-500">
              Duration:{" "}
              <span className="font-semibold text-slate-700">
                {endMin - startMin > 0 ? `${endMin - startMin} min` : "—"}
              </span>
            </div>
          )}

          {/* Timeline */}
          {selectedRoom && (
            <div className="mt-2 pt-4 border-t border-slate-100">
              <Timeline
                bookings={roomBookings}
                candidateStart={validStart}
                candidateEnd={validEnd}
                currentTime={CURRENT_TIME}
              />
            </div>
          )}
        </section>

        {/* Result panel */}
        <section
          className={[
            "rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300",
            result.decision === "available"
              ? "border-emerald-300 bg-emerald-50"
              : result.decision === "unavailable"
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="shrink-0">
              {result.decision === "available" ? (
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              ) : result.decision === "unavailable" ? (
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <Info className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                className={[
                  "text-lg sm:text-xl font-bold leading-tight",
                  result.decision === "available"
                    ? "text-emerald-700"
                    : result.decision === "unavailable"
                      ? "text-red-700"
                      : "text-slate-600",
                ].join(" ")}
              >
                {result.message}
              </h3>
              <ul className="mt-2 space-y-1">
                {result.details.map((d, i) => (
                  <li
                    key={i}
                    className={[
                      "text-sm",
                      result.decision === "available"
                        ? "text-emerald-700/80"
                        : result.decision === "unavailable"
                          ? "text-red-700/80"
                          : "text-slate-500",
                    ].join(" ")}
                  >
                    {d}
                  </li>
                ))}
              </ul>

              {/* Reset */}
              {result.decision !== "idle" && (
                <button
                  onClick={handleReset}
                  className="mt-4 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors underline underline-offset-2"
                >
                  Reset and try another slot
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Legend */}
        <section className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-slate-400/80" /> Existing booking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded border-2 border-dashed border-sky-500 bg-sky-400/20" />
            Your slot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-amber-500" /> Current time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-slate-200" /> Past hours
          </span>
        </section>

        <footer className="text-center text-xs text-slate-400 pt-2 pb-4">
          Prototype uses fictional sample data. No real bookings are created or modified.
        </footer>
      </main>
    </div>
  );
}
