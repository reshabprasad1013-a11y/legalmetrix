"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import { InspectionResults } from "@/components/inspection/InspectionResults";
import { InspectionRecord } from "@/types/inspection";

export default function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [inspection, setInspection] = useState<InspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInspection();
  }, [resolvedParams.id]);

  const fetchInspection = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/inspections/${encodeURIComponent(resolvedParams.id)}`);
      if (!res.ok) {
        throw new Error("Inspection record not found in database.");
      }
      const data = await res.json();
      setInspection(data.inspection);
    } catch (err: any) {
      console.error("Fetch inspection error:", err);
      setError(err.message || "Failed to load inspection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this inspection record?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/inspections/${encodeURIComponent(resolvedParams.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/history");
      } else {
        alert("Failed to delete inspection.");
      }
    } catch (err) {
      alert("Error deleting inspection.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving inspection audit record...</p>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Record Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error || "Could not find inspection record with ID " + resolvedParams.id}</p>
        <Link
          href="/history"
          className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all"
        >
          Return to Inspection History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </Link>

        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-3.5 py-2 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Record"}</span>
        </button>
      </div>

      <InspectionResults inspection={inspection} isSaved={true} />
    </div>
  );
}
