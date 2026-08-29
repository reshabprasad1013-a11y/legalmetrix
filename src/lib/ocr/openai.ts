import OpenAI from "openai";
import { PackageDeclarations } from "@/types/inspection";

const EXTRACTION_PROMPT = `
You are an expert Legal Metrology compliance inspection assistant.
Analyze the provided packaged commodity label image and extract all visible statutory declarations according to the Indian Legal Metrology (Packaged Commodities) Rules, 2011.

STRICT ACCURACY RULES:
1. Extract EXACTLY what is visible on the label.
2. DO NOT invent, hallucinate, or assume missing information.
3. If a field is not clearly visible on the image, set its value to "Not detected".
4. For Net Quantity, extract the full declaration including units.
5. For MRP, extract the price and any tax statements.
6. For Manufacturer, extract the full company name and complete postal address.
7. For Consumer Care, extract the telephone/toll-free number and email address.
8. For Country of Origin, extract the country.
9. For Dates, extract Month and Year of manufacture/packaging.
10. For Batch Number, extract the lot/batch code.

Return ONLY a valid JSON object matching the standard PackageDeclarations format.
`;

export async function extractWithOpenAI(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<PackageDeclarations | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const formattedUrl = base64Data.startsWith("data:")
      ? base64Data
      : `data:${mimeType};base64,${base64Data}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: formattedUrl,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as PackageDeclarations;
  } catch (error) {
    console.error("OpenAI Vision extraction error:", error);
    return null;
  }
}
