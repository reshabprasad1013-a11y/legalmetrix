import { PackageDeclarations } from "@/types/inspection";
import { SAMPLE_PACKAGES } from "../demo/sampleData";

export function extractFromLocalText(
  rawText: string,
  hints?: { productName?: string; category?: string; manufacturer?: string }
): PackageDeclarations {
  const text = rawText || "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Default empty structure
  const result: PackageDeclarations = {
    product_name: hints?.productName || lines[0] || "Not detected",
    generic_name: "Not detected",
    net_quantity: "Not detected",
    mrp: "Not detected",
    unit_sale_price: "Not detected",
    manufacturer_name: hints?.manufacturer || "Not detected",
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
    is_food_item: hints?.category === "Food & Beverages" || /tea|cookie|spice|food|biscuit|snack/i.test(text),
    veg_nonveg_symbol: /green dot|vegetarian|veg\b/i.test(text)
      ? "Vegetarian (Green)"
      : /non-veg|red dot|brown dot/i.test(text)
      ? "Non-Vegetarian (Brown/Red)"
      : "Not Detected",
    other_declarations: [],
    raw_ocr_text: text,
  };

  // Match Net Quantity
  const netQtyMatch = text.match(/(?:net\s*(?:qty|quantity|wt|weight)[\s:]*|qty[\s:]*)((?:approx\s*)?\d+(?:\.\d+)?\s*(?:g|gm|gms|kg|ml|l|ltr|metre|cm|pcs|units|u|n)\b)/i);
  if (netQtyMatch) {
    result.net_quantity = netQtyMatch[1].trim();
  }

  // Match MRP
  const mrpMatch = text.match(/(?:mrp|m\.r\.p\.|max\s*retail\s*price)[\s:]*([₹\$\d\.\,\s\/\-]+(?:incl[^\n\r]*)?)/i);
  if (mrpMatch) {
    result.mrp = mrpMatch[0].trim();
  } else {
    const rupeeMatch = text.match(/₹\s*\d+(?:\.\d{2})?/);
    if (rupeeMatch) {
      result.mrp = rupeeMatch[0];
    }
  }

  // Match Unit Sale Price
  const uspMatch = text.match(/(?:unit\s*sale\s*price|usp)[\s:]*([₹\d\.\,\s\/\w]+)/i);
  if (uspMatch) {
    result.unit_sale_price = uspMatch[1].trim();
  }

  // Match Country of Origin
  const cooMatch = text.match(/(?:country\s*of\s*origin|made\s*in)[\s:]*([a-zA-Z\s]+)/i);
  if (cooMatch) {
    result.country_of_origin = cooMatch[1].trim();
  } else if (/india/i.test(text)) {
    result.country_of_origin = "India";
  }

  // Match Phone
  const phoneMatch = text.match(/(?:toll[\s\-]?free|phone|tel|call)[\s:]*(\+?\d[\d\s\-]{7,14}\d)/i);
  if (phoneMatch) {
    result.consumer_care_phone = phoneMatch[1].trim();
  }

  // Match Email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    result.consumer_care_email = emailMatch[1].trim();
  }

  // Match Date of Mfg / Pkg
  const dateMatch = text.match(/(?:pkd|mfd|pkg|mfg|manufactured|packed)[\s:]*((?:0[1-9]|1[0-2]|[a-z]{3})[\s\/\-\.]+(?:20\d{2}|\d{2}))/i);
  if (dateMatch) {
    result.date_of_manufacture = dateMatch[1].trim();
    result.date_of_packing = dateMatch[1].trim();
  }

  // Match Batch No
  const batchMatch = text.match(/(?:batch|lot|b\.no|lot\s*no)[\s\.\:]*([a-zA-Z0-9\-_]+)/i);
  if (batchMatch) {
    result.batch_number = batchMatch[1].trim();
  }

  // Match Manufacturer
  const mfgMatch = text.match(/(?:mfd\s*by|manufactured\s*by|packed\s*by)[\s:]*([^\n\r]+)/i);
  if (mfgMatch) {
    result.manufacturer_name = mfgMatch[1].trim();
  }

  return result;
}

export function matchPresetSampleByHint(hintName: string): PackageDeclarations | null {
  const match = SAMPLE_PACKAGES.find(
    (s) =>
      s.id.toLowerCase() === hintName.toLowerCase() ||
      s.name.toLowerCase().includes(hintName.toLowerCase()) ||
      hintName.toLowerCase().includes(s.name.toLowerCase())
  );
  return match ? { ...match.declarations } : null;
}
