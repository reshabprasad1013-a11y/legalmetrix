import { NextRequest, NextResponse } from "next/server";
import { processPackageExtraction } from "@/lib/ocr/extractor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await processPackageExtraction(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API extract error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process image extraction",
        provider: "manual_fallback",
        declarations: {
          product_name: "Not detected",
          generic_name: "Not detected",
          net_quantity: "Not detected",
          mrp: "Not detected",
          unit_sale_price: "Not detected",
          manufacturer_name: "Not detected",
          manufacturer_address: "Not detected",
          country_of_origin: "Not detected",
          batch_number: "Not detected",
          other_declarations: [],
          raw_ocr_text: "Extraction encountered an error. Please enter details manually.",
        },
      },
      { status: 200 }
    );
  }
}
