import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, Eye, FileText } from "lucide-react";
import { InspectionRecord } from "@/types/inspection";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "@/lib/utils";

export const RecentInspectionsTable: React.FC<{ inspections: InspectionRecord[] }> = ({
  inspections,
}) => {
  if (!inspections || inspections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[220px]">
        <FileText className="w-10 h-10 text-slate-300 mb-2" />
        <h4 className="font-bold text-sm text-slate-700">No Inspections Yet</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-xs">
          Start by running an automated compliance audit on a packaged commodity label.
        </p>
        <Link
          href="/inspections/new"
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          + New Inspection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Recent Compliance Inspections</h3>
          <p className="text-xs text-slate-500">Live records retrieved directly from persistent storage</p>
        </div>
        <Link
          href="/history"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Inspection ID</th>
              <th className="py-3 px-4">Commodity / Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Violations</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.map((ins) => (
              <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-600">
                  <Link href={`/inspections/${encodeURIComponent(ins.id)}`} className="hover:text-indigo-600">
                    {ins.id}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                    {ins.product_name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                    {ins.brand_or_mfg || "Unspecified"}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{ins.category}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={ins.status} size="sm" />
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-black text-xs ${
                      ins.score >= 90
                        ? "text-emerald-600"
                        : ins.score >= 70
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {ins.score}/100
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700">
                  {ins.violations_count > 0 ? (
                    <span className="text-rose-600 font-bold">{ins.violations_count} failed</span>
                  ) : (
                    <span className="text-emerald-600">0 violations</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/inspections/${encodeURIComponent(ins.id)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
