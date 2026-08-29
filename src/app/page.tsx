"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ViolationLeaderboard } from "@/components/dashboard/ViolationLeaderboard";
import { RecentInspectionsTable } from "@/components/dashboard/RecentInspectionsTable";
import { InspectionRecord } from "@/types/inspection";

interface DashboardData {
  total_inspections: number;
  compliant_count: number;
  non_compliant_count: number;
  review_required_count: number;
  average_score: number;
  compliance_rate: number;
  recent_inspections: InspectionRecord[];
  common_violations: Array<{
    count: number;
    name: string;
    severity: string;
    rule_id: string;
  }>;
  category_breakdown: Array<{
    category: string;
    total: number;
    compliant: number;
    compliance_rate: number;
    avg_score: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      if (res.ok) {
        const stats = await res.json();
        setData(stats);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading live compliance statistics...</p>
      </div>
    );
  }

  const isEmpty = !data || data.total_inspections === 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Compliance Inspection Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time Legal Metrology Packaged Commodity verification status and audit analytics.
          </p>
        </div>

        <Link
          href="/inspections/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>+ New Inspection</span>
        </Link>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Inspection Records Found</h2>
          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            Upload your first commodity package label or test with one of the pre-loaded sample datasets to start generating compliance audit reports.
          </p>
          <Link
            href="/inspections/new"
            className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
          >
            Start Your First Inspection
          </Link>
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Inspections"
              value={data.total_inspections}
              subtitle="All saved package audits"
              icon={FileSearch}
              colorScheme="indigo"
            />
            <StatCard
              title="Compliant (Pass)"
              value={data.compliant_count}
              subtitle={`${data.compliance_rate}% compliance rate`}
              icon={CheckCircle2}
              colorScheme="emerald"
            />
            <StatCard
              title="Non-Compliant"
              value={data.non_compliant_count}
              subtitle="Violations identified"
              icon={XCircle}
              colorScheme="rose"
            />
            <StatCard
              title="Average Compliance Score"
              value={`${data.average_score}/100`}
              subtitle={`${data.review_required_count} pending review`}
              icon={Activity}
              colorScheme="amber"
            />
          </div>

          {/* Commodity Categories Breakdown Bar */}
          {data.category_breakdown && data.category_breakdown.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Compliance Distribution Across Commodity Categories
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.category_breakdown.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-800">{cat.category}</span>
                      <span className="font-black text-indigo-600">{cat.avg_score}% Avg</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${
                          cat.compliance_rate >= 80 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${cat.compliance_rate}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{cat.total} inspected</span>
                      <span className="font-semibold text-emerald-700">{cat.compliant} compliant</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Violations and Recent Inspections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <ViolationLeaderboard violations={data.common_violations} />
            </div>

            <div className="lg:col-span-8">
              <RecentInspectionsTable inspections={data.recent_inspections} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
