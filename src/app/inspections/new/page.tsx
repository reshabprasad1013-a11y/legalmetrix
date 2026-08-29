"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ImageUploader } from "@/components/inspection/ImageUploader";
import { ExtractionReview } from "@/components/inspection/ExtractionReview";
import { InspectionResults } from "@/components/inspection/InspectionResults";
import { CommodityCategory, InspectionRecord, PackageDeclarations } from "@/types/inspection";
import { evaluateCompliance } from "@/lib/compliance/engine";
import { CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Layers } from "lucide-react";

function NewInspectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSample = searchParams.get("sample");

  // Step state: 1 = Upload, 2 = Review/Edit, 3 = Results
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Workflow data
  const [imageSrc, setImageSrc] = useState<string>("");
  const [category, setCategory] = useState<CommodityCategory>("Food & Beverages");
  const [extractedData, setExtractedData] = useState<PackageDeclarations | null>(null);
  const [confirmedData, setConfirmedData] = useState<PackageDeclarations | null>(null);
  const [provider, setProvider] = useState<string>("gemini");
  const [currentInspection, setCurrentInspection] = useState<InspectionRecord | null>(null);

  // UI state
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async (payload: {
    imageBase64: string;
    imageMimeType: string;
    presetSampleId?: string;
    productName: string;
    category: CommodityCategory;
    manufacturer: string;
    batchNumber: string;
  }) => {
    try {
      setIsExtracting(true);
      setError(null);
      setImageSrc(payload.imageBase64);
      setCategory(payload.category);

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.declarations) {
        setExtractedData(data.declarations);
        setConfirmedData(data.declarations);
        setProvider(data.provider || "gemini");
        setStep(2); // Advance to Review step
      } else {
        throw new Error(data.error || "Extraction failed");
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze package label.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmAndEvaluate = async (
    confirmed: PackageDeclarations,
    selectedCategory: CommodityCategory
  ) => {
    setConfirmedData(confirmed);
    setCategory(selectedCategory);

    // Run deterministic rule engine
    const evaluation = evaluateCompliance(confirmed, selectedCategory);

    const inspectionId = `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: InspectionRecord = {
      id: inspectionId,
      product_name: confirmed.product_name || "Unknown Product",
      brand_or_mfg: confirmed.manufacturer_name || "Unspecified",
      category: selectedCategory,
      batch_number: confirmed.batch_number || "Not detected",
      image_url: imageSrc,
      image_filename: `${inspectionId.toLowerCase()}.jpg`,
      extracted_data: extractedData || confirmed,
      confirmed_data: confirmed,
      evaluation,
      status: evaluation.overall_status,
      score: evaluation.overall_score,
      violations_count: evaluation.violations.length,
      is_demo: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCurrentInspection(newRecord);
    setStep(3); // Advance to Results step

    // Auto-save to persistence layer
    try {
      setIsSaving(true);
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        setIsSaved(true);
      }
    } catch (e) {
      console.warn("Auto-save failed, user can save manually:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!currentInspection) return;
    try {
      setIsSaving(true);
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentInspection),
      });
      if (res.ok) {
        setIsSaved(true);
      }
    } catch (e) {
      alert("Failed to save inspection to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Progress Steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              1
            </span>
            <span className={`font-bold ${step >= 1 ? "text-slate-900" : "text-slate-400"}`}>
              Upload &amp; Analyze
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"}`} />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              2
            </span>
            <span className={`font-bold ${step >= 2 ? "text-slate-900" : "text-slate-400"}`}>
              Review &amp; Edit
            </span>
          </div>

          <div className={`flex-1 h-0.5 mx-3 ${step >= 3 ? "bg-indigo-600" : "bg-slate-200"}`} />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
              }`}
            >
              3
            </span>
            <span className={`font-bold ${step >= 3 ? "text-slate-900" : "text-slate-400"}`}>
              Compliance Audit
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Step Views */}
      {step === 1 && (
        <ImageUploader
          onAnalyze={handleStartAnalysis}
          isLoading={isExtracting}
          initialPresetId={initialSample}
        />
      )}

      {step === 2 && extractedData && (
        <ExtractionReview
          imageSrc={imageSrc}
          extractedData={extractedData}
          category={category}
          provider={provider}
          onBack={() => setStep(1)}
          onConfirm={handleConfirmAndEvaluate}
        />
      )}

      {step === 3 && currentInspection && (
        <InspectionResults
          inspection={currentInspection}
          onSave={handleManualSave}
          isSaved={isSaved}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

export default function NewInspectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewInspectionContent />
    </Suspense>
  );
}
