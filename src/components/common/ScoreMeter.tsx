import React from "react";
import { cn } from "@/lib/utils";

interface ScoreMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  size = "md",
  showLabel = true,
  className,
}) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  let color = "text-emerald-500 stroke-emerald-500";
  let bgStroke = "stroke-emerald-100";
  let scoreGrade = "Compliant";

  if (safeScore < 70) {
    color = "text-rose-500 stroke-rose-500";
    bgStroke = "stroke-rose-100";
    scoreGrade = "Non-Compliant";
  } else if (safeScore < 90) {
    color = "text-amber-500 stroke-amber-500";
    bgStroke = "stroke-amber-100";
    scoreGrade = "Review Needed";
  }

  // Circular dimensions
  const dimensions = {
    sm: { size: 64, stroke: 6, text: "text-base", subtext: "text-[9px]" },
    md: { size: 100, stroke: 9, text: "text-2xl", subtext: "text-xs" },
    lg: { size: 140, stroke: 12, text: "text-4xl", subtext: "text-sm" },
  };

  const dim = dimensions[size];
  const radius = (dim.size - dim.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className={cn("inline-flex flex-col items-center justify-center", className)}>
      <div className="relative flex items-center justify-center">
        <svg width={dim.size} height={dim.size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={dim.size / 2}
            cy={dim.size / 2}
            r={radius}
            className={cn("fill-transparent", bgStroke)}
            strokeWidth={dim.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={dim.size / 2}
            cy={dim.size / 2}
            r={radius}
            className={cn("fill-transparent transition-all duration-1000 ease-out", color)}
            strokeWidth={dim.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={cn("font-extrabold text-slate-900 tracking-tight", dim.text)}>
            {safeScore}
          </span>
          <span className={cn("font-medium text-slate-400 -mt-1", dim.subtext)}>/100</span>
        </div>
      </div>

      {showLabel && (
        <span
          className={cn(
            "mt-2 font-bold tracking-wide uppercase text-xs px-2 py-0.5 rounded",
            safeScore >= 90
              ? "text-emerald-700 bg-emerald-50"
              : safeScore >= 70
              ? "text-amber-700 bg-amber-50"
              : "text-rose-700 bg-rose-50"
          )}
        >
          {scoreGrade}
        </span>
      )}
    </div>
  );
};
