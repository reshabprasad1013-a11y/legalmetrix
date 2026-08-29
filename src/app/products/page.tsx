"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Search, ChevronRight, Layers, Eye, Plus, ArrowUpDown } from "lucide-react";
import { ProductSummary } from "@/lib/db/localStore";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      search === "" ||
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inspected Commodities &amp; Products
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catalog of tracked packaged commodity brands and historical compliance track records.
          </p>
        </div>

        <Link
          href="/inspections/new"
          className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Inspect New Product</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commodity name, brand, category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500">Loading products catalog...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="font-bold text-sm text-slate-700">No Commodities Found</h4>
            <p className="text-xs text-slate-400 mt-1">Inspected products will automatically aggregate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Commodity / Product Name</th>
                  <th className="py-3.5 px-4">Manufacturer / Packer</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Inspections</th>
                  <th className="py-3.5 px-4">Latest Score</th>
                  <th className="py-3.5 px-4">Latest Status</th>
                  <th className="py-3.5 px-4">Last Inspected</th>
                  <th className="py-3.5 px-4 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/products/${encodeURIComponent(prod.product_name)}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 block max-w-[220px] truncate"
                      >
                        {prod.product_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">
                      {prod.manufacturer || "Unspecified"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{prod.category}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono">
                        {prod.total_inspections}x
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-black text-xs ${
                          prod.latest_score >= 90
                            ? "text-emerald-600"
                            : prod.latest_score >= 70
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {prod.latest_score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={prod.latest_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(prod.last_inspected_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/products/${encodeURIComponent(prod.product_name)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                      >
                        <span>History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
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
