import fs from "fs";
import path from "path";
import { InspectionRecord, OverallInspectionStatus } from "@/types/inspection";
import { ComplianceRuleDefinition } from "@/types/rules";
import { COMPLIANCE_RULES } from "../compliance/rules";
import { getDemoInspectionRecords } from "../demo/sampleData";

export interface ProductSummary {
  id: string;
  product_name: string;
  manufacturer: string;
  category: string;
  product_code?: string;
  total_inspections: number;
  latest_score: number;
  latest_status: OverallInspectionStatus;
  last_inspected_at: string;
  created_at: string;
  updated_at: string;
}

export interface StoredRuleConfig {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  applicable_categories: any;
  required_field: string;
  severity: "Critical" | "Major" | "Minor";
  is_active: boolean;
  legal_reference: string;
  recommendation_template: string;
}

interface LocalDatabaseState {
  inspections: InspectionRecord[];
  products: ProductSummary[];
  rules: StoredRuleConfig[];
  version: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE_PATH = path.join(DATA_DIR, "storage.json");

let memoryCache: LocalDatabaseState | null = null;

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error("Failed to create data directory:", e);
    }
  }
}

function getInitialState(): LocalDatabaseState {
  const demoInspections = getDemoInspectionRecords();
  
  const products: ProductSummary[] = demoInspections.map((ins) => ({
    id: `prod_${ins.id.toLowerCase()}`,
    product_name: ins.product_name,
    manufacturer: ins.brand_or_mfg,
    category: ins.category,
    product_code: ins.batch_number || "PROD-001",
    total_inspections: 1,
    latest_score: ins.score,
    latest_status: ins.status,
    last_inspected_at: ins.created_at,
    created_at: ins.created_at,
    updated_at: ins.updated_at,
  }));

  const rules: StoredRuleConfig[] = COMPLIANCE_RULES.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description,
    applicable_categories: r.applicable_categories,
    required_field: String(r.required_field),
    severity: r.severity,
    is_active: r.is_active,
    legal_reference: r.legal_reference,
    recommendation_template: r.recommendation_template,
  }));

  return {
    inspections: demoInspections,
    products,
    rules,
    version: 1,
  };
}

function readStorage(): LocalDatabaseState {
  if (memoryCache) {
    return memoryCache;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content) as LocalDatabaseState;
      if (parsed && Array.isArray(parsed.inspections)) {
        memoryCache = parsed;
        return memoryCache;
      }
    } catch (err) {
      console.warn("Failed reading DB file, initializing fresh storage:", err);
    }
  }

  const initial = getInitialState();
  writeStorage(initial);
  memoryCache = initial;
  return memoryCache;
}

function writeStorage(state: LocalDatabaseState): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(state, null, 2), "utf-8");
    memoryCache = state;
  } catch (err) {
    console.error("Failed to write persistent local store:", err);
    memoryCache = state;
  }
}

// ----------------- INSPECTIONS REPOSITORY -----------------

export const LocalStore = {
  getAllInspections(): InspectionRecord[] {
    const db = readStorage();
    return [...db.inspections].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getInspectionById(id: string): InspectionRecord | null {
    const db = readStorage();
    return db.inspections.find((i) => i.id === id) || null;
  },

  saveInspection(inspection: InspectionRecord): InspectionRecord {
    const db = readStorage();
    const existingIndex = db.inspections.findIndex((i) => i.id === inspection.id);

    if (existingIndex >= 0) {
      db.inspections[existingIndex] = {
        ...inspection,
        updated_at: new Date().toISOString(),
      };
    } else {
      db.inspections.unshift({
        ...inspection,
        created_at: inspection.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Update or insert into products table
    const prodName = inspection.product_name || "Unknown Product";
    const prodIndex = db.products.findIndex(
      (p) => p.product_name.toLowerCase() === prodName.toLowerCase()
    );

    if (prodIndex >= 0) {
      const existing = db.products[prodIndex];
      db.products[prodIndex] = {
        ...existing,
        total_inspections: existing.total_inspections + (existingIndex >= 0 ? 0 : 1),
        latest_score: inspection.score,
        latest_status: inspection.status,
        last_inspected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      db.products.push({
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        product_name: prodName,
        manufacturer: inspection.brand_or_mfg || "Unspecified",
        category: inspection.category,
        product_code: inspection.batch_number || undefined,
        total_inspections: 1,
        latest_score: inspection.score,
        latest_status: inspection.status,
        last_inspected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    writeStorage(db);
    return inspection;
  },

  deleteInspection(id: string): boolean {
    const db = readStorage();
    const initialLen = db.inspections.length;
    db.inspections = db.inspections.filter((i) => i.id !== id);
    if (db.inspections.length !== initialLen) {
      writeStorage(db);
      return true;
    }
    return false;
  },

  // ----------------- PRODUCTS REPOSITORY -----------------

  getAllProducts(): ProductSummary[] {
    const db = readStorage();
    return [...db.products].sort(
      (a, b) => new Date(b.last_inspected_at).getTime() - new Date(a.last_inspected_at).getTime()
    );
  },

  getProductByName(name: string): { product: ProductSummary | null; inspections: InspectionRecord[] } {
    const db = readStorage();
    const product =
      db.products.find((p) => p.product_name.toLowerCase() === name.toLowerCase()) || null;
    const inspections = db.inspections.filter(
      (i) => i.product_name.toLowerCase() === name.toLowerCase()
    );
    return { product, inspections };
  },

  // ----------------- RULES CONFIGURATION -----------------

  getAllRules(): StoredRuleConfig[] {
    const db = readStorage();
    return db.rules || [];
  },

  updateRule(id: string, updates: Partial<StoredRuleConfig>): StoredRuleConfig | null {
    const db = readStorage();
    const idx = db.rules.findIndex((r) => r.id === id);
    if (idx >= 0) {
      db.rules[idx] = {
        ...db.rules[idx],
        ...updates,
      };
      writeStorage(db);
      return db.rules[idx];
    }
    return null;
  },

  // ----------------- DASHBOARD STATISTICS -----------------

  getDashboardStats() {
    const db = readStorage();
    const inspections = db.inspections;
    const total = inspections.length;

    if (total === 0) {
      return {
        total_inspections: 0,
        compliant_count: 0,
        non_compliant_count: 0,
        review_required_count: 0,
        average_score: 0,
        compliance_rate: 0,
        recent_inspections: [],
        common_violations: [],
        category_breakdown: [],
      };
    }

    const compliant_count = inspections.filter((i) => i.status === "COMPLIANT").length;
    const non_compliant_count = inspections.filter((i) => i.status === "NON-COMPLIANT").length;
    const review_required_count = inspections.filter((i) => i.status === "REVIEW REQUIRED").length;

    const totalScore = inspections.reduce((acc, i) => acc + (i.score || 0), 0);
    const average_score = Math.round((totalScore / total) * 10) / 10;
    const compliance_rate = Math.round((compliant_count / total) * 100);

    // Common violations aggregation
    const violationMap: { [key: string]: { count: number; name: string; severity: string; rule_id: string } } = {};
    for (const ins of inspections) {
      if (ins.evaluation?.violations) {
        for (const v of ins.evaluation.violations) {
          if (!violationMap[v.rule_id]) {
            violationMap[v.rule_id] = {
              count: 0,
              name: v.rule_name,
              severity: v.severity,
              rule_id: v.rule_id,
            };
          }
          violationMap[v.rule_id].count += 1;
        }
      }
    }

    const common_violations = Object.values(violationMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category breakdown aggregation
    const catMap: { [key: string]: { total: number; compliant: number; avgScore: number; sumScore: number } } = {};
    for (const ins of inspections) {
      const cat = ins.category || "General Packaged Commodities";
      if (!catMap[cat]) {
        catMap[cat] = { total: 0, compliant: 0, avgScore: 0, sumScore: 0 };
      }
      catMap[cat].total += 1;
      if (ins.status === "COMPLIANT") catMap[cat].compliant += 1;
      catMap[cat].sumScore += ins.score || 0;
    }

    const category_breakdown = Object.entries(catMap).map(([category, data]) => ({
      category,
      total: data.total,
      compliant: data.compliant,
      compliance_rate: Math.round((data.compliant / data.total) * 100),
      avg_score: Math.round(data.sumScore / data.total),
    }));

    return {
      total_inspections: total,
      compliant_count,
      non_compliant_count,
      review_required_count,
      average_score,
      compliance_rate,
      recent_inspections: inspections.slice(0, 5),
      common_violations,
      category_breakdown,
    };
  },
};
