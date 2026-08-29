import { NextRequest, NextResponse } from "next/server";
import { DBRepository } from "@/lib/db/repository";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const data = await DBRepository.getProductDetails(decodedName);

    if (!data.product && data.inspections.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/products/[name] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
