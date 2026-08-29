export type RuleSeverity = "Critical" | "Major" | "Minor";

export type RuleStatus = "PASS" | "FAIL" | "REVIEW REQUIRED" | "NOT APPLICABLE";

export type OverallInspectionStatus = "COMPLIANT" | "NON-COMPLIANT" | "REVIEW REQUIRED";

export type CommodityCategory =
  | "Food & Beverages"
  | "Cosmetics & Personal Care"
  | "Pharmaceuticals & Healthcare"
  | "Household & Cleaning"
  | "Electronics & Appliances"
  | "Apparel & Textiles"
  | "General Packaged Commodities";

export interface PackageDeclarations {
  product_name: string;
  generic_name?: string;
  net_quantity: string;
  net_quantity_unit?: string;
  net_quantity_value?: number;
  mrp: string;
  mrp_value?: number;
  unit_sale_price?: string;
  manufacturer_name: string;
  manufacturer_address: string;
  packer_name?: string;
  packer_address?: string;
  importer_name?: string;
  importer_address?: string;
  consumer_care_name?: string;
  consumer_care_phone?: string;
  consumer_care_email?: string;
  consumer_care_address?: string;
  country_of_origin: string;
  date_of_manufacture?: string;
  date_of_packing?: string;
  date_of_import?: string;
  best_before_or_expiry?: string;
  batch_number: string;
  is_food_item?: boolean;
  veg_nonveg_symbol?: "Vegetarian (Green)" | "Non-Vegetarian (Brown/Red)" | "Not Applicable" | "Not Detected";
  dimensions?: string;
  other_declarations: string[];
  raw_ocr_text?: string;
}

export interface RuleResult {
  rule_id: string;
  rule_name: string;
  category: string;
  requirement: string;
  detected_value: string;
  status: RuleStatus;
  severity: RuleSeverity;
  explanation: string;
  legal_reference: string;
  recommendation: string;
  field_key?: keyof PackageDeclarations | string;
}

export interface CategoryScore {
  category: string;
  score: number; // 0-100
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  review_rules: number;
  weight: number;
}

export interface ComplianceEvaluation {
  overall_score: number; // 0 - 100
  overall_status: OverallInspectionStatus;
  summary: {
    total_checked: number;
    passed_count: number;
    failed_count: number;
    review_count: number;
    not_applicable_count: number;
    critical_violations: number;
    major_violations: number;
    minor_violations: number;
  };
  category_scores: CategoryScore[];
  rule_results: RuleResult[];
  violations: RuleResult[];
  recommendations: string[];
  evaluation_timestamp: string;
  rule_version: string;
}

export interface InspectionRecord {
  id: string; // e.g. INS-2026-8741
  product_name: string;
  brand_or_mfg: string;
  category: CommodityCategory;
  batch_number: string;
  image_url: string;
  image_filename?: string;
  extracted_data: PackageDeclarations;
  confirmed_data: PackageDeclarations;
  evaluation: ComplianceEvaluation;
  status: OverallInspectionStatus;
  score: number;
  violations_count: number;
  notes?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}
