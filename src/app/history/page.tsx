"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  FileDown,
  Trash2,
  Calendar,
  Layers,
  ArrowUpDown,
  Plus,
  RefreshCw,
} from "lucide-react";
import { InspectionRecord } from "@/types/inspection";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { COMMODITY_CATEGORIES } from "@/lib/compliance/standards";

export default function HistoryPage() {
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [scoreSort, setScoreSort] = useState<"desc" | "asc" | "none">("none");

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inspections");
      if (res.ok) {
        const data = await res.json();
        setInspections(data.inspections || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort
  const filtered = inspections.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.brand_or_mfg && item.brand_or_mfg.toLowerCase().includes(search.toLowerCase())) ||
      (item.batch_number && item.batch_number.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (scoreSort === "desc") return b.score - a.score;
    if (scoreSort === "asc") return a.score - b.score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inspection History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logs and saved Legal Metrology inspection evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInspections}
            className="p-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/inspections/new"
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Inspection</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, ID, batch..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="NON-COMPLIANT">Non-Compliant Only</option>
              <option value="REVIEW REQUIRED">Review Required Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {COMMODITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Score Sorting */}
          <div>
            <button
              type="button"
              onClick={() =>
                setScoreSort((prev) => (prev === "none" ? "desc" : prev === "desc" ? "asc" : "none"))
              }
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-900 flex items-center justify-between"
            >
              <span>
                Sort Score: {scoreSort === "desc" ? "Highest First" : scoreSort === "asc" ? "Lowest First" : "Default (Recent)"}
              </span>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading audit history...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-slate-700">No inspection records match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search terms or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Inspection ID</th>
                  <th className="py-3.5 px-4">Commodity / Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date &amp; Time</th>
                  <th className="py-3.5 px-4">Compliance Status</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Violations</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      <Link href={`/inspections/${encodeURIComponent(ins.id)}`} className="hover:underline">
                        {ins.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <span className="font-bold text-slate-900 block truncate">
                        {ins.product_name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {ins.brand_or_mfg || "Unspecified"} • Batch: {ins.batch_number || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{ins.category}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(ins.created_at)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ins.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {ins.violations_count > 0 ? (
                        <span className="text-rose-600 font-bold">{ins.violations_count} failed</span>
                      ) : (
                        <span className="text-emerald-600">0 violations</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/inspections/${encodeURIComponent(ins.id)}`}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                          title="View Full Inspection Audit"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a
                          href={`/api/inspections/${encodeURIComponent(ins.id)}/pdf`}
                          download
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                          title="Download PDF Report"
                        >
                          <FileDown className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
