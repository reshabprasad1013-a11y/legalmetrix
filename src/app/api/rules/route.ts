import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";

export async function GET() {
  try {
    const rules = await DBRepository.getAllRules();
    return NextResponse.json({ rules });
  } catch (error: any) {
    console.error("GET /api/rules error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Rule ID is required" }, { status: 400 });
    }

    const updated = await DBRepository.updateRule(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule: updated });
  } catch (error: any) {
    console.error("PUT /api/rules error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
