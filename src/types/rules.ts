import { CommodityCategory, PackageDeclarations, RuleResult, RuleSeverity, RuleStatus } from "./inspection";

export interface ComplianceRuleDefinition {
  id: string; // e.g. "RULE-NETQTY-01"
  code: string; // e.g. "LM-2011-R6-1-B"
  name: string;
  category: "Mandatory Declarations" | "Net Quantity & Units" | "Pricing & USP" | "Manufacturer & Origin" | "Consumer Grievance" | "Dates & Traceability" | "Product Specifics";
  description: string;
  applicable_categories: CommodityCategory[] | "ALL";
  required_field: keyof PackageDeclarations | "composite";
  severity: RuleSeverity;
  is_active: boolean;
  legal_reference: string;
  recommendation_template: string;
  validator: (data: PackageDeclarations) => {
    status: RuleStatus;
    detected_value: string;
    explanation: string;
    recommendation?: string;
  };
}
