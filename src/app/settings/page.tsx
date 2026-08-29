"use client";

import React, { useEffect, useState } from "react";
import { Settings, ShieldCheck, Scale, Check, RefreshCw, Key, Database, Info } from "lucide-react";
import { StoredRuleConfig } from "@/lib/db/localStore";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { PROTOTYPE_LEGAL_DISCLAIMER } from "@/lib/compliance/standards";

export default function SettingsPage() {
  const [rules, setRules] = useState<StoredRuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          is_active: !currentActive,
        }),
      });

      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: !currentActive } : r))
        );
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch (err) {
      alert("Failed to update rule status.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Compliance Rules &amp; Engine Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure statutory Legal Metrology rules, adjust active validations, and view integration status.
        </p>
      </div>

      {/* System Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Key className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">Vision AI Providers</h3>
          </div>
          <p className="text-xs text-slate-500">
            Google Gemini 2.0 Flash &amp; OpenAI GPT-4o Vision endpoints configured via environment variables.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Engine Ready (with Local Heuristic Fallback)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Database className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">Persistence Adapter</h3>
          </div>
          <p className="text-xs text-slate-500">
            Dual-adapter architecture supporting Supabase PostgreSQL and local zero-config persistent storage.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Active: Resilient Local Store / Supabase Ready</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Scale className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900">Rule Framework</h3>
          </div>
          <p className="text-xs text-slate-500">
            Based on Legal Metrology (Packaged Commodities) Rules, 2011 and official amendments.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>{rules.filter((r) => r.is_active).length} Active Statutory Checks</span>
          </div>
        </div>
      </div>

      {/* Rules Configuration Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Configurable Statutory Compliance Rules</h3>
            <p className="text-xs text-slate-500">
              Enable or disable specific validation checks for customized inspection requirements.
            </p>
          </div>
          <button
            onClick={fetchRules}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600"
            title="Refresh rules"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {rule.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{rule.name}</h4>
                    <SeverityBadge severity={rule.severity} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
                  <span className="inline-block text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1">
                    {rule.legal_reference}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {savedId === rule.id && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Updated
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleRule(rule.id, rule.is_active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      rule.is_active ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.is_active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-bold text-slate-700 w-16">
                    {rule.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mandatory Prototype Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
        <p className="font-bold text-slate-700 mb-1">Legal Notice:</p>
        <p className="text-[11px] leading-relaxed text-slate-500">{PROTOTYPE_LEGAL_DISCLAIMER}</p>
      </div>
    </div>
  );
}
