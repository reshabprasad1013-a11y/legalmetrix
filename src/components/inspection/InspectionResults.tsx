"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileDown,
  Save,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import { InspectionRecord, RuleResult } from "@/types/inspection";
import { ScoreMeter } from "../common/ScoreMeter";
import { StatusBadge } from "../common/StatusBadge";
import { SeverityBadge } from "../common/SeverityBadge";
import { formatDate } from "@/lib/utils";
import { PROTOTYPE_LEGAL_DISCLAIMER } from "@/lib/compliance/standards";

interface InspectionResultsProps {
  inspection: InspectionRecord;
  onSave?: () => Promise<void>;
  isSaved?: boolean;
  isSaving?: boolean;
}

export const InspectionResults: React.FC<InspectionResultsProps> = ({
  inspection,
  onSave,
  isSaved = false,
  isSaving = false,
}) => {
  const [filterTab, setFilterTab] = useState<"ALL" | "FAIL" | "PASS" | "REVIEW REQUIRED">("ALL");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const evaluation = inspection.evaluation;
  const summary = evaluation.summary;

  const filteredRules = evaluation.rule_results.filter((r) => {
    if (filterTab === "ALL") return r.status !== "NOT APPLICABLE";
    return r.status === filterTab;
  });

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const res = await fetch(`/api/inspections/${encodeURIComponent(inspection.id)}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LegalMetrix_Audit_${inspection.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF report. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              ID: {inspection.id}
            </span>
            <StatusBadge status={inspection.status} size="md" />
            {inspection.is_demo && (
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                DEMO DATA
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {inspection.product_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Category: <strong className="text-slate-700">{inspection.category}</strong> • Inspected:{" "}
            {formatDate(inspection.created_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {onSave && !isSaved && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSave}
              className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 text-indigo-600" />
              <span>{isSaving ? "Saving..." : "Save to Database"}</span>
            </button>
          )}

          {isSaved && (
            <span className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Saved to Database
            </span>
          )}

          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleDownloadPdf}
            className="flex-1 md:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate Compliance Report (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Score and Summary Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Compliance Gauge */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Overall Compliance Score
          </span>
          <ScoreMeter score={inspection.score} size="lg" showLabel={true} />
          
          <div className="mt-4 pt-4 border-t border-slate-100 w-full text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">Calculation Methodology:</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deterministic penalty formula based on Legal Metrology Rule 6 violations: Critical (-25 pts), Major (-15 pts), Minor/Review (-5 pts).
            </p>
          </div>
        </div>

        {/* Right: Summary Metrics & Category Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-4">Inspection Summary Statistics</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Checked</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">
                  {summary.total_checked}
                </span>
                <span className="text-[10px] text-slate-400">Statutory Rules</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] font-semibold text-emerald-700 block">Passed</span>
                <span className="text-2xl font-black text-emerald-700 block mt-0.5">
                  {summary.passed_count}
                </span>
                <span className="text-[10px] text-emerald-600">Satisfies Rules</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="text-[11px] font-semibold text-rose-700 block">Violations</span>
                <span className="text-2xl font-black text-rose-700 block mt-0.5">
                  {summary.failed_count}
                </span>
                <span className="text-[10px] text-rose-600">
                  {summary.critical_violations} Critical • {summary.major_violations} Major
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-700 block">Review Required</span>
                <span className="text-2xl font-black text-amber-700 block mt-0.5">
                  {summary.review_count}
                </span>
                <span className="text-[10px] text-amber-600">Inspector Notice</span>
              </div>
            </div>

            {/* Category breakdown bars */}
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">
              Category-Level Compliance Scores
            </h4>
            <div className="space-y-2">
              {evaluation.category_scores.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.category}</span>
                    <span className="font-bold text-slate-900">{cat.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cat.score >= 90
                          ? "bg-emerald-500"
                          : cat.score >= 70
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Violations & Remediation Cards */}
      {evaluation.violations.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="font-black text-rose-950 text-base">
              Identified Non-Compliances ({evaluation.violations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.violations.map((v, i) => (
              <div
                key={v.rule_id}
                className="bg-white rounded-xl border border-rose-200 p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      {v.rule_id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{v.rule_name}</h4>
                  </div>
                  <SeverityBadge severity={v.severity} />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1">
                  <div className="text-slate-500 font-semibold">
                    Detected Value: <span className="font-mono text-rose-700 font-bold">{v.detected_value}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{v.explanation}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-indigo-950">Recommended Corrective Action:</span>
                    <span className="text-indigo-800">{v.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Evidence Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Visual Evidence &amp; Confirmed Fields</h3>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-950/5 rounded-xl border border-slate-200 p-3 flex items-center justify-center min-h-[280px]">
            {inspection.image_url ? (
              <img
                src={inspection.image_url}
                alt="Package Label Evidence"
                className="max-h-[320px] w-auto object-contain rounded"
              />
            ) : (
              <span className="text-xs text-slate-400">Image evidence stored</span>
            )}
          </div>

          <div className="lg:col-span-7 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Net Quantity</span>
                <span className="font-bold text-slate-900">{inspection.confirmed_data.net_quantity}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Maximum Retail Price</span>
                <span className="font-bold text-slate-900">{inspection.confirmed_data.mrp}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[10px]">Manufacturer &amp; Address</span>
              <span className="font-bold text-slate-900 block">
                {inspection.confirmed_data.manufacturer_name}
              </span>
              <span className="text-slate-600 block text-[11px]">
                {inspection.confirmed_data.manufacturer_address}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[10px]">Consumer Care Details</span>
              <span className="text-slate-800 block">
                Phone: <strong>{inspection.confirmed_data.consumer_care_phone || "Not detected"}</strong> • Email:{" "}
                <strong>{inspection.confirmed_data.consumer_care_email || "Not detected"}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Country of Origin</span>
                <span className="font-bold text-slate-900">{inspection.confirmed_data.country_of_origin}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Mfg / Pkg Date</span>
                <span className="font-bold text-slate-900">{inspection.confirmed_data.date_of_manufacture || inspection.confirmed_data.date_of_packing}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px]">Batch No.</span>
                <span className="font-bold text-slate-900">{inspection.confirmed_data.batch_number}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Rule Findings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Detailed Legal Metrology Rule Findings</h3>
            <p className="text-xs text-slate-500">
              Every checked statutory requirement evaluated according to the Packaged Commodities Rules 2011.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(["ALL", "FAIL", "PASS", "REVIEW REQUIRED"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "ALL" ? "All Rules" : tab === "FAIL" ? "Violations" : tab === "PASS" ? "Passed" : "Needs Review"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Requirement / Rule</th>
                <th className="py-3 px-4">Detected Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Regulatory Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.rule_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px]">
                    <span className="block">{rule.rule_name}</span>
                    <span className="text-[10px] text-slate-400 font-normal block font-mono">
                      {rule.legal_reference}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 max-w-[180px] truncate">
                    {rule.detected_value}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rule.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={rule.severity} />
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-[280px]">
                    {rule.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
        <p className="font-bold text-slate-700 mb-1">Regulatory Prototype Disclaimer:</p>
        <p className="text-[11px] leading-relaxed text-slate-500">{PROTOTYPE_LEGAL_DISCLAIMER}</p>
      </div>
    </div>
  );
};
