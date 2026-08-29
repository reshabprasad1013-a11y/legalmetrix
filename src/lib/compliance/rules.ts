import { ComplianceRuleDefinition } from "@/types/rules";
import { PackageDeclarations, RuleStatus } from "@/types/inspection";
import { ALL_VALID_UNITS, PROHIBITED_QUANTITY_QUALIFIERS } from "./standards";

function isFieldEmptyOrNotDetected(val?: string | null): boolean {
  if (!val) return true;
  const cleaned = val.trim().toLowerCase();
  return (
    cleaned === "" ||
    cleaned === "not detected" ||
    cleaned === "n/a" ||
    cleaned === "none" ||
    cleaned === "undefined" ||
    cleaned === "null" ||
    cleaned === "missing"
  );
}

export const COMPLIANCE_RULES: ComplianceRuleDefinition[] = [
  // 1. Generic / Common Name Declaration
  {
    id: "RULE-NAME-01",
    code: "LM-2011-R6-1-A",
    name: "Generic / Common Name of Commodity",
    category: "Mandatory Declarations",
    description:
      "The generic or common name of the commodity contained in the package must be prominently declared on the principal display panel.",
    applicable_categories: "ALL",
    required_field: "product_name",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(a), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Prominently print the unambiguous generic or common name of the product on the principal display panel.",
    validator: (data: PackageDeclarations) => {
      const name = data.product_name || data.generic_name || "";
      if (!name || isFieldEmptyOrNotDetected(name)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: name || "Not detected",
          explanation: "Product common or generic name is missing or could not be detected on the package label.",
          recommendation: "Ensure the generic or trade name of the commodity is clearly printed on the main display panel."
        };
      }
      if (name.trim().length < 2) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: name,
          explanation: "Declared name is unusually short; verify if it clearly specifies the commodity nature.",
          recommendation: "Verify that the product name clearly describes the nature of the packaged commodity."
        };
      }
      return {
        status: "PASS" as RuleStatus,
        detected_value: name.trim(),
        explanation: `Generic/Trade name '${name.trim()}' is declared on the label.`
      };
    },
  },

  // 2. Net Quantity Declaration with Standard SI Units
  {
    id: "RULE-NETQTY-01",
    code: "LM-2011-R6-1-B",
    name: "Net Quantity in Standard Metric Units",
    category: "Net Quantity & Units",
    description:
      "The net quantity in terms of standard unit of weight (g/kg), volume (ml/l), length (cm/m), or count (number/units) must be declared without prohibited qualifiers.",
    applicable_categories: "ALL",
    required_field: "net_quantity",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(b), Rule 12 & Rule 13, Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Declare exact net quantity using standard metric units (e.g. 100 g, 500 ml, 1 kg) without words like 'approx' or 'when packed'.",
    validator: (data: PackageDeclarations) => {
      const qty = data.net_quantity || "";
      if (!qty || isFieldEmptyOrNotDetected(qty)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: qty || "Not detected",
          explanation: "Net quantity declaration is missing or not detected.",
          recommendation: "Print the net quantity in standard metric units prominently on the principal display panel."
        };
      }

      const lowerQty = qty.toLowerCase();

      // Check for prohibited qualifiers (Rule 13)
      for (const qualifier of PROHIBITED_QUANTITY_QUALIFIERS) {
        if (lowerQty.includes(qualifier)) {
          return {
            status: "FAIL" as RuleStatus,
            detected_value: qty,
            explanation: `Net quantity contains non-compliant qualifying wording '${qualifier}'. Rule 13 strictly prohibits qualifiers like 'approx', 'about', or 'when packed'.`,
            recommendation: `Remove '${qualifier}' and declare the exact net quantity in standard metric units.`
          };
        }
      }

      // Check for standard unit presence
      const hasValidUnit = ALL_VALID_UNITS.some((unit) => {
        const regex = new RegExp(`(\\d+(\\.\\d+)?)\\s*${unit}\\b`, "i");
        return regex.test(lowerQty);
      });

      if (!hasValidUnit) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: qty,
          explanation: "Net quantity could not be confirmed to match standard Legal Metrology SI units (g, kg, ml, l, cm, m, units).",
          recommendation: "Ensure net quantity is specified in approved units (e.g., '100 g', '500 ml', '1 N')."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: qty.trim(),
        explanation: `Net quantity '${qty.trim()}' is declared in compliant standard metric units.`
      };
    },
  },

  // 3. Maximum Retail Price (MRP) Declaration
  {
    id: "RULE-MRP-01",
    code: "LM-2011-R6-1-E",
    name: "Maximum Retail Price (MRP) Declaration",
    category: "Pricing & USP",
    description:
      "The retail sale price of the package must be clearly stated in Indian Rupees as Maximum Retail Price (MRP) inclusive of all taxes.",
    applicable_categories: "ALL",
    required_field: "mrp",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Declare MRP clearly with currency symbol and mandatory phrasing: 'MRP ₹... (inclusive of all taxes)'.",
    validator: (data: PackageDeclarations) => {
      const mrp = data.mrp || "";
      if (!mrp || isFieldEmptyOrNotDetected(mrp)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: mrp || "Not detected",
          explanation: "Maximum Retail Price (MRP) declaration is missing or not detected.",
          recommendation: "Clearly declare 'MRP ₹... (incl. of all taxes)' on the package."
        };
      }

      const lowerMrp = mrp.toLowerCase();
      const hasDigit = /\d+/.test(lowerMrp);

      if (!hasDigit) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: mrp,
          explanation: "MRP declaration does not contain a numeric price figure.",
          recommendation: "Provide the numerical retail sale price figure."
        };
      }

      // Check for tax inclusion phrasing
      const mentionsTaxes = lowerMrp.includes("tax") || lowerMrp.includes("incl");
      if (!mentionsTaxes) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: mrp,
          explanation: "MRP price detected, but mandatory phrase 'incl. of all taxes' or '(inclusive of all taxes)' was not confirmed.",
          recommendation: "Ensure price declaration explicitly states '(inclusive of all taxes)' or 'incl. of all taxes'."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: mrp.trim(),
        explanation: `MRP '${mrp.trim()}' is properly declared with tax statement.`
      };
    },
  },

  // 4. Unit Sale Price (USP) Declaration
  {
    id: "RULE-USP-01",
    code: "LM-2021-AMD-R6-1-F",
    name: "Unit Sale Price (USP) Declaration",
    category: "Pricing & USP",
    description:
      "For packages containing more than 1 kg or 1 litre, unit sale price per gram/kg/ml/litre or per unit must be declared alongside MRP.",
    applicable_categories: "ALL",
    required_field: "unit_sale_price",
    severity: "Minor",
    is_active: true,
    legal_reference: "Rule 6(1)(f) (as amended 2021), Legal Metrology (Packaged Commodities) Rules",
    recommendation_template:
      "Declare unit sale price in ₹ per gram/ml/piece (e.g. ₹0.20 / g or ₹15.00 / 100 ml) for packages where applicable.",
    validator: (data: PackageDeclarations) => {
      const usp = data.unit_sale_price || "";
      const qty = (data.net_quantity || "").toLowerCase();

      // Check if commodity quantity triggers mandatory USP (e.g. >100g, or multiple units)
      const isSmallPack = qty.includes("10 g") || qty.includes("20 g") || qty.includes("25 g") || qty.includes("50 g");

      if (!usp || isFieldEmptyOrNotDetected(usp)) {
        if (isSmallPack) {
          return {
            status: "PASS" as RuleStatus,
            detected_value: "Exempted / Not required for small pack",
            explanation: "Unit Sale Price (USP) is optional or exempted for small packages under Legal Metrology guidelines."
          };
        }
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: "Not detected",
          explanation: "Unit Sale Price (USP) not found. Required under 2021 amendment for consumer price transparency where applicable.",
          recommendation: "Declare Unit Sale Price (e.g. 'USP: ₹0.50/g' or 'USP: ₹2.00/unit') next to MRP."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: usp.trim(),
        explanation: `Unit Sale Price '${usp.trim()}' is declared.`
      };
    },
  },

  // 5. Complete Name & Address of Manufacturer / Packer
  {
    id: "RULE-MFG-01",
    code: "LM-2011-R6-1-D",
    name: "Manufacturer / Packer Name and Complete Address",
    category: "Manufacturer & Origin",
    description:
      "The name and complete physical address of the manufacturer or pre-packer including city, state, and postal PIN code must be stated.",
    applicable_categories: "ALL",
    required_field: "manufacturer_name",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(d), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Provide complete manufacturer name and physical postal address with city, state, and 6-digit PIN code.",
    validator: (data: PackageDeclarations) => {
      const mfgName = data.manufacturer_name || "";
      const mfgAddr = data.manufacturer_address || data.packer_address || "";

      if (!mfgName || isFieldEmptyOrNotDetected(mfgName)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: mfgName || "Not detected",
          explanation: "Manufacturer / Packer name is missing or not detected.",
          recommendation: "Declare the full corporate or business name of the manufacturer or pre-packer."
        };
      }

      if (!mfgAddr || isFieldEmptyOrNotDetected(mfgAddr)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: `${mfgName} (Address missing)`,
          explanation: "Manufacturer name is present, but complete address is missing.",
          recommendation: "Provide full postal address including premises, street, city, state, and PIN code."
        };
      }

      // Check if address has reasonable completeness (PIN code or city/state)
      const hasPin = /\b\d{6}\b/.test(mfgAddr);
      const isShort = mfgAddr.trim().length < 15;

      if (isShort && !hasPin) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: `${mfgName}, ${mfgAddr}`,
          explanation: "Address appears abbreviated. Indian Legal Metrology requires complete postal address for consumer notice.",
          recommendation: "Include full premises details, town/city, state, and 6-digit postal PIN code."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: `${mfgName}, ${mfgAddr}`,
        explanation: "Manufacturer name and address are declared on the package."
      };
    },
  },

  // 6. Consumer Care / Grievance Redressal Information
  {
    id: "RULE-CC-01",
    code: "LM-2011-R6-1-N",
    name: "Consumer Care & Grievance Redressal Details",
    category: "Consumer Grievance",
    description:
      "Name, designation, address, telephone number, and email address of the person or office who can be contacted in case of consumer complaints.",
    applicable_categories: "ALL",
    required_field: "consumer_care_phone",
    severity: "Major",
    is_active: true,
    legal_reference: "Rule 6(1)(n), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Provide consumer grievance contact with designation (e.g. Consumer Care Cell), toll-free phone/telephone, email ID, and postal address.",
    validator: (data: PackageDeclarations) => {
      const phone = data.consumer_care_phone || "";
      const email = data.consumer_care_email || "";
      const addr = data.consumer_care_address || data.consumer_care_name || "";

      const hasPhone = Boolean(phone && !isFieldEmptyOrNotDetected(phone));
      const hasEmail = Boolean(email && !isFieldEmptyOrNotDetected(email));
      const hasAddr = Boolean(addr && !isFieldEmptyOrNotDetected(addr));

      if (!hasPhone && !hasEmail && !hasAddr) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: "Not detected",
          explanation: "No consumer care or grievance contact details (phone, email, or address) detected on label.",
          recommendation: "Add mandatory Consumer Care Cell details including telephone number, email ID, and contact address."
        };
      }

      if (!hasPhone || !hasEmail) {
        const missingList: string[] = [];
        if (!hasPhone) missingList.push("telephone/toll-free number");
        if (!hasEmail) missingList.push("email address");
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: [phone, email, addr].filter(Boolean).join(" | "),
          explanation: `Consumer care is partially declared; missing ${missingList.join(" and ")}. Legal Metrology Rule 6(1)(n) requires phone and email contacts.`,
          recommendation: "Ensure both active telephone/toll-free contact number and official email address are displayed."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: `Phone: ${phone} | Email: ${email}`,
        explanation: "Comprehensive consumer care contact information (phone and email) is present."
      };
    },
  },

  // 7. Country of Origin
  {
    id: "RULE-COO-01",
    code: "LM-2020-AMD-R6-10",
    name: "Country of Origin Declaration",
    category: "Manufacturer & Origin",
    description:
      "The country of origin or manufacture must be explicitly declared on every packaged commodity (e.g., 'Country of Origin: India').",
    applicable_categories: "ALL",
    required_field: "country_of_origin",
    severity: "Major",
    is_active: true,
    legal_reference: "Rule 6(10) & Rule 6(1)(m), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Explicitly state 'Country of Origin: [Country Name]' or 'Made in [Country Name]'.",
    validator: (data: PackageDeclarations) => {
      const coo = data.country_of_origin || "";
      if (!coo || isFieldEmptyOrNotDetected(coo)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: coo || "Not detected",
          explanation: "Country of origin declaration is missing or not detected.",
          recommendation: "Print 'Country of Origin: India' (or applicable country) on the package label."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: coo.trim(),
        explanation: `Country of origin '${coo.trim()}' is declared.`
      };
    },
  },

  // 8. Month and Year of Manufacture / Pre-packing
  {
    id: "RULE-DATE-01",
    code: "LM-2011-R6-1-C",
    name: "Month and Year of Manufacture / Pre-packing",
    category: "Dates & Traceability",
    description:
      "The month and year in which the commodity is manufactured or pre-packed must be clearly stated on the label.",
    applicable_categories: "ALL",
    required_field: "date_of_manufacture",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(c)/(d), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Print month and year of manufacture or packaging in clear numeric or word format (e.g. '08/2026' or 'Aug 2026').",
    validator: (data: PackageDeclarations) => {
      const mfgDate = data.date_of_manufacture || data.date_of_packing || data.date_of_import || "";
      if (!mfgDate || isFieldEmptyOrNotDetected(mfgDate)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: mfgDate || "Not detected",
          explanation: "Month and Year of manufacture, packaging, or import is missing.",
          recommendation: "Print 'Mfg Date: MM/YYYY' or 'Packed: Month Year' prominently on the package."
        };
      }

      // Check if format has month and year
      const hasMonthYear = /(0[1-9]|1[0-2]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\/\-\.]+(20\d{2}|\d{2})/i.test(
        mfgDate
      );

      if (!hasMonthYear) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: mfgDate,
          explanation: "Date format requires inspector verification for standard Month/Year representation.",
          recommendation: "Ensure format clearly indicates Month and Year (e.g. '08/2026' or 'AUG 2026')."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: mfgDate.trim(),
        explanation: `Manufacturing / packing date '${mfgDate.trim()}' is declared.`
      };
    },
  },

  // 9. Batch or Lot Number Declaration
  {
    id: "RULE-BATCH-01",
    code: "LM-2011-R6-1-G",
    name: "Batch / Lot Identification Number",
    category: "Dates & Traceability",
    description:
      "A batch number, lot number, or code number distinguishing the commodity package for quality and recall tracking.",
    applicable_categories: "ALL",
    required_field: "batch_number",
    severity: "Major",
    is_active: true,
    legal_reference: "Rule 6(1)(g), Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "Print lot or batch code (e.g. 'Batch No: B240801' or 'Lot: LK-99').",
    validator: (data: PackageDeclarations) => {
      const batch = data.batch_number || "";
      if (!batch || isFieldEmptyOrNotDetected(batch)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: batch || "Not detected",
          explanation: "Batch / Lot identifier is missing on the package.",
          recommendation: "Declare a distinct Batch No. or Lot Code for product traceability."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: batch.trim(),
        explanation: `Batch / Lot identifier '${batch.trim()}' is declared.`
      };
    },
  },

  // 10. Importer Details for Imported Commodities
  {
    id: "RULE-IMP-01",
    code: "LM-2011-R23",
    name: "Importer Details for Foreign Goods",
    category: "Manufacturer & Origin",
    description:
      "If the commodity is imported into India, the complete name and address of the importer must be declared.",
    applicable_categories: "ALL",
    required_field: "importer_name",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(d) & Rule 23, Legal Metrology (Packaged Commodities) Rules, 2011",
    recommendation_template:
      "For imported goods, declare full importer name, registered address in India, and import registration.",
    validator: (data: PackageDeclarations) => {
      const coo = (data.country_of_origin || "").toLowerCase();
      const isImported =
        coo.length > 0 &&
        !coo.includes("india") &&
        !coo.includes("not detected") &&
        !coo.includes("n/a");

      if (!isImported) {
        return {
          status: "NOT APPLICABLE" as RuleStatus,
          detected_value: "Domestic product (India) or not marked foreign",
          explanation: "Importer details are only required for commodities manufactured outside India and imported."
        };
      }

      const impName = data.importer_name || "";
      const impAddr = data.importer_address || "";

      if (!impName || isFieldEmptyOrNotDetected(impName) || !impAddr || isFieldEmptyOrNotDetected(impAddr)) {
        return {
          status: "FAIL" as RuleStatus,
          detected_value: impName ? `${impName} (Address missing)` : "Not detected",
          explanation: `Foreign origin '${data.country_of_origin}' detected, but complete Importer name and Indian address are missing.`,
          recommendation: "Provide full registered name and address of the Indian Importer."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: `${impName}, ${impAddr}`,
        explanation: `Importer details '${impName}' declared for imported commodity.`
      };
    },
  },

  // 11. Best Before / Expiry Date (Food / Perishables)
  {
    id: "RULE-EXP-01",
    code: "LM-2011-FSSAI-EXP",
    name: "Best Before / Expiry Date Declaration",
    category: "Dates & Traceability",
    description:
      "Food, beverage, and perishable packages must declare 'Best Before' or 'Expiry Date' with day/month/year or number of months from packing.",
    applicable_categories: ["Food & Beverages", "Cosmetics & Personal Care", "Pharmaceuticals & Healthcare"],
    required_field: "best_before_or_expiry",
    severity: "Critical",
    is_active: true,
    legal_reference: "Rule 6(1)(d) proviso & FSSAI Packaging Regulations",
    recommendation_template:
      "Declare 'Best Before: XX months from packaging' or 'Expiry Date: DD/MM/YYYY'.",
    validator: (data: PackageDeclarations) => {
      const exp = data.best_before_or_expiry || "";
      const isFoodOrPerishable =
        data.is_food_item ||
        (data.other_declarations &&
          data.other_declarations.some((d) => d.toLowerCase().includes("food") || d.toLowerCase().includes("edible")));

      if (!exp || isFieldEmptyOrNotDetected(exp)) {
        if (isFoodOrPerishable) {
          return {
            status: "FAIL" as RuleStatus,
            detected_value: "Not detected",
            explanation: "Best Before / Expiry date declaration is missing for food / perishable commodity.",
            recommendation: "Declare 'Best Before' period or exact expiry date on the label."
          };
        }
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: "Not detected",
          explanation: "Best Before / Expiry date not found. Verify whether this specific commodity is subject to expiration rules.",
          recommendation: "Ensure expiry information is provided if commodity has limited shelf life."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: exp.trim(),
        explanation: `Expiry / Best Before '${exp.trim()}' is declared.`
      };
    },
  },

  // 12. Food Specific Declarations (Veg/Non-Veg Symbol)
  {
    id: "RULE-VEG-01",
    code: "LM-2011-FSSAI-VEG",
    name: "Veg / Non-Veg Logo & Category Declarations",
    category: "Product Specifics",
    description:
      "Packaged food products must clearly display the mandatory Vegetarian (Green dot in green square) or Non-Vegetarian logo.",
    applicable_categories: ["Food & Beverages"],
    required_field: "veg_nonveg_symbol",
    severity: "Major",
    is_active: true,
    legal_reference: "FSSAI (Packaging and Labelling) & Legal Metrology Rule 6",
    recommendation_template:
      "Display the statutory Vegetarian or Non-Vegetarian emblem prominently on the display panel.",
    validator: (data: PackageDeclarations) => {
      if (!data.is_food_item) {
        return {
          status: "NOT APPLICABLE" as RuleStatus,
          detected_value: "Non-food commodity",
          explanation: "Vegetarian/Non-vegetarian emblem requirement applies specifically to packaged food items."
        };
      }

      const sym = data.veg_nonveg_symbol || "";
      if (
        !sym ||
        isFieldEmptyOrNotDetected(sym) ||
        sym === "Not Detected" ||
        sym === "Not Applicable"
      ) {
        return {
          status: "REVIEW REQUIRED" as RuleStatus,
          detected_value: sym || "Not detected",
          explanation: "Vegetarian / Non-Vegetarian symbol was not identified on this food package.",
          recommendation: "Print the required Green dot (Veg) or Brown/Red dot (Non-Veg) symbol in a prominent square on the front."
        };
      }

      return {
        status: "PASS" as RuleStatus,
        detected_value: sym,
        explanation: `Mandatory food emblem '${sym}' is declared.`
      };
    },
  },
];
