import { GoogleGenerativeAI } from "@google/generative-ai";
import { PackageDeclarations } from "@/types/inspection";

const EXTRACTION_SYSTEM_PROMPT = `
You are an expert Legal Metrology compliance inspection assistant.
Analyze the provided packaged commodity label image and extract all visible statutory declarations according to the Indian Legal Metrology (Packaged Commodities) Rules, 2011.

STRICT ACCURACY RULES:
1. Extract only the specific statutory declaration values required by the fields below. Preserve short names, numbers, dates, quantities, prices, addresses, and contact details accurately, but do not reproduce long blocks of label text.
2. DO NOT invent, hallucinate, or assume missing information.
3. If a field is not clearly visible on the image, set its value to "Not detected".
4. For Net Quantity, extract the full declaration including units (e.g. "100 g", "500 ml", "1 kg").
5. For MRP, extract the price and any tax statements (e.g. "₹250.00 (incl. of all taxes)").
6. For Manufacturer, extract the full company name and complete postal address.
7. For Consumer Care, extract the designation, telephone/toll-free number, and email address.
8. For Country of Origin, extract the country (e.g. "India").
9. For Dates, extract Month and Year of manufacture/packaging (e.g. "08/2026").
10. For Batch Number, extract the lot/batch code.

Return ONLY a valid JSON object matching this structure. Do not provide a full transcription of the label.
{
  "product_name": "string (or 'Not detected')",
  "generic_name": "string (or 'Not detected')",
  "net_quantity": "string (or 'Not detected')",
  "net_quantity_unit": "string (e.g. 'g', 'kg', 'ml', 'l', 'pieces')",
  "mrp": "string (or 'Not detected')",
  "unit_sale_price": "string (or 'Not detected')",
  "manufacturer_name": "string (or 'Not detected')",
  "manufacturer_address": "string (or 'Not detected')",
  "packer_name": "string (or 'Not detected')",
  "packer_address": "string (or 'Not detected')",
  "importer_name": "string (or 'Not detected')",
  "importer_address": "string (or 'Not detected')",
  "consumer_care_name": "string (or 'Not detected')",
  "consumer_care_phone": "string (or 'Not detected')",
  "consumer_care_email": "string (or 'Not detected')",
  "consumer_care_address": "string (or 'Not detected')",
  "country_of_origin": "string (or 'Not detected')",
  "date_of_manufacture": "string (or 'Not detected')",
  "date_of_packing": "string (or 'Not detected')",
  "best_before_or_expiry": "string (or 'Not detected')",
  "batch_number": "string (or 'Not detected')",
  "is_food_item": true,
  "veg_nonveg_symbol": "Vegetarian (Green) | Non-Vegetarian (Brown/Red) | Not Applicable | Not Detected",
  "dimensions": "string (or 'Not detected')",
  "other_declarations": ["string"],
  "raw_ocr_text": "Brief summary of relevant visible label text; do not reproduce long passages verbatim"
}
`;

export async function extractWithGemini(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<PackageDeclarations | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    // Clean base64 string
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

    const result = await model.generateContent([
      EXTRACTION_SYSTEM_PROMPT,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg",
        },
      },
    ]);

    const responseText = result.response.text();
    // Parse json from markdown code fences if wrapped
    const jsonMatch = responseText.match(/```(?:json)?([\s\S]*?)```/) || [null, responseText];
    const jsonStr = (jsonMatch[1] || responseText).trim();

    const parsed = JSON.parse(jsonStr) as PackageDeclarations;
    return parsed;
  }catch (error) {
  console.error("========== GEMINI ERROR ==========");
  console.error(error);
  console.error("==================================");
  throw error;
  }
}
