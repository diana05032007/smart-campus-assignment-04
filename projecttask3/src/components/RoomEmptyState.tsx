import { Search } from "lucide-react";

interface RoomEmptyStateProps {
  onClear: () => void;
}

export default function RoomEmptyState({ onClear }: RoomEmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center text-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-8"
    >
      <Search className="w-8 h-8 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">No rooms match your filters</p>
      <p className="text-xs text-slate-500">
        Try lowering the attendee count or removing some required equipment.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 text-xs font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2"
      >
        Clear filters
      </button>
    </div>
  );
}
