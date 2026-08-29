import React from "react";
import { ShieldAlert, AlertCircle, Info } from "lucide-react";
import { SeverityBadge } from "../common/SeverityBadge";

interface CommonViolation {
  count: number;
  name: string;
  severity: string;
  rule_id: string;
}

export const ViolationLeaderboard: React.FC<{ violations: CommonViolation[] }> = ({
  violations,
}) => {
  if (!violations || violations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center min-h-[220px]">
        <ShieldAlert className="w-8 h-8 text-slate-300 mb-2" />
        <h4 className="font-bold text-sm text-slate-700">No Common Violations Recorded</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          As inspections are executed and saved, recurring Legal Metrology rule non-compliances will appear here.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...violations.map((v) => v.count), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="font-bold text-slate-900 text-sm">Most Common Statutory Violations</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold">Frequency</span>
      </div>

      <div className="space-y-3.5">
        {violations.map((v) => {
          const percent = Math.round((v.count / maxCount) * 100);
          return (
            <div key={v.rule_id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 max-w-[80%]">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    {v.rule_id}
                  </span>
                  <span className="font-bold text-slate-800 truncate">{v.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SeverityBadge severity={v.severity} />
                  <span className="font-black text-slate-900">{v.count}x</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    v.severity === "Critical" ? "bg-rose-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
