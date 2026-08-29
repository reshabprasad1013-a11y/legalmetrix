import React from "react";
import { cn } from "@/lib/utils";
import { ShieldAlert, AlertCircle, Info } from "lucide-react";

interface SeverityBadgeProps {
  severity: "Critical" | "Major" | "Minor" | string;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className }) => {
  const norm = (severity || "").toLowerCase();

  if (norm === "critical") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-300 shadow-sm",
          className
        )}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
        Critical
      </span>
    );
  }

  if (norm === "major") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-sm",
          className
        )}
      >
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        Major
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-sm",
        className
      )}
    >
      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
      Minor
    </span>
  );
};
