import { CommodityCategory, ComplianceEvaluation, PackageDeclarations, RuleResult, CategoryScore, OverallInspectionStatus } from "@/types/inspection";
import { ComplianceRuleDefinition } from "@/types/rules";
import { COMPLIANCE_RULES } from "./rules";

export function evaluateCompliance(
  data: PackageDeclarations,
  category: CommodityCategory = "General Packaged Commodities",
  activeRules: ComplianceRuleDefinition[] = COMPLIANCE_RULES
): ComplianceEvaluation {
  const ruleResults: RuleResult[] = [];
  const violations: RuleResult[] = [];
  const recommendations: string[] = [];

  // Filter rules that are active and applicable to this commodity category
  const applicableRules = activeRules.filter((rule) => {
    if (!rule.is_active) return false;
    if (rule.applicable_categories === "ALL") return true;
    return rule.applicable_categories.includes(category);
  });

  // Evaluate each rule
  for (const rule of applicableRules) {
    const valResult = rule.validator(data);

    const res: RuleResult = {
      rule_id: rule.id,
      rule_name: rule.name,
      category: rule.category,
      requirement: rule.description,
      detected_value: valResult.detected_value || "Not detected",
      status: valResult.status,
      severity: rule.severity,
      explanation: valResult.explanation,
      legal_reference: rule.legal_reference,
      recommendation: valResult.recommendation || rule.recommendation_template,
      field_key: rule.required_field,
    };

    ruleResults.push(res);

    if (valResult.status === "FAIL") {
      violations.push(res);
      if (res.recommendation && !recommendations.includes(res.recommendation)) {
        recommendations.push(res.recommendation);
      }
    } else if (valResult.status === "REVIEW REQUIRED") {
      if (res.recommendation && !recommendations.includes(res.recommendation)) {
        recommendations.push(`[Verification Required] ${res.recommendation}`);
      }
    }
  }

  // Count summaries
  const total_checked = ruleResults.filter((r) => r.status !== "NOT APPLICABLE").length;
  const passed_count = ruleResults.filter((r) => r.status === "PASS").length;
  const failed_count = ruleResults.filter((r) => r.status === "FAIL").length;
  const review_count = ruleResults.filter((r) => r.status === "REVIEW REQUIRED").length;
  const not_applicable_count = ruleResults.filter((r) => r.status === "NOT APPLICABLE").length;

  const critical_violations = violations.filter((v) => v.severity === "Critical").length;
  const major_violations = violations.filter((v) => v.severity === "Major").length;
  const minor_violations = violations.filter((v) => v.severity === "Minor").length;

  // Calculate Category-level scores
  const categoryGroups: { [cat: string]: RuleResult[] } = {};
  for (const r of ruleResults) {
    if (r.status === "NOT APPLICABLE") continue;
    if (!categoryGroups[r.category]) {
      categoryGroups[r.category] = [];
    }
    categoryGroups[r.category].push(r);
  }

  const category_scores: CategoryScore[] = Object.entries(categoryGroups).map(([catName, list]) => {
    const total = list.length;
    const passed = list.filter((x) => x.status === "PASS").length;
    const failed = list.filter((x) => x.status === "FAIL").length;
    const review = list.filter((x) => x.status === "REVIEW REQUIRED").length;

    // Category percentage
    let catScore = 100;
    if (total > 0) {
      let penalty = 0;
      for (const item of list) {
        if (item.status === "FAIL") {
          penalty += item.severity === "Critical" ? 50 : item.severity === "Major" ? 30 : 15;
        } else if (item.status === "REVIEW REQUIRED") {
          penalty += 10;
        }
      }
      catScore = Math.max(0, Math.min(100, 100 - penalty));
    }

    return {
      category: catName,
      score: Math.round(catScore),
      total_rules: total,
      passed_rules: passed,
      failed_rules: failed,
      review_rules: review,
      weight: 1,
    };
  });

  // Calculate Overall Transparent Score (0 - 100)
  // Deductions:
  // - Critical Fail: -25 points
  // - Major Fail: -15 points
  // - Minor Fail: -5 points
  // - Review Required: -5 points
  let scoreDeduction =
    critical_violations * 25 +
    major_violations * 15 +
    minor_violations * 5 +
    review_count * 5;

  let overall_score = Math.max(0, Math.min(100, 100 - scoreDeduction));

  // Determine Overall Status
  let overall_status: OverallInspectionStatus = "COMPLIANT";
  if (critical_violations > 0 || overall_score < 70) {
    overall_status = "NON-COMPLIANT";
  } else if (failed_count > 0 || review_count > 0 || overall_score < 90) {
    overall_status = "REVIEW REQUIRED";
  } else {
    overall_status = "COMPLIANT";
  }

  return {
    overall_score: Math.round(overall_score),
    overall_status,
    summary: {
      total_checked,
      passed_count,
      failed_count,
      review_count,
      not_applicable_count,
      critical_violations,
      major_violations,
      minor_violations,
    },
    category_scores,
    rule_results: ruleResults,
    violations,
    recommendations,
    evaluation_timestamp: new Date().toISOString(),
    rule_version: "Legal Metrology (Packaged Commodities) 2011 v1.2",
  };
}
