import { NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";

export async function GET() {
  try {
    const stats = await DBRepository.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
