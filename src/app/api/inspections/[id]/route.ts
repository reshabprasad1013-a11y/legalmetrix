import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inspection = await DBRepository.getInspectionById(id);

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json({ inspection });
  } catch (error: any) {
    console.error("GET /api/inspections/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await DBRepository.deleteInspection(id);

    if (!deleted) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Inspection deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/inspections/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
