import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, size = "md" }) => {
  const norm = (status || "").toUpperCase();

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] font-bold gap-1",
    md: "px-3 py-1 text-xs font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-bold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  if (norm === "COMPLIANT" || norm === "PASS") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        <CheckCircle2 className={cn("text-emerald-600 shrink-0", iconSizes[size])} />
        <span>{norm}</span>
      </span>
    );
  }

  if (norm === "NON-COMPLIANT" || norm === "FAIL") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-red-50 text-red-800 border border-red-300 shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        <XCircle className={cn("text-red-600 shrink-0", iconSizes[size])} />
        <span>{norm}</span>
      </span>
    );
  }

  if (norm === "REVIEW REQUIRED" || norm === "REVIEW") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        <AlertTriangle className={cn("text-amber-600 shrink-0", iconSizes[size])} />
        <span>{norm}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200",
        sizeClasses[size],
        className
      )}
    >
      <MinusCircle className={cn("text-slate-500 shrink-0", iconSizes[size])} />
      <span>{norm || "N/A"}</span>
    </span>
  );
};
