import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";
import { evaluateCompliance } from "@/lib/compliance/engine";
import { InspectionRecord } from "@/types/inspection";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    let inspections = await DBRepository.getAllInspections();

    if (search) {
      inspections = inspections.filter(
        (i) =>
          i.product_name.toLowerCase().includes(search) ||
          i.id.toLowerCase().includes(search) ||
          (i.brand_or_mfg && i.brand_or_mfg.toLowerCase().includes(search)) ||
          (i.batch_number && i.batch_number.toLowerCase().includes(search))
      );
    }

    if (status && status !== "ALL") {
      inspections = inspections.filter((i) => i.status === status);
    }

    if (category && category !== "ALL") {
      inspections = inspections.filter((i) => i.category === category);
    }

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error("GET /api/inspections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const confirmedData = body.confirmed_data || body.extracted_data || {};
    const category = body.category || "General Packaged Commodities";

    // Run compliance evaluation
    const evaluation = evaluateCompliance(confirmedData, category);

    const inspectionId =
      body.id ||
      `INS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const inspectionRecord: InspectionRecord = {
      id: inspectionId,
      product_name: confirmedData.product_name || "Unknown Product",
      brand_or_mfg: confirmedData.manufacturer_name || body.brand_or_mfg || "Unspecified",
      category,
      batch_number: confirmedData.batch_number || body.batch_number || "Not detected",
      image_url: body.image_url || "",
      image_filename: body.image_filename,
      extracted_data: body.extracted_data || confirmedData,
      confirmed_data: confirmedData,
      evaluation,
      status: evaluation.overall_status,
      score: evaluation.overall_score,
      violations_count: evaluation.violations.length,
      notes: body.notes || "",
      is_demo: body.is_demo || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await DBRepository.saveInspection(inspectionRecord);
    return NextResponse.json({ success: true, inspection: saved });
  } catch (error: any) {
    console.error("POST /api/inspections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
