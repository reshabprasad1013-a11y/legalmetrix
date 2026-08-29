import { CommodityCategory, InspectionRecord, PackageDeclarations } from "@/types/inspection";
import { evaluateCompliance } from "../compliance/engine";

export interface DemoSample {
  id: string;
  name: string;
  brand: string;
  category: CommodityCategory;
  batchNumber: string;
  description: string;
  imageThumbnail: string;
  declarations: PackageDeclarations;
}

const GREEN_TEA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#064e3b;font-family:sans-serif;color:#ffffff;">
  <rect width="600" height="800" fill="#042f2e" rx="16" />
  <rect x="20" y="20" width="560" height="760" fill="#0f766e" stroke="#2dd4bf" stroke-width="3" rx="12"/>
  
  <rect x="40" y="40" width="520" height="120" fill="#115e59" rx="8"/>
  <text x="300" y="85" text-anchor="middle" fill="#5eead4" font-size="28" font-weight="bold">PUREBREW ORGANICS</text>
  <text x="300" y="125" text-anchor="middle" fill="#ffffff" font-size="20">Himalayan Green Tea (Loose Leaf)</text>

  <rect x="490" y="55" width="40" height="40" stroke="#22c55e" stroke-width="3" fill="#ffffff" rx="4"/>
  <circle cx="510" cy="75" r="12" fill="#22c55e"/>

  <g fill="#ffffff" font-size="14">
    <rect x="40" y="180" width="250" height="70" fill="#134e4a" rx="6"/>
    <text x="55" y="205" fill="#99f6e4" font-weight="bold" font-size="12">NET QUANTITY (Rule 6(1)(b))</text>
    <text x="55" y="235" fill="#ffffff" font-size="22" font-weight="bold">250 g</text>

    <rect x="310" y="180" width="250" height="70" fill="#134e4a" rx="6"/>
    <text x="325" y="205" fill="#99f6e4" font-weight="bold" font-size="12">MAX RETAIL PRICE (Rule 6(1)(e))</text>
    <text x="325" y="235" fill="#ffffff" font-size="18" font-weight="bold">₹275.00</text>
    <text x="405" y="235" fill="#a7f3d0" font-size="12">(incl. of all taxes)</text>

    <rect x="40" y="260" width="520" height="45" fill="#115e59" rx="6"/>
    <text x="55" y="288" fill="#a7f3d0" font-size="13">Unit Sale Price: ₹1.10 / g | USP Declared</text>

    <rect x="40" y="315" width="520" height="110" fill="#134e4a" rx="6"/>
    <text x="55" y="338" fill="#99f6e4" font-weight="bold" font-size="12">MANUFACTURED &amp; PACKED BY (Rule 6(1)(d))</text>
    <text x="55" y="365" font-weight="bold">PureBrew Organics India Pvt Ltd</text>
    <text x="55" y="390" fill="#ccfbf1">Plot 45, Industrial Estate, Sector 3, Dehradun, Uttarakhand - 248001</text>
    <text x="55" y="412" fill="#5eead4" font-size="12">Country of Origin: India</text>

    <rect x="40" y="435" width="520" height="110" fill="#134e4a" rx="6"/>
    <text x="55" y="458" fill="#99f6e4" font-weight="bold" font-size="12">CONSUMER GRIEVANCE / CARE CELL (Rule 6(1)(n))</text>
    <text x="55" y="482">Executive, Consumer Care: PureBrew Care Desk</text>
    <text x="55" y="504">Toll-Free Phone: 1800-200-8899 | Email: care@purebreworganics.in</text>
    <text x="55" y="526" fill="#ccfbf1">Address: Same as manufacturer postal address above</text>

    <rect x="40" y="555" width="250" height="90" fill="#134e4a" rx="6"/>
    <text x="55" y="578" fill="#99f6e4" font-weight="bold" font-size="12">DATE OF PKG &amp; EXPIRY</text>
    <text x="55" y="605">Pkg Date: 08/2026</text>
    <text x="55" y="628" fill="#a7f3d0">Best Before: 12 Months</text>

    <rect x="310" y="555" width="250" height="90" fill="#134e4a" rx="6"/>
    <text x="325" y="578" fill="#99f6e4" font-weight="bold" font-size="12">BATCH &amp; CODE</text>
    <text x="325" y="605">Batch No: PB-2026-08A</text>
    <text x="325" y="628" fill="#a7f3d0">FSSAI Lic No: 10019011000214</text>
  </g>

  <rect x="40" y="660" width="520" height="85" fill="#042f2e" stroke="#10b981" stroke-width="2" rx="8"/>
  <text x="300" y="695" text-anchor="middle" fill="#34d399" font-size="16" font-weight="bold">LEGAL METROLOGY COMPLIANT SPECIFICATION</text>
  <text x="300" y="725" text-anchor="middle" fill="#99f6e4" font-size="12">Packaged in accordance with Packaged Commodities Rules 2011</text>
</svg>`;

const COOKIES_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#78350f;font-family:sans-serif;color:#ffffff;">
  <rect width="600" height="800" fill="#451a03" rx="16" />
  <rect x="20" y="20" width="560" height="760" fill="#92400e" stroke="#f59e0b" stroke-width="3" rx="12"/>
  
  <rect x="40" y="40" width="520" height="120" fill="#78350f" rx="8"/>
  <text x="300" y="85" text-anchor="middle" fill="#fde68a" font-size="28" font-weight="bold">CRUNCHY DELIGHT</text>
  <text x="300" y="125" text-anchor="middle" fill="#ffffff" font-size="20">Rich Butter Cookies</text>

  <g fill="#ffffff" font-size="14">
    <rect x="40" y="180" width="250" height="70" fill="#713f12" rx="6"/>
    <text x="55" y="205" fill="#fde68a" font-weight="bold" font-size="12">NET QUANTITY</text>
    <text x="55" y="235" fill="#ffffff" font-size="22" font-weight="bold">150 g</text>

    <rect x="310" y="180" width="250" height="70" fill="#713f12" rx="6"/>
    <text x="325" y="205" fill="#fde68a" font-weight="bold" font-size="12">MAX RETAIL PRICE</text>
    <text x="325" y="235" fill="#ffffff" font-size="18" font-weight="bold">₹60.00</text>
    <text x="390" y="235" fill="#fef08a" font-size="12">(incl. of all taxes)</text>

    <rect x="40" y="265" width="520" height="100" fill="#713f12" stroke="#f59e0b" stroke-dasharray="4" rx="6"/>
    <text x="55" y="290" fill="#fde68a" font-weight="bold" font-size="12">MANUFACTURED BY (Review Notice: Abbreviated Address)</text>
    <text x="55" y="315" font-weight="bold">Delight Confectioneries Ltd</text>
    <text x="55" y="340" fill="#fed7aa">G.T. Road, Panipat (PIN Code missing)</text>

    <rect x="40" y="380" width="520" height="110" fill="#713f12" stroke="#f59e0b" stroke-dasharray="4" rx="6"/>
    <text x="55" y="405" fill="#fde68a" font-weight="bold" font-size="12">CONSUMER GRIEVANCE (Missing Telephone)</text>
    <text x="55" y="430">For feedback email: feedback@delightcookies.com</text>
    <text x="55" y="455" fill="#fca5a5">[Phone / Toll-Free Number: Not Declared]</text>

    <rect x="40" y="505" width="250" height="70" fill="#713f12" rx="6"/>
    <text x="55" y="530" fill="#fde68a" font-weight="bold" font-size="12">COUNTRY OF ORIGIN</text>
    <text x="55" y="555" font-weight="bold">India</text>

    <rect x="310" y="505" width="250" height="70" fill="#713f12" rx="6"/>
    <text x="325" y="530" fill="#fde68a" font-weight="bold" font-size="12">DATE &amp; BATCH</text>
    <text x="325" y="555">PKD: 07/2026 | Lot: DC-892B</text>
  </g>

  <rect x="40" y="620" width="520" height="120" fill="#451a03" stroke="#f59e0b" stroke-width="2" rx="8"/>
  <text x="300" y="660" text-anchor="middle" fill="#fbbf24" font-size="16" font-weight="bold">COMPLIANCE REVIEW REQUIRED</text>
  <text x="300" y="690" text-anchor="middle" fill="#fed7aa" font-size="13">• Consumer care telephone number missing (Rule 6(1)(n))</text>
  <text x="300" y="715" text-anchor="middle" fill="#fed7aa" font-size="13">• Incomplete manufacturer address without PIN code (Rule 6(1)(d))</text>
</svg>`;

const MASALA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" style="background:#450a0a;font-family:sans-serif;color:#ffffff;">
  <rect width="600" height="800" fill="#450a0a" rx="16" />
  <rect x="20" y="20" width="560" height="760" fill="#7f1d1d" stroke="#ef4444" stroke-width="3" rx="12"/>
  
  <rect x="40" y="40" width="520" height="110" fill="#991b1b" rx="8"/>
  <text x="300" y="85" text-anchor="middle" fill="#fca5a5" font-size="28" font-weight="bold">SUNRISE SPICES</text>
  <text x="300" y="120" text-anchor="middle" fill="#ffffff" font-size="20">Special Garam Masala Blend</text>

  <g fill="#ffffff" font-size="14">
    <rect x="40" y="170" width="250" height="90" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="55" y="195" fill="#fca5a5" font-weight="bold" font-size="12">NET QUANTITY (VIOLATION)</text>
    <text x="55" y="225" fill="#f87171" font-size="20" font-weight="bold">approx 200g</text>
    <text x="55" y="248" fill="#fecaca" font-size="11">Prohibited qualifier Rule 13</text>

    <rect x="310" y="170" width="250" height="90" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="325" y="195" fill="#fca5a5" font-weight="bold" font-size="12">RETAIL PRICE (VIOLATION)</text>
    <text x="325" y="225" fill="#f87171" font-size="20" font-weight="bold">NOT PRINTED</text>
    <text x="325" y="248" fill="#fecaca" font-size="11">Missing MRP Rule 6(1)(e)</text>

    <rect x="40" y="275" width="520" height="90" fill="#991b1b" rx="6"/>
    <text x="55" y="300" fill="#fca5a5" font-weight="bold" font-size="12">MANUFACTURER</text>
    <text x="55" y="325" font-weight="bold">Sunrise Spice Works</text>
    <text x="55" y="348" fill="#fee2e2">Old Market Yard, Jaipur</text>

    <rect x="40" y="380" width="520" height="85" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="55" y="405" fill="#fca5a5" font-weight="bold" font-size="12">CONSUMER GRIEVANCE (VIOLATION)</text>
    <text x="55" y="435" fill="#f87171" font-size="16" font-weight="bold">NO CONSUMER CARE CONTACT DETAILS DETECTED</text>

    <rect x="40" y="480" width="250" height="85" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="55" y="505" fill="#fca5a5" font-weight="bold" font-size="12">MFG DATE (VIOLATION)</text>
    <text x="55" y="535" fill="#f87171" font-size="16" font-weight="bold">NOT DECLARED</text>

    <rect x="310" y="480" width="250" height="85" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" rx="6"/>
    <text x="325" y="505" fill="#fca5a5" font-weight="bold" font-size="12">BATCH NO. (VIOLATION)</text>
    <text x="325" y="535" fill="#f87171" font-size="16" font-weight="bold">NOT DETECTED</text>
  </g>

  <rect x="40" y="590" width="520" height="150" fill="#450a0a" stroke="#dc2626" stroke-width="3" rx="8"/>
  <text x="300" y="625" text-anchor="middle" fill="#ef4444" font-size="20" font-weight="bold">CRITICAL NON-COMPLIANCE DETECTED</text>
  <text x="300" y="655" text-anchor="middle" fill="#fca5a5" font-size="13">• Prohibited word 'approx' violates Net Quantity Rule 13</text>
  <text x="300" y="678" text-anchor="middle" fill="#fca5a5" font-size="13">• Missing MRP violates Rule 6(1)(e)</text>
  <text x="300" y="701" text-anchor="middle" fill="#fca5a5" font-size="13">• Missing Month &amp; Year of Mfg violates Rule 6(1)(c)</text>
  <text x="300" y="724" text-anchor="middle" fill="#fca5a5" font-size="13">• No Consumer Care details violates Rule 6(1)(n)</text>
</svg>`;

export const SAMPLE_PACKAGES: DemoSample[] = [
  {
    id: "SAMPLE-COMPLIANT-01",
    name: "PureBrew Himalayan Green Tea (250 g)",
    brand: "PureBrew Organics Ltd",
    category: "Food & Beverages",
    batchNumber: "PB-2026-08A",
    description: "Fully compliant Indian packaged food commodity meeting all Legal Metrology Rule 6, 12, and 13 specifications.",
    imageThumbnail: "data:image/svg+xml;utf8," + encodeURIComponent(GREEN_TEA_SVG),
    declarations: {
      product_name: "PureBrew Himalayan Green Tea (Loose Leaf)",
      generic_name: "Green Tea",
      net_quantity: "250 g",
      net_quantity_unit: "g",
      net_quantity_value: 250,
      mrp: "₹275.00 (incl. of all taxes)",
      mrp_value: 275.0,
      unit_sale_price: "₹1.10 / g",
      manufacturer_name: "PureBrew Organics India Pvt Ltd",
      manufacturer_address: "Plot 45, Industrial Estate, Sector 3, Dehradun, Uttarakhand - 248001",
      packer_name: "PureBrew Organics India Pvt Ltd",
      packer_address: "Plot 45, Industrial Estate, Sector 3, Dehradun, Uttarakhand - 248001",
      consumer_care_name: "Consumer Care Executive, PureBrew Care Desk",
      consumer_care_phone: "1800-200-8899",
      consumer_care_email: "care@purebreworganics.in",
      consumer_care_address: "Plot 45, Industrial Estate, Sector 3, Dehradun, Uttarakhand - 248001",
      country_of_origin: "India",
      date_of_manufacture: "08/2026",
      date_of_packing: "08/2026",
      best_before_or_expiry: "Best Before 12 Months from packaging",
      batch_number: "PB-2026-08A",
      is_food_item: true,
      veg_nonveg_symbol: "Vegetarian (Green)",
      other_declarations: ["FSSAI Lic: 10019011000214", "Store in a cool dry place", "100% Certified Organic"],
      raw_ocr_text: "PUREBREW ORGANICS HIMALAYAN GREEN TEA NET QTY 250 g MRP ₹275.00 (incl. of all taxes) Unit Sale Price: ₹1.10/g MFD & PKD BY: PureBrew Organics India Pvt Ltd Plot 45 Industrial Estate Sector 3 Dehradun Uttarakhand 248001 Country of Origin: India Consumer Care: 1800-200-8899 care@purebreworganics.in Batch PB-2026-08A PKD 08/2026 Best Before 12 Months",
    },
  },

  {
    id: "SAMPLE-PARTIAL-02",
    name: "Crunchy Delight Butter Cookies (150 g)",
    brand: "Delight Confectioneries Ltd",
    category: "Food & Beverages",
    batchNumber: "DC-892B",
    description: "Partially compliant commodity with missing consumer care toll-free phone and abbreviated address missing postal PIN code.",
    imageThumbnail: "data:image/svg+xml;utf8," + encodeURIComponent(COOKIES_SVG),
    declarations: {
      product_name: "Crunchy Delight Butter Cookies",
      generic_name: "Butter Cookies",
      net_quantity: "150 g",
      net_quantity_unit: "g",
      net_quantity_value: 150,
      mrp: "₹60.00 (incl. of all taxes)",
      mrp_value: 60.0,
      unit_sale_price: "₹0.40 / g",
      manufacturer_name: "Delight Confectioneries Ltd",
      manufacturer_address: "G.T. Road, Panipat",
      packer_name: "Delight Confectioneries Ltd",
      packer_address: "G.T. Road, Panipat",
      consumer_care_name: "Customer Care Desk",
      consumer_care_phone: "Not detected",
      consumer_care_email: "feedback@delightcookies.com",
      consumer_care_address: "G.T. Road, Panipat",
      country_of_origin: "India",
      date_of_manufacture: "07/2026",
      date_of_packing: "07/2026",
      best_before_or_expiry: "Best Before 6 months from packaging",
      batch_number: "DC-892B",
      is_food_item: true,
      veg_nonveg_symbol: "Vegetarian (Green)",
      other_declarations: ["Ingredients: Wheat Flour, Sugar, Butter, Milk Solids"],
      raw_ocr_text: "CRUNCHY DELIGHT BUTTER COOKIES NET WT 150g MRP ₹60 (incl. of all taxes) Delight Confectioneries Ltd G.T. Road Panipat Country of Origin India Email: feedback@delightcookies.com PKD 07/2026 B.No DC-892B",
    },
  },

  {
    id: "SAMPLE-NONCOMPLIANT-03",
    name: "Sunrise Kitchen Garam Masala (approx 200g)",
    brand: "Sunrise Spice Works",
    category: "Food & Beverages",
    batchNumber: "Not detected",
    description: "Clearly non-compliant commodity with prohibited qualifier 'approx 200g', missing MRP, missing date of manufacture, and missing batch number.",
    imageThumbnail: "data:image/svg+xml;utf8," + encodeURIComponent(MASALA_SVG),
    declarations: {
      product_name: "Sunrise Kitchen Garam Masala",
      generic_name: "Garam Masala Powder",
      net_quantity: "approx 200g",
      net_quantity_unit: "g",
      mrp: "Not detected",
      unit_sale_price: "Not detected",
      manufacturer_name: "Sunrise Spice Works",
      manufacturer_address: "Old Market Yard, Jaipur",
      consumer_care_name: "Not detected",
      consumer_care_phone: "Not detected",
      consumer_care_email: "Not detected",
      consumer_care_address: "Not detected",
      country_of_origin: "Not detected",
      date_of_manufacture: "Not detected",
      date_of_packing: "Not detected",
      best_before_or_expiry: "Not detected",
      batch_number: "Not detected",
      is_food_item: true,
      veg_nonveg_symbol: "Not Detected",
      other_declarations: ["Ingredients: Coriander, Cumin, Black Pepper, Cardamom"],
      raw_ocr_text: "SUNRISE SPICES GARAM MASALA approx 200g Sunrise Spice Works Old Market Yard Jaipur Ingredients Coriander Cumin Black Pepper",
    },
  },
];

export function getDemoInspectionRecords(): InspectionRecord[] {
  return SAMPLE_PACKAGES.map((sample) => {
    const evaluation = evaluateCompliance(sample.declarations, sample.category);
    return {
      id: sample.id,
      product_name: sample.name,
      brand_or_mfg: sample.brand,
      category: sample.category,
      batch_number: sample.batchNumber,
      image_url: sample.imageThumbnail,
      image_filename: `${sample.id.toLowerCase()}.svg`,
      extracted_data: sample.declarations,
      confirmed_data: sample.declarations,
      evaluation,
      status: evaluation.overall_status,
      score: evaluation.overall_score,
      violations_count: evaluation.violations.length,
      notes: sample.description,
      is_demo: true,
      created_at: new Date(Date.now() - (sample.id.includes("COMPLIANT") ? 86400000 : sample.id.includes("PARTIAL") ? 172800000 : 259200000)).toISOString(),
      updated_at: new Date().toISOString(),
    };
  });
}
