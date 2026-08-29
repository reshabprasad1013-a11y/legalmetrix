"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus, Sparkles, ShieldCheck } from "lucide-react";
import { SAMPLE_PACKAGES } from "@/lib/demo/sampleData";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();

  const getTitle = () => {
    if (pathname === "/") return "Inspection Dashboard";
    if (pathname.startsWith("/inspections/new")) return "New Package Inspection";
    if (pathname.startsWith("/inspections/")) return "Inspection Assessment Result";
    if (pathname.startsWith("/history")) return "Inspection History Records";
    if (pathname.startsWith("/reports")) return "Compliance Audit Reports";
    if (pathname.startsWith("/products")) return "Commodities & Products Catalog";
    if (pathname.startsWith("/settings")) return "Compliance Rules & Configuration";
    return "LegalMetrix";
  };

  const handleQuickLoadSample = (sampleId: string) => {
    router.push(`/inspections/new?sample=${encodeURIComponent(sampleId)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {getTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Demo Sample Dropdown */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Demo:
          </span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleQuickLoadSample(e.target.value);
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>
              Select Sample Commodity...
            </option>
            {SAMPLE_PACKAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id.includes("COMPLIANT") ? "100% Pass" : s.id.includes("PARTIAL") ? "Partial Pass" : "Violations"})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action */}
        <Link
          href="/inspections/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection</span>
        </Link>
      </div>
    </header>
  );
};
