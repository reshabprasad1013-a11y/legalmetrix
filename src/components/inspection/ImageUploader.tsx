"use client";

import React, { useState, useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { COMMODITY_CATEGORIES } from "@/lib/compliance/standards";
import { SAMPLE_PACKAGES, DemoSample } from "@/lib/demo/sampleData";
import { CommodityCategory } from "@/types/inspection";

interface ImageUploaderProps {
  onAnalyze: (payload: {
    imageBase64: string;
    imageMimeType: string;
    presetSampleId?: string;
    productName: string;
    category: CommodityCategory;
    manufacturer: string;
    batchNumber: string;
  }) => void;
  isLoading: boolean;
  initialPresetId?: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onAnalyze,
  isLoading,
  initialPresetId,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [fileName, setFileName] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<DemoSample | null>(null);

  // Metadata inputs
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState<CommodityCategory>("Food & Beverages");
  const [manufacturer, setManufacturer] = useState("");
  const [batchNumber, setBatchNumber] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If initialPresetId passed in url query
  React.useEffect(() => {
    if (initialPresetId) {
      const match = SAMPLE_PACKAGES.find((s) => s.id === initialPresetId);
      if (match) {
        handleSelectPreset(match);
      }
    }
  }, [initialPresetId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setFileName(file.name);
    setMimeType(file.type);
    setSelectedPreset(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: DemoSample) => {
    setSelectedPreset(preset);
    setSelectedImage(preset.imageThumbnail);
    setMimeType("image/svg+xml");
    setFileName(`${preset.id}.svg`);
    setProductName(preset.name);
    setCategory(preset.category);
    setManufacturer(preset.brand);
    setBatchNumber(preset.batchNumber);
  };

  const handleStartAnalysis = () => {
    if (!selectedImage && !selectedPreset) {
      alert("Please upload an image or select a sample package to analyze.");
      return;
    }

    onAnalyze({
      imageBase64: selectedImage || "",
      imageMimeType: mimeType,
      presetSampleId: selectedPreset?.id,
      productName,
      category,
      manufacturer,
      batchNumber,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sample presets bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h3 className="font-bold text-sm sm:text-base">
              Try Instant Demo Sample Packages (Deterministic Datasets)
            </h3>
          </div>
          <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-500/30 text-indigo-200 rounded border border-indigo-400/30 self-start sm:self-auto">
            DEMO DATA PRESETS
          </span>
        </div>

        <p className="text-xs text-indigo-200 mb-4">
          Click any pre-configured Indian packaged commodity below to test compliant, partially compliant, or violation scenarios:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_PACKAGES.map((sample) => {
            const isSelected = selectedPreset?.id === sample.id;
            const badgeType = sample.id.includes("COMPLIANT")
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : sample.id.includes("PARTIAL")
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-rose-500/20 text-rose-300 border-rose-500/40";

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-indigo-700/60 border-indigo-400 ring-2 ring-indigo-400/50"
                    : "bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-white truncate">{sample.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeType}`}>
                    {sample.id.includes("COMPLIANT") ? "Compliant" : sample.id.includes("PARTIAL") ? "Partial" : "Non-Compliant"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload and Metadata Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload Dropzone & Image Preview */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center justify-between">
            <span>1. Upload Package / Label Image</span>
            {selectedPreset && (
              <span className="text-xs text-indigo-600 font-semibold">
                Preset Loaded: {selectedPreset.name}
              </span>
            )}
          </h3>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[260px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 mb-3 transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-800 text-sm mb-1">
                Click to upload label image or drag and drop
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Supports JPG, JPEG, PNG, WebP (Max 10MB)
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                <ImageIcon className="w-3.5 h-3.5" /> Browse Local File
              </span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[360px] flex items-center justify-center p-2">
                <img
                  src={selectedImage}
                  alt="Package label preview"
                  className="max-h-[340px] w-auto object-contain rounded"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                  {fileName || "package_label.jpg"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedPreset(null);
                    setFileName("");
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Change Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Optional Product Metadata */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              2. Optional Commodity Metadata
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Providing category hints assists conditional Legal Metrology rules (e.g., FSSAI Veg logo for Food).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CommodityCategory)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {COMMODITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product / Brand Name (Optional)
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. PureBrew Green Tea"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manufacturer / Brand (Optional)
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. PureBrew Organics India Ltd"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch / Lot Code (Optional)
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. PB-2026-08A"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isLoading || !selectedImage}
              onClick={handleStartAnalysis}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                isLoading || !selectedImage
                  ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Vision AI Extraction...</span>
                </>
              ) : (
                <>
                  <span>Extract Statutory Declarations</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
