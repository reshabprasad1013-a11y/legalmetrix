import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { InspectionRecord } from "@/types/inspection";
import { PROTOTYPE_LEGAL_DISCLAIMER } from "../compliance/standards";

export function generateInspectionPDF(inspection: InspectionRecord): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a navy-800
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo / Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("LEGALMETRIX", 14, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("AI-POWERED LEGAL METROLOGY COMPLIANCE AUDIT REPORT", 14, 21);

  // Status Badge in Header
  const status = inspection.status || "REVIEW REQUIRED";
  let badgeColor: [number, number, number] = [245, 158, 11]; // Amber
  if (status === "COMPLIANT") badgeColor = [16, 185, 129]; // Green
  if (status === "NON-COMPLIANT") badgeColor = [239, 68, 68]; // Red

  doc.setFillColor(...badgeColor);
  doc.roundedRect(pageWidth - 60, 8, 46, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(status, pageWidth - 37, 15.5, { align: "center" });

  y = 35;

  // 2. Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "bold");
  doc.text("INSPECTION ID:", 18, y + 7);
  doc.text("DATE & TIME:", 18, y + 14);
  doc.text("RULE STANDARD:", 18, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(inspection.id, 52, y + 7);
  doc.text(new Date(inspection.created_at || Date.now()).toLocaleString("en-IN"), 52, y + 14);
  doc.text("Legal Metrology (Packaged Commodities) Rules, 2011", 52, y + 21);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("SCORE:", pageWidth / 2 + 10, y + 7);
  doc.text("COMMODITY CATEGORY:", pageWidth / 2 + 10, y + 14);
  doc.text("TOTAL VIOLATIONS:", pageWidth / 2 + 10, y + 21);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(status === "COMPLIANT" ? 16 : status === "NON-COMPLIANT" ? 239 : 245, status === "COMPLIANT" ? 185 : status === "NON-COMPLIANT" ? 68 : 158, status === "COMPLIANT" ? 129 : status === "NON-COMPLIANT" ? 68 : 11);
  doc.text(`${inspection.score}/100`, pageWidth / 2 + 55, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(inspection.category || "General Packaged Goods", pageWidth / 2 + 55, y + 14);
  doc.text(`${inspection.violations_count} violation(s)`, pageWidth / 2 + 55, y + 21);

  y += 32;

  // 3. Product & Confirmed Declarations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("PRODUCT & LABEL DECLARATIONS", 14, y);
  y += 4;

  const data = inspection.confirmed_data || inspection.extracted_data || ({} as any);

  const productRows = [
    ["Product / Commodity Name", data.product_name || "Not detected"],
    ["Net Quantity Declared", data.net_quantity || "Not detected"],
    ["Maximum Retail Price (MRP)", data.mrp || "Not detected"],
    ["Unit Sale Price (USP)", data.unit_sale_price || "Not detected"],
    ["Manufacturer & Address", `${data.manufacturer_name || "Not detected"}, ${data.manufacturer_address || ""}`],
    ["Consumer Care / Grievance", `Phone: ${data.consumer_care_phone || "Not detected"} | Email: ${data.consumer_care_email || "Not detected"}`],
    ["Country of Origin", data.country_of_origin || "Not detected"],
    ["Month & Year of Mfg / Pkg", data.date_of_manufacture || data.date_of_packing || "Not detected"],
    ["Batch / Lot Identification", data.batch_number || "Not detected"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Mandatory Declaration Parameter", "Confirmed Label Value"]],
    body: productRows,
    theme: "striped",
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8.5, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: "bold" },
      1: { cellWidth: pageWidth - 28 - 65 },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // 4. Compliance Rule Findings Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("LEGAL METROLOGY RULE VERIFICATION FINDINGS", 14, y);
  y += 4;

  const ruleResults = inspection.evaluation?.rule_results || [];
  const findingsRows = ruleResults.map((r) => [
    r.rule_name,
    r.status,
    r.severity,
    r.detected_value,
    r.explanation,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Rule Requirement", "Result", "Severity", "Detected Value", "Regulatory Assessment & Note"]],
    body: findingsRows,
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" },
      1: { cellWidth: 20 },
      2: { cellWidth: 18 },
      3: { cellWidth: 35 },
      4: { cellWidth: pageWidth - 28 - 40 - 20 - 18 - 35 },
    },
    didParseCell: function (dataCell) {
      if (dataCell.section === "body" && dataCell.column.index === 1) {
        const val = dataCell.cell.raw;
        if (val === "PASS") {
          dataCell.cell.styles.textColor = [16, 185, 129];
          dataCell.cell.styles.fontStyle = "bold";
        } else if (val === "FAIL") {
          dataCell.cell.styles.textColor = [239, 68, 68];
          dataCell.cell.styles.fontStyle = "bold";
        } else if (val === "REVIEW REQUIRED") {
          dataCell.cell.styles.textColor = [217, 119, 6];
          dataCell.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for recommendations & disclaimer
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 20;
  }

  // 5. Corrective Recommendations Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("ACTIONABLE CORRECTIVE RECOMMENDATIONS", 14, y);
  y += 4;

  const recs = inspection.evaluation?.recommendations || [];
  if (recs.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, y, pageWidth - 28, 14, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text("No critical or major non-compliances detected. Commodity satisfies configured rules.", 18, y + 9);
    y += 20;
  } else {
    const recsList = recs.map((rec, i) => [`${i + 1}.`, rec]);
    autoTable(doc, {
      startY: y,
      body: recsList,
      theme: "plain",
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 8, fontStyle: "bold", textColor: [239, 68, 68] },
        1: { cellWidth: pageWidth - 28 - 8 },
      },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a new page for disclaimer
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }

  // 6. Mandatory Prototype Disclaimer
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("MANDATORY PROTOTYPE DISCLAIMER", 18, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitDisclaimer = doc.splitTextToSize(PROTOTYPE_LEGAL_DISCLAIMER, pageWidth - 36);
  doc.text(splitDisclaimer, 18, y + 11);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `LegalMetrix Compliance Audit • Page ${i} of ${totalPages} • Generated: ${new Date().toISOString()}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  return doc;
}
