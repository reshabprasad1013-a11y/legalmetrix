import { InspectionRecord } from "@/types/inspection";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase";
import { LocalStore, ProductSummary, StoredRuleConfig } from "./localStore";

export const DBRepository = {
  async getAllInspections(): Promise<InspectionRecord[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("inspections")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data as InspectionRecord[];
        }
      } catch (e) {
        console.warn("Supabase fetch failed, using local store:", e);
      }
    }
    return LocalStore.getAllInspections();
  },

  async getInspectionById(id: string): Promise<InspectionRecord | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("inspections")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as InspectionRecord;
        }
      } catch (e) {
        console.warn("Supabase single fetch failed, using local store:", e);
      }
    }
    return LocalStore.getInspectionById(id);
  },

  async saveInspection(inspection: InspectionRecord): Promise<InspectionRecord> {
    // Always persist to local store for offline consistency
    LocalStore.saveInspection(inspection);

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from("inspections").upsert({
          id: inspection.id,
          product_name: inspection.product_name,
          brand_or_mfg: inspection.brand_or_mfg,
          category: inspection.category,
          batch_number: inspection.batch_number,
          image_url: inspection.image_url,
          image_filename: inspection.image_filename,
          status: inspection.status,
          score: inspection.score,
          violations_count: inspection.violations_count,
          extracted_data: inspection.extracted_data,
          confirmed_data: inspection.confirmed_data,
          evaluation: inspection.evaluation,
          notes: inspection.notes,
          is_demo: inspection.is_demo || false,
          created_at: inspection.created_at,
          updated_at: new Date().toISOString(),
        });

        // Also upsert product
        await supabaseAdmin.from("products").upsert(
          {
            product_name: inspection.product_name,
            manufacturer: inspection.brand_or_mfg,
            category: inspection.category,
            latest_score: inspection.score,
            latest_status: inspection.status,
            last_inspected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "product_name" }
        );
      } catch (e) {
        console.warn("Supabase save failed (stored locally):", e);
      }
    }

    return inspection;
  },

  async deleteInspection(id: string): Promise<boolean> {
    const localResult = LocalStore.deleteInspection(id);
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from("inspections").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase delete failed:", e);
      }
    }
    return localResult;
  },

  async getAllProducts(): Promise<ProductSummary[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("products")
          .select("*")
          .order("last_inspected_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return data as ProductSummary[];
        }
      } catch (e) {
        console.warn("Supabase products fetch failed, using local store:", e);
      }
    }
    return LocalStore.getAllProducts();
  },

  async getProductDetails(name: string): Promise<{ product: ProductSummary | null; inspections: InspectionRecord[] }> {
    return LocalStore.getProductByName(name);
  },

  async getAllRules(): Promise<StoredRuleConfig[]> {
    return LocalStore.getAllRules();
  },

  async updateRule(id: string, updates: Partial<StoredRuleConfig>): Promise<StoredRuleConfig | null> {
    return LocalStore.updateRule(id, updates);
  },

  async getDashboardStats() {
    return LocalStore.getDashboardStats();
  },
};
