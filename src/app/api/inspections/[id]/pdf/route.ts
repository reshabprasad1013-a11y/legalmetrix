import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";
import { generateInspectionPDF } from "@/lib/pdf/generateReport";

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

    const doc = generateInspectionPDF(inspection);
    const pdfArrayBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="LegalMetrix_Report_${inspection.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/inspections/[id]/pdf error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
