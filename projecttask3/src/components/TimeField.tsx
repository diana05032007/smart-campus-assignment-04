import { MINUTES_IN_DAY } from "@/constants";
import { minutesToLabel } from "@/availability";

interface TimeFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  parsedMinutes: number | null;
  onChange: (value: string) => void;
}

/** One minutes-from-midnight input with its HH:MM preview. */
export default function TimeField({
  id,
  label,
  placeholder,
  value,
  parsedMinutes,
  onChange,
}: TimeFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={0}
          max={MINUTES_IN_DAY}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
        />
        {parsedMinutes !== null && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {minutesToLabel(parsedMinutes)}
          </span>
        )}
      </div>
    </div>
  );
}
