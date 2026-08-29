"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileCheck2, FileDown, Search, Eye, Filter, Sparkles, ShieldCheck } from "lucide-react";
import { InspectionRecord } from "@/types/inspection";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { PROTOTYPE_LEGAL_DISCLAIMER } from "@/lib/compliance/standards";

export default function ReportsPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inspections");
      if (res.ok) {
        const data = await res.json();
        setInspections(data.inspections || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = inspections.filter(
    (ins) =>
      search === "" ||
      ins.id.toLowerCase().includes(search.toLowerCase()) ||
      ins.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (ins.brand_or_mfg && ins.brand_or_mfg.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Compliance Audit Reports
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, preview, and download formal Legal Metrology compliance inspection audit reports.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-indigo-950">Statutory Notice &amp; Disclaimer</span>
          <p className="text-indigo-800 text-[11px] leading-relaxed mt-0.5">
            {PROTOTYPE_LEGAL_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by ID, product, brand..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading audit reports...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <FileCheck2 className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-bold text-sm text-slate-700">No Compliance Reports Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Execute a new inspection to automatically generate exportable compliance audit reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ins) => (
            <div
              key={ins.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {ins.id}
                  </span>
                  <StatusBadge status={ins.status} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                  {ins.product_name}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {ins.brand_or_mfg || "Unspecified"} • {ins.category}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 text-xs mb-4 space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compliance Score:</span>
                    <span className="font-black text-slate-900">{ins.score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Violations Identified:</span>
                    <span className="font-bold text-slate-800">{ins.violations_count}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Date Inspected:</span>
                    <span className="text-slate-600 font-mono">{formatDate(ins.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  href={`/inspections/${encodeURIComponent(ins.id)}`}
                  className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>

                <a
                  href={`/api/inspections/${encodeURIComponent(ins.id)}/pdf`}
                  download
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
