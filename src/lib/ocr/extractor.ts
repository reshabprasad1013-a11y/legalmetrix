import { PackageDeclarations } from "@/types/inspection";
import { extractWithGemini } from "./gemini";
import { extractWithOpenAI } from "./openai";
import { extractFromLocalText, matchPresetSampleByHint } from "./localParser";

export interface ExtractionRequest {
  imageBase64?: string;
  imageMimeType?: string;
  presetSampleId?: string;
  productName?: string;
  category?: string;
  manufacturer?: string;
  rawText?: string;
}

export interface ExtractionResponse {
  success: boolean;
  provider: "gemini" | "openai" | "preset_demo" | "local_heuristic" | "manual_fallback";
  declarations: PackageDeclarations;
  message?: string;
  error?: string;
}

export async function processPackageExtraction(
  request: ExtractionRequest
): Promise<ExtractionResponse> {
  // 1. Check if a preset demo sample ID was chosen
  if (request.presetSampleId) {
    const preset = matchPresetSampleByHint(request.presetSampleId);
    if (preset) {
      return {
        success: true,
        provider: "preset_demo",
        declarations: preset,
        message: "Loaded pre-calibrated sample data for demonstration.",
      };
    }
  }

  // 2. Try Gemini Vision if key is available and image is provided
  if (process.env.GEMINI_API_KEY && request.imageBase64) {
    try {
      const geminiResult = await extractWithGemini(
        request.imageBase64,
        request.imageMimeType || "image/jpeg"
      );
      if (geminiResult && geminiResult.product_name) {
        return {
          success: true,
          provider: "gemini",
          declarations: geminiResult,
          message: "Extracted statutory declarations using Google Gemini Vision.",
        };
      }
    }catch (e) {
  console.error("========== GEMINI FAILED ==========");
  console.error(e);
  console.error("====================================");
  throw e;
    }
  }

  // 3. Try OpenAI Vision if key is available
  if (process.env.OPENAI_API_KEY && request.imageBase64) {
    try {
      const openAiResult = await extractWithOpenAI(
        request.imageBase64,
        request.imageMimeType || "image/jpeg"
      );
      if (openAiResult && openAiResult.product_name) {
        return {
          success: true,
          provider: "openai",
          declarations: openAiResult,
          message: "Extracted statutory declarations using OpenAI GPT-4o Vision.",
        };
      }
    } catch (e) {
      console.warn("OpenAI vision attempt failed, falling back:", e);
    }
  }

  // 4. Try matching preset if product name matches a known demo
  if (request.productName) {
    const matched = matchPresetSampleByHint(request.productName);
    if (matched) {
      return {
        success: true,
        provider: "preset_demo",
        declarations: matched,
        message: "Matched recognized sample commodity profile.",
      };
    }
  }

  // 5. Fall back to heuristic parsing if raw text is provided
  if (request.rawText && request.rawText.length > 5) {
    const parsed = extractFromLocalText(request.rawText, {
      productName: request.productName,
      category: request.category,
      manufacturer: request.manufacturer,
    });
    return {
      success: true,
      provider: "local_heuristic",
      declarations: parsed,
      message: "Parsed visible declarations with local OCR rule heuristics.",
    };
  }

  // 6. Default clean empty structure for manual inspector input
  const defaultEmpty: PackageDeclarations = {
    product_name: request.productName || "Not detected",
    generic_name: "Not detected",
    net_quantity: "Not detected",
    mrp: "Not detected",
    unit_sale_price: "Not detected",
    manufacturer_name: request.manufacturer || "Not detected",
    manufacturer_address: "Not detected",
    packer_name: "Not detected",
    packer_address: "Not detected",
    importer_name: "Not detected",
    importer_address: "Not detected",
    consumer_care_name: "Not detected",
    consumer_care_phone: "Not detected",
    consumer_care_email: "Not detected",
    consumer_care_address: "Not detected",
    country_of_origin: "Not detected",
    date_of_manufacture: "Not detected",
    date_of_packing: "Not detected",
    best_before_or_expiry: "Not detected",
    batch_number: "Not detected",
    is_food_item: request.category === "Food & Beverages",
    veg_nonveg_symbol: "Not Detected",
    other_declarations: [],
    raw_ocr_text: "Manual entry mode. Please fill in declared values.",
  };

  return {
    success: true,
    provider: "manual_fallback",
    declarations: defaultEmpty,
    message:
      "Vision API key not configured. Ready for manual inspector data entry.",
  };
}
