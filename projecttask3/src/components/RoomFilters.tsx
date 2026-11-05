import { Users, Wrench } from "lucide-react";
import Notice from "./Notice";

interface RoomFiltersProps {
  attendeesStr: string;
  attendeesError: string | null;
  onAttendeesChange: (value: string) => void;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
  matchCount: number;
  totalCount: number;
}

export default function RoomFilters({
  attendeesStr,
  attendeesError,
  onAttendeesChange,
  equipmentOptions,
  selectedEquipment,
  onToggleEquipment,
  onClear,
  matchCount,
  totalCount,
}: RoomFiltersProps) {
  const hasFilters = attendeesStr.trim() !== "" || selectedEquipment.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4">
        <div>
          <label
            htmlFor="attendees-filter"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Attendees (minimum capacity)
          </label>
          <input
            id="attendees-filter"
            type="number"
            min={1}
            step={1}
            value={attendeesStr}
            onChange={(e) => onAttendeesChange(e.target.value)}
            placeholder="e.g. 20"
            aria-invalid={attendeesError !== null}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
          />
        </div>

        <fieldset>
          <legend className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
            <Wrench className="w-3.5 h-3.5" />
            Required equipment (room must have all selected)
          </legend>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((item) => {
              const checked = selectedEquipment.includes(item);
              return (
                <label
                  key={item}
                  className={[
                    "flex items-center gap-1.5 text-xs rounded-full border px-3 py-1.5 cursor-pointer transition-colors",
                    checked
                      ? "border-sky-500 bg-sky-50 text-sky-700 font-semibold"
                      : "border-slate-300 bg-white text-slate-600 hover:border-sky-300",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEquipment(item)}
                    className="accent-sky-600"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {attendeesError && (
        <Notice role="alert" className="mt-3">
          {attendeesError} The capacity filter is not applied.
        </Notice>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span role="status" aria-live="polite">
          Showing {matchCount} of {totalCount} rooms
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="font-semibold text-slate-500 hover:text-sky-600 transition-colors underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
