"use client";

import React, { useState } from "react";
import { Check, Edit3, ArrowLeft, ArrowRight, Sparkles, AlertCircle, Info, RotateCcw } from "lucide-react";
import { CommodityCategory, PackageDeclarations } from "@/types/inspection";
import { COMMODITY_CATEGORIES } from "@/lib/compliance/standards";

interface ExtractionReviewProps {
  imageSrc: string;
  extractedData: PackageDeclarations;
  category: CommodityCategory;
  provider: string;
  onBack: () => void;
  onConfirm: (confirmedData: PackageDeclarations, category: CommodityCategory) => void;
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({
  imageSrc,
  extractedData,
  category: initialCategory,
  provider,
  onBack,
  onConfirm,
}) => {
  const [formData, setFormData] = useState<PackageDeclarations>({ ...extractedData });
  const [category, setCategory] = useState<CommodityCategory>(initialCategory);
  const [activeTab, setActiveTab] = useState<"fields" | "raw">("fields");

  const handleChange = (field: keyof PackageDeclarations, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetToExtracted = () => {
    setFormData({ ...extractedData });
  };

  const handleQuickFillCompliant = () => {
    setFormData((prev) => ({
      ...prev,
      mrp: prev.mrp.includes("incl") ? prev.mrp : `${prev.mrp || "₹100.00"} (incl. of all taxes)`,
      consumer_care_phone: prev.consumer_care_phone === "Not detected" ? "1800-111-222" : prev.consumer_care_phone,
      consumer_care_email: prev.consumer_care_email === "Not detected" ? "customercare@example.in" : prev.consumer_care_email,
      country_of_origin: prev.country_of_origin === "Not detected" ? "India" : prev.country_of_origin,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Notification Bar */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
              Statutory Declarations Extracted via {provider.toUpperCase()}
            </h4>
            <p className="text-xs text-indigo-700">
              Please review or edit any field below. The Compliance Rule Engine will evaluate your confirmed values.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToExtracted}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Side-by-Side Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Zoomable Package Image Viewer */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">Visual Evidence (Package Label)</h3>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              High Resolution
            </span>
          </div>

          <div className="flex-1 min-h-[420px] max-h-[640px] rounded-lg overflow-auto border border-slate-200 bg-slate-950/5 flex items-center justify-center p-3">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Package Label Evidence"
                className="max-h-[600px] w-auto object-contain rounded shadow-sm"
              />
            ) : (
              <div className="text-center text-slate-400 text-xs">No image provided</div>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-3 text-center">
            Compare declarations printed on the physical label with the parsed fields on the right.
          </p>
        </div>

        {/* Right: Editable Form Fields */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inspector Verification Form</h3>
              <p className="text-xs text-slate-500">Edit fields to reflect actual physical label declarations</p>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("fields")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeTab === "fields"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Form Fields
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeTab === "raw"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Raw OCR Text
              </button>
            </div>
          </div>

          {activeTab === "raw" ? (
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Raw Extracted OCR Text (Audit Trace)
                </label>
                <textarea
                  rows={14}
                  value={formData.raw_ocr_text || ""}
                  onChange={(e) => handleChange("raw_ocr_text", e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[580px]">
              {/* Category selector */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Commodity Classification Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CommodityCategory)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {COMMODITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. Mandatory Identity & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Generic / Product Name (Rule 6(1)(a))
                  </label>
                  <input
                    type="text"
                    value={formData.product_name || ""}
                    onChange={(e) => handleChange("product_name", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Net Quantity & Units (Rule 6(1)(b) & 12)
                  </label>
                  <input
                    type="text"
                    value={formData.net_quantity || ""}
                    onChange={(e) => handleChange("net_quantity", e.target.value)}
                    placeholder="e.g. 100 g, 500 ml"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* 2. Price & USP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MRP Declaration (Rule 6(1)(e))
                  </label>
                  <input
                    type="text"
                    value={formData.mrp || ""}
                    onChange={(e) => handleChange("mrp", e.target.value)}
                    placeholder="e.g. ₹150.00 (incl. of all taxes)"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit Sale Price (USP) (Rule 6(1)(f))
                  </label>
                  <input
                    type="text"
                    value={formData.unit_sale_price || ""}
                    onChange={(e) => handleChange("unit_sale_price", e.target.value)}
                    placeholder="e.g. ₹0.50 / g"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* 3. Manufacturer & Address */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manufacturer / Pre-packer Name (Rule 6(1)(d))
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer_name || ""}
                    onChange={(e) => handleChange("manufacturer_name", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Complete Manufacturer Postal Address (With PIN Code)
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer_address || ""}
                    onChange={(e) => handleChange("manufacturer_address", e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 4. Consumer Grievance Contact */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="block text-xs font-bold text-slate-800">
                  Consumer Grievance / Care Redressal (Rule 6(1)(n))
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Telephone / Toll-Free Phone
                    </label>
                    <input
                      type="text"
                      value={formData.consumer_care_phone || ""}
                      onChange={(e) => handleChange("consumer_care_phone", e.target.value)}
                      placeholder="e.g. 1800-200-8899"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="text"
                      value={formData.consumer_care_email || ""}
                      onChange={(e) => handleChange("consumer_care_email", e.target.value)}
                      placeholder="e.g. care@brand.in"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Country of Origin & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Country of Origin (Rule 6(10))
                  </label>
                  <input
                    type="text"
                    value={formData.country_of_origin || ""}
                    onChange={(e) => handleChange("country_of_origin", e.target.value)}
                    placeholder="e.g. India"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mfg / Pkg Date (Rule 6(1)(c))
                  </label>
                  <input
                    type="text"
                    value={formData.date_of_manufacture || formData.date_of_packing || ""}
                    onChange={(e) => handleChange("date_of_manufacture", e.target.value)}
                    placeholder="e.g. 08/2026"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch / Lot No. (Rule 6(1)(g))
                  </label>
                  <input
                    type="text"
                    value={formData.batch_number || ""}
                    onChange={(e) => handleChange("batch_number", e.target.value)}
                    placeholder="e.g. PB-2026-08A"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* 6. Food specific declarations */}
              {category === "Food & Beverages" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Veg / Non-Veg Logo (FSSAI)
                    </label>
                    <select
                      value={formData.veg_nonveg_symbol || "Not Detected"}
                      onChange={(e) => handleChange("veg_nonveg_symbol", e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                    >
                      <option value="Vegetarian (Green)">Vegetarian (Green Symbol)</option>
                      <option value="Non-Vegetarian (Brown/Red)">Non-Vegetarian (Brown/Red Symbol)</option>
                      <option value="Not Detected">Not Detected</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Best Before / Expiry
                    </label>
                    <input
                      type="text"
                      value={formData.best_before_or_expiry || ""}
                      onChange={(e) => handleChange("best_before_or_expiry", e.target.value)}
                      placeholder="e.g. Best Before 12 Months"
                      className="w-full text-xs bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Upload Image</span>
            </button>

            <button
              type="button"
              onClick={() => onConfirm(formData, category)}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>Confirm &amp; Check Compliance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
