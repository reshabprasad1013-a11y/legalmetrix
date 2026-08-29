"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Calendar, Activity, Plus, Eye, FileDown } from "lucide-react";
import { ProductSummary } from "@/lib/db/localStore";
import { InspectionRecord } from "@/types/inspection";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [resolvedParams.name]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${encodeURIComponent(resolvedParams.name)}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setInspections(data.inspections || []);
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading commodity inspection history...</span>
      </div>
    );
  }

  const decodedName = decodeURIComponent(resolvedParams.name);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <Link
          href="/inspections/new"
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Inspection for this Product</span>
        </Link>
      </div>

      {/* Product Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              {product?.category || "Commodity Profile"}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{decodedName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manufacturer: <strong>{product?.manufacturer || "Unspecified"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Runs</span>
            <span className="text-xl font-black text-slate-900">{inspections.length}</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Score</span>
            <span className="text-xl font-black text-indigo-600">{product?.latest_score || 0}%</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
            {product?.latest_status && <StatusBadge status={product.latest_status} size="sm" />}
          </div>
        </div>
      </div>

      {/* Inspections History for this Product */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm">All Historical Inspections</h3>
          <p className="text-xs text-slate-500">Chronological inspection records for {decodedName}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Batch / Lot</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Violations</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                    <Link href={`/inspections/${encodeURIComponent(ins.id)}`} className="hover:underline">
                      {ins.id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {formatDate(ins.created_at)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{ins.batch_number || "N/A"}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ins.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-black text-xs">
                    <span
                      className={
                        ins.score >= 90
                          ? "text-emerald-600"
                          : ins.score >= 70
                          ? "text-amber-600"
                          : "text-rose-600"
                      }
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
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/inspections/${encodeURIComponent(ins.id)}`}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={`/api/inspections/${encodeURIComponent(ins.id)}/pdf`}
                        download
                        className="p-1.5 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
