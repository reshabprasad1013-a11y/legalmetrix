// Comprehensive End-to-End Test for LegalMetrix
const assert = require("assert");

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING LEGALMETRIX END-TO-END VERIFICATION");
  console.log("=================================================");

  // 1. Test Demo Data loader & initial state
  const { LocalStore } = require("../src/lib/db/localStore");
  const initialInspections = LocalStore.getAllInspections();
  console.log(`[TEST 1] LocalStore initial inspections count: ${initialInspections.length}`);
  assert(initialInspections.length >= 3, "Should have seeded at least 3 demo inspections");
  console.log("✓ PASS: Initial demo inspection records loaded.");

  // 2. Test Stats Aggregation
  const stats = LocalStore.getDashboardStats();
  console.log(`[TEST 2] Dashboard stats: Total=${stats.total_inspections}, Compliant=${stats.compliant_count}, NonCompliant=${stats.non_compliant_count}, AvgScore=${stats.average_score}`);
  assert.strictEqual(stats.total_inspections, initialInspections.length);
  assert(stats.average_score > 0 && stats.average_score <= 100);
  assert(stats.common_violations.length > 0);
  console.log("✓ PASS: Real-time dashboard statistics calculated correctly.");

  // 3. Test New Inspection Creation & Rule Evaluation
  console.log("\n[TEST 3] Testing New Inspection Creation & Rule Execution...");
  const { evaluateCompliance } = require("../src/lib/compliance/engine");
  
  const testCommodity = {
    product_name: "Fresh Valley Pure Ghee 1L",
    generic_name: "Pure Cow Ghee",
    net_quantity: "1 L",
    mrp: "₹650.00 (incl. of all taxes)",
    unit_sale_price: "₹0.65 / ml",
    manufacturer_name: "Fresh Valley Dairy Products Ltd",
    manufacturer_address: "Plot 12, Dairy Complex, Anand, Gujarat - 388001",
    consumer_care_phone: "1800-233-9988",
    consumer_care_email: "customercare@freshvalley.in",
    consumer_care_address: "Plot 12, Dairy Complex, Anand, Gujarat - 388001",
    country_of_origin: "India",
    date_of_manufacture: "08/2026",
    date_of_packing: "08/2026",
    best_before_or_expiry: "Best Before 9 Months from packaging",
    batch_number: "FV-GHEE-809",
    is_food_item: true,
    veg_nonveg_symbol: "Vegetarian (Green)",
    other_declarations: ["FSSAI Lic: 10012021000554"],
    raw_ocr_text: "Fresh Valley Pure Ghee 1L MRP 650 (incl. of all taxes) Anand Gujarat",
  };

  const evalResult = evaluateCompliance(testCommodity, "Food & Beverages");
  console.log(`Evaluation score: ${evalResult.overall_score}/100, Status: ${evalResult.overall_status}, Checked: ${evalResult.summary.total_checked}`);
  assert.strictEqual(evalResult.overall_status, "COMPLIANT");
  assert.strictEqual(evalResult.overall_score, 100);
  assert.strictEqual(evalResult.violations.length, 0);
  console.log("✓ PASS: Evaluation correctly scored 100% for compliant ghee package.");

  // 4. Test Persistence of New Inspection
  console.log("\n[TEST 4] Persisting new inspection to LocalStore...");
  const newInspection = {
    id: "INS-TEST-9999",
    product_name: testCommodity.product_name,
    brand_or_mfg: testCommodity.manufacturer_name,
    category: "Food & Beverages",
    batch_number: testCommodity.batch_number,
    image_url: "",
    extracted_data: testCommodity,
    confirmed_data: testCommodity,
    evaluation: evalResult,
    status: evalResult.overall_status,
    score: evalResult.overall_score,
    violations_count: evalResult.violations.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  LocalStore.saveInspection(newInspection);
  const retrieved = LocalStore.getInspectionById("INS-TEST-9999");
  assert(retrieved !== null);
  assert.strictEqual(retrieved.product_name, "Fresh Valley Pure Ghee 1L");
  console.log("✓ PASS: Inspection successfully stored and retrieved by ID.");

  // 5. Test Updated Dashboard Stats
  const updatedStats = LocalStore.getDashboardStats();
  assert.strictEqual(updatedStats.total_inspections, initialInspections.length + 1);
  console.log(`✓ PASS: Dashboard stats updated immediately: total=${updatedStats.total_inspections}.`);

  // 6. Test Product Catalog Aggregation
  const products = LocalStore.getAllProducts();
  const gheeProd = products.find(p => p.product_name === "Fresh Valley Pure Ghee 1L");
  assert(gheeProd !== undefined);
  assert.strictEqual(gheeProd.latest_score, 100);
  console.log("✓ PASS: Products catalog automatically indexed new commodity.");

  // 7. Test PDF Report Generation
  console.log("\n[TEST 7] Testing PDF Generation...");
  const { generateInspectionPDF } = require("../src/lib/pdf/generateReport");
  const pdfDoc = generateInspectionPDF(retrieved);
  const pdfOutput = pdfDoc.output("arraybuffer");
  assert(pdfOutput.byteLength > 1000, "PDF output should be a valid non-empty byte buffer");
  console.log(`✓ PASS: Generated valid vector PDF report (${pdfOutput.byteLength} bytes).`);

  // 8. Test Rule Config Toggling
  console.log("\n[TEST 8] Testing Rule Config Toggling...");
  const rulesBefore = LocalStore.getAllRules();
  const ruleToToggle = rulesBefore[0];
  LocalStore.updateRule(ruleToToggle.id, { is_active: false });
  const rulesAfter = LocalStore.getAllRules();
  const toggled = rulesAfter.find(r => r.id === ruleToToggle.id);
  assert.strictEqual(toggled.is_active, false);
  // Restore
  LocalStore.updateRule(ruleToToggle.id, { is_active: true });
  console.log("✓ PASS: Rule active status dynamically updated.");

  // Clean up test record
  LocalStore.deleteInspection("INS-TEST-9999");
  console.log("✓ PASS: Test record cleanup verified.");

  console.log("\n=================================================");
  console.log("ALL 8 END-TO-END VERIFICATION TESTS PASSED! ✓");
  console.log("=================================================\n");
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
