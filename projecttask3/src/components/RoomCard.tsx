import { DoorClosed, DoorOpen, Lock, Users, MapPin } from "lucide-react";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}

export default function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={room.blocked}
      className={[
        "w-full text-left rounded-xl border-2 p-3 transition-all duration-200",
        "flex flex-col gap-2 group",
        room.blocked
          ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
          : selected
            ? "border-sky-500 bg-sky-50 shadow-sm ring-2 ring-sky-200"
            : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {room.blocked ? (
            <Lock className="w-4 h-4 text-slate-400" />
          ) : selected ? (
            <DoorOpen className="w-4 h-4 text-sky-600" />
          ) : (
            <DoorClosed className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
          )}
          <span
            className={[
              "font-semibold text-sm",
              room.blocked
                ? "text-slate-400"
                : selected
                  ? "text-sky-700"
                  : "text-slate-700",
            ].join(" ")}
          >
            {room.name}
          </span>
        </div>
        {room.blocked && (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
            BLOCKED
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {room.building}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {room.capacity}
        </span>
        <span className="text-slate-400">{room.type}</span>
      </div>

      <div className="text-[11px] text-slate-500">
        <span className="font-semibold text-slate-400">Equipment: </span>
        {room.equipment.length > 0 ? room.equipment.join(", ") : "None"}
      </div>
    </button>
  );
}
