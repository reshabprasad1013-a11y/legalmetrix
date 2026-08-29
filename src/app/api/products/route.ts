import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";

export async function GET() {
  try {
    const products = await DBRepository.getAllProducts();
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
