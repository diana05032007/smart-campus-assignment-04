import { useState } from "react";
import { Clock, Calendar, Building2 } from "lucide-react";
import type { Room } from "@/types";
import { rooms as sampleRooms } from "@/data/roomCatalog";
import { CURRENT_TIME } from "@/constants";
import { minutesToLabel } from "@/availability";
import { useRoomAvailability } from "@/hooks/useRoomAvailability";
import RoomCard from "@/components/RoomCard";
import RoomFilters from "@/components/RoomFilters";
import RoomEmptyState from "@/components/RoomEmptyState";
import Timeline from "@/components/Timeline";
import TimeField from "@/components/TimeField";
import ResultPanel from "@/components/ResultPanel";
import Notice from "@/components/Notice";

export default function App() {
  const [roomList] = useState<Room[]>(sampleRooms);
  const vm = useRoomAvailability(roomList, CURRENT_TIME);
  const { evaluation } = vm;

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
          <RoomFilters
            attendeesStr={vm.attendeesStr}
            attendeesError={vm.attendeesError}
            onAttendeesChange={vm.setAttendees}
            equipmentOptions={vm.equipmentOptions}
            selectedEquipment={vm.requiredEquipment}
            onToggleEquipment={vm.toggleEquipmentFilter}
            onClear={vm.clearFilters}
            matchCount={vm.visibleRooms.length}
            totalCount={vm.totalRooms}
          />
          {vm.selectionNotice && (
            <Notice role="status" className="mb-3">
              {vm.selectionNotice}
            </Notice>
          )}
          {vm.visibleRooms.length === 0 ? (
            <RoomEmptyState onClear={vm.clearFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {vm.visibleRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={room.id === vm.selectedRoom?.id}
                  onSelect={() => vm.selectRoom(room.id)}
                />
              ))}
            </div>
          )}
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
            <TimeField
              id="start-time"
              label="Start time (minutes from 00:00)"
              placeholder="e.g. 600"
              value={vm.startStr}
              parsedMinutes={evaluation.start}
              onChange={vm.setStartStr}
            />
            <TimeField
              id="end-time"
              label="End time (minutes from 00:00)"
              placeholder="e.g. 660"
              value={vm.endStr}
              parsedMinutes={evaluation.end}
              onChange={vm.setEndStr}
            />
          </div>

          {/* Inline validation hint */}
          {evaluation.validation && !evaluation.validation.ok && (
            <Notice className="mb-4">{evaluation.validation.reason}</Notice>
          )}

          {evaluation.durationLabel && (
            <div className="mb-4 text-xs text-slate-500">
              Duration:{" "}
              <span className="font-semibold text-slate-700">{evaluation.durationLabel}</span>
            </div>
          )}

          {/* Timeline */}
          {vm.selectedRoom && (
            <div className="mt-2 pt-4 border-t border-slate-100">
              <Timeline
                bookings={vm.selectedRoom.bookings}
                candidateStart={evaluation.start}
                candidateEnd={evaluation.end}
                currentTime={CURRENT_TIME}
              />
            </div>
          )}
        </section>

        {/* Result panel */}
        <ResultPanel result={evaluation.result} onReset={vm.reset} />

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
