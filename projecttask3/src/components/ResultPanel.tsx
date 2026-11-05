import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { CheckResult, Decision } from "@/types";

interface ResultPanelProps {
  result: CheckResult;
  onReset: () => void;
}

// One style table replaces the repeated decision ternaries.
const STYLES: Record<
  Decision,
  { panel: string; badge: string; title: string; detail: string }
> = {
  available: {
    panel: "border-emerald-300 bg-emerald-50",
    badge: "bg-emerald-500 animate-in fade-in zoom-in duration-300",
    title: "text-emerald-700",
    detail: "text-emerald-700/80",
  },
  unavailable: {
    panel: "border-red-300 bg-red-50",
    badge: "bg-red-500 animate-in fade-in zoom-in duration-300",
    title: "text-red-700",
    detail: "text-red-700/80",
  },
  idle: {
    panel: "border-slate-200 bg-white",
    badge: "bg-slate-200",
    title: "text-slate-600",
    detail: "text-slate-500",
  },
};

function DecisionIcon({ decision }: { decision: Decision }) {
  if (decision === "available") return <CheckCircle2 className="w-7 h-7 text-white" />;
  if (decision === "unavailable") return <XCircle className="w-7 h-7 text-white" />;
  return <Info className="w-6 h-6 text-slate-400" />;
}

export default function ResultPanel({ result, onReset }: ResultPanelProps) {
  const style = STYLES[result.decision];

  return (
    <section
      className={`rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300 ${style.panel}`}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${style.badge}`}
          >
            <DecisionIcon decision={result.decision} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-xl font-bold leading-tight ${style.title}`}>
            {result.message}
          </h3>
          <ul className="mt-2 space-y-1">
            {result.details.map((d, i) => (
              <li key={i} className={`text-sm ${style.detail}`}>
                {d}
              </li>
            ))}
          </ul>

          {result.decision !== "idle" && (
            <button
              onClick={onReset}
              className="mt-4 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors underline underline-offset-2"
            >
              Reset and try another slot
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
