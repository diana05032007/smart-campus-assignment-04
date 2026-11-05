import type { ReactNode } from "react";
import { Info } from "lucide-react";

interface NoticeProps {
  children: ReactNode;
  role?: "alert" | "status";
  className?: string; // spacing supplied by the caller, e.g. "mb-4"
}

/** Amber inline notice used for validation hints, warnings and selection messages. */
export default function Notice({ children, role, className = "" }: NoticeProps) {
  return (
    <div
      role={role}
      className={`flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 ${className}`.trim()}
    >
      <Info className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
