// End-to-End Live HTTP API & Page Verification Script for LegalMetrix
const assert = require("assert");

const BASE_URL = "http://localhost:3005";

async function runLiveVerification() {
  console.log("=================================================");
  console.log("LEGALMETRIX LIVE END-TO-END HTTP TEST SUITE");
  console.log(`Target: ${BASE_URL}`);
  console.log("=================================================");

  // 1. Verify Pages return 200 OK
  console.log("\n[TEST 1] Testing UI Route Rendering...");
  const pages = ["/", "/inspections/new", "/history", "/reports", "/products", "/settings"];
  for (const p of pages) {
    const res = await fetch(`${BASE_URL}${p}`);
    assert.strictEqual(res.status, 200, `Page ${p} should return HTTP 200`);
    const html = await res.text();
    assert(html.includes("LegalMetrix"), `Page ${p} should contain LegalMetrix brand`);
    console.log(`✓ PASS: ${p} rendered successfully (HTTP 200).`);
  }

  // 2. Test GET /api/stats
  console.log("\n[TEST 2] Testing GET /api/stats...");
  const statsRes = await fetch(`${BASE_URL}/api/stats`);
  assert.strictEqual(statsRes.status, 200);
  const stats = await statsRes.json();
  console.log("Dashboard Stats received:", {
    total: stats.total_inspections,
    compliant: stats.compliant_count,
    non_compliant: stats.non_compliant_count,
    average_score: stats.average_score,
  });
  assert(stats.total_inspections >= 3);
  assert(stats.average_score > 0);
  console.log("✓ PASS: GET /api/stats returned valid statistics.");

  // 3. Test GET /api/inspections
  console.log("\n[TEST 3] Testing GET /api/inspections...");
  const inspRes = await fetch(`${BASE_URL}/api/inspections`);
  assert.strictEqual(inspRes.status, 200);
  const inspData = await inspRes.json();
  assert(Array.isArray(inspData.inspections));
  console.log(`✓ PASS: Retrieved ${inspData.inspections.length} inspection records.`);

  // 4. Test POST /api/extract with Sample Preset
  console.log("\n[TEST 4] Testing POST /api/extract...");
  const extractRes = await fetch(`${BASE_URL}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      presetSampleId: "SAMPLE-COMPLIANT-01",
      productName: "PureBrew Himalayan Green Tea (250 g)",
      category: "Food & Beverages",
    }),
  });
  assert.strictEqual(extractRes.status, 200);
  const extractData = await extractRes.json();
  assert.strictEqual(extractData.success, true);
  assert.strictEqual(extractData.declarations.net_quantity, "250 g");
  assert.strictEqual(extractData.declarations.country_of_origin, "India");
  console.log("✓ PASS: Extracted declarations validated successfully.");

  // 5. Test POST /api/inspections (Create New Inspection)
  console.log("\n[TEST 5] Testing POST /api/inspections (Create New Audit Run)...");
  const newInspectionPayload = {
    id: "INS-2026-LIVE-TEST",
    category: "Food & Beverages",
    confirmed_data: {
      product_name: "Live Test Himalayan Honey 500g",
      generic_name: "Pure Natural Honey",
      net_quantity: "500 g",
      mrp: "₹350.00 (incl. of all taxes)",
      unit_sale_price: "₹0.70 / g",
      manufacturer_name: "Himalayan Apiaries Ltd",
      manufacturer_address: "Plot 88, Green Valley, Shimla, Himachal Pradesh - 171001",
      consumer_care_phone: "1800-444-5555",
      consumer_care_email: "support@himalayanapiaries.in",
      consumer_care_address: "Plot 88, Green Valley, Shimla, Himachal Pradesh - 171001",
      country_of_origin: "India",
      date_of_manufacture: "08/2026",
      date_of_packing: "08/2026",
      best_before_or_expiry: "Best Before 18 Months",
      batch_number: "HONEY-2026-X1",
      is_food_item: true,
      veg_nonveg_symbol: "Vegetarian (Green)",
      other_declarations: ["FSSAI Lic: 10022033000111"],
    },
  };

  const createRes = await fetch(`${BASE_URL}/api/inspections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newInspectionPayload),
  });
  assert.strictEqual(createRes.status, 200);
  const createdData = await createRes.json();
  assert.strictEqual(createdData.success, true);
  assert.strictEqual(createdData.inspection.id, "INS-2026-LIVE-TEST");
  assert.strictEqual(createdData.inspection.score, 100);
  assert.strictEqual(createdData.inspection.status, "COMPLIANT");
  console.log("✓ PASS: New inspection created with score 100/100 and COMPLIANT status.");

  // 6. Test GET /api/inspections/[id]
  console.log("\n[TEST 6] Testing GET /api/inspections/INS-2026-LIVE-TEST...");
  const getSingleRes = await fetch(`${BASE_URL}/api/inspections/INS-2026-LIVE-TEST`);
  assert.strictEqual(getSingleRes.status, 200);
  const singleData = await getSingleRes.json();
  assert.strictEqual(singleData.inspection.product_name, "Live Test Himalayan Honey 500g");
  console.log("✓ PASS: Retrieved persisted inspection successfully.");

  // 7. Test GET /api/inspections/[id]/pdf
  console.log("\n[TEST 7] Testing GET /api/inspections/INS-2026-LIVE-TEST/pdf...");
  const pdfRes = await fetch(`${BASE_URL}/api/inspections/INS-2026-LIVE-TEST/pdf`);
  assert.strictEqual(pdfRes.status, 200);
  assert.strictEqual(pdfRes.headers.get("content-type"), "application/pdf");
  const pdfBuffer = await pdfRes.arrayBuffer();
  assert(pdfBuffer.byteLength > 2000, "PDF buffer must contain vector report data");
  console.log(`✓ PASS: Generated PDF download stream (${pdfBuffer.byteLength} bytes).`);

  // 8. Test GET /api/products
  console.log("\n[TEST 8] Testing GET /api/products...");
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  assert.strictEqual(prodRes.status, 200);
  const prodData = await prodRes.json();
  const honeyProd = prodData.products.find(p => p.product_name.includes("Himalayan Honey"));
  assert(honeyProd !== undefined);
  console.log("✓ PASS: Products catalog verified.");

  // 9. Test GET /api/rules & PUT /api/rules
  console.log("\n[TEST 9] Testing GET & PUT /api/rules...");
  const rulesRes = await fetch(`${BASE_URL}/api/rules`);
  assert.strictEqual(rulesRes.status, 200);
  const rulesData = await rulesRes.json();
  assert(rulesData.rules.length >= 12);

  const toggleRes = await fetch(`${BASE_URL}/api/rules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "RULE-USP-01",
      is_active: false,
    }),
  });
  assert.strictEqual(toggleRes.status, 200);

  // Restore rule
  await fetch(`${BASE_URL}/api/rules`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "RULE-USP-01",
      is_active: true,
    }),
  });
  console.log("✓ PASS: Configurable compliance rules dynamic update verified.");

  // 10. Test DELETE /api/inspections/[id]
  console.log("\n[TEST 10] Testing DELETE /api/inspections/INS-2026-LIVE-TEST...");
  const delRes = await fetch(`${BASE_URL}/api/inspections/INS-2026-LIVE-TEST`, {
    method: "DELETE",
  });
  assert.strictEqual(delRes.status, 200);
  console.log("✓ PASS: Inspection deleted cleanly.");

  console.log("\n=================================================");
  console.log("ALL 10 LIVE HTTP API & UI END-TO-END TESTS PASSED! ✓");
  console.log("=================================================\n");
}

runLiveVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
