import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: "indigo" | "emerald" | "rose" | "amber";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = "indigo",
}) => {
  const schemeStyles = {
    indigo: {
      bg: "bg-white",
      iconBg: "bg-indigo-50 text-indigo-600",
      border: "border-slate-200",
    },
    emerald: {
      bg: "bg-white",
      iconBg: "bg-emerald-50 text-emerald-600",
      border: "border-slate-200",
    },
    rose: {
      bg: "bg-white",
      iconBg: "bg-rose-50 text-rose-600",
      border: "border-slate-200",
    },
    amber: {
      bg: "bg-white",
      iconBg: "bg-amber-50 text-amber-600",
      border: "border-slate-200",
    },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div className={cn("p-5 rounded-2xl border shadow-sm flex flex-col justify-between", style.bg, style.border)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", style.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded",
                trend.isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
