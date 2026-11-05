import type { Booking } from "@/types";
import { minutesToLabel } from "@/availability";

interface TimelineProps {
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
  currentTime: number;
}

const DAY_START = 0;
const DAY_END = 1440;
const TICK_INTERVAL = 120; // every 2 hours

export default function Timeline({
  bookings,
  candidateStart,
  candidateEnd,
  currentTime,
}: TimelineProps) {
  const span = DAY_END - DAY_START;

  const pct = (m: number) => ((m - DAY_START) / span) * 100;

  const ticks: number[] = [];
  for (let t = DAY_START; t <= DAY_END; t += TICK_INTERVAL) {
    ticks.push(t);
  }

  const hasCandidate =
    candidateStart !== null &&
    candidateEnd !== null &&
    candidateStart >= 0 &&
    candidateEnd <= 1440 &&
    candidateStart < candidateEnd;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Today's Schedule
        </span>
        <span className="text-xs text-slate-400">00:00 — 24:00</span>
      </div>

      {/* Track */}
      <div className="relative h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
        {/* Past-time overlay */}
        <div
          className="absolute inset-y-0 left-0 bg-slate-200/70"
          style={{ width: `${pct(currentTime)}%` }}
          title={`Past — before ${minutesToLabel(currentTime)}`}
        />

        {/* Current time marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-amber-500 z-20"
          style={{ left: `${pct(currentTime)}%` }}
        >
          <span className="absolute -top-0.5 -translate-x-1/2 text-[9px] font-bold text-amber-600 whitespace-nowrap">
            NOW
          </span>
        </div>

        {/* Existing bookings */}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute inset-y-1 rounded bg-slate-400/80 border border-slate-500 flex items-center px-1 overflow-hidden z-10"
            style={{
              left: `${pct(b.start)}%`,
              width: `${pct(b.end) - pct(b.start)}%`,
            }}
            title={`${b.title}: ${minutesToLabel(b.start)}–${minutesToLabel(b.end)}`}
          >
            <span className="text-[9px] text-white font-medium truncate hidden sm:inline">
              {b.title}
            </span>
          </div>
        ))}

        {/* Candidate interval */}
        {hasCandidate && (
          <div
            className="absolute inset-y-1 rounded border-2 border-dashed z-30 flex items-center justify-center"
            style={{
              left: `${pct(candidateStart!)}%`,
              width: `${pct(candidateEnd!) - pct(candidateStart!)}%`,
              borderColor: "#0ea5e9",
              backgroundColor: "rgba(14, 165, 233, 0.18)",
            }}
          >
            <span className="text-[9px] font-bold text-sky-700 truncate px-1 hidden sm:inline">
              Your slot
            </span>
          </div>
        )}
      </div>

      {/* Tick labels */}
      <div className="relative h-4 mt-1">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute text-[10px] text-slate-400 -translate-x-1/2"
            style={{ left: `${pct(t)}%` }}
          >
            {minutesToLabel(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
