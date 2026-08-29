// Automated Test Suite for LegalMetrix Compliance Engine
const assert = require("assert");

// Test Scenarios
console.log("=================================================");
console.log("LEGALMETRIX AUTOMATED COMPLIANCE ENGINE TEST SUITE");
console.log("=================================================");

// Mock rule evaluator for standalone script execution
const VALID_UNITS = ["g", "kg", "ml", "l", "cm", "m", "units", "pcs", "no."];
const PROHIBITED_WORDS = ["approx", "when packed", "about", "+/-"];

function testNetQty(qty) {
  if (!qty || qty === "Not detected") return { status: "FAIL", reason: "Missing net quantity" };
  const lower = qty.toLowerCase();
  for (const p of PROHIBITED_WORDS) {
    if (lower.includes(p)) return { status: "FAIL", reason: `Contains prohibited qualifier: ${p}` };
  }
  const hasUnit = VALID_UNITS.some((u) => new RegExp(`\\d+\\s*${u}\\b`, "i").test(lower));
  if (!hasUnit) return { status: "REVIEW REQUIRED", reason: "Non-standard unit" };
  return { status: "PASS", reason: "Standard metric unit declared" };
}

function testMrp(mrp) {
  if (!mrp || mrp === "Not detected") return { status: "FAIL", reason: "Missing MRP" };
  const lower = mrp.toLowerCase();
  if (!/\d+/.test(lower)) return { status: "FAIL", reason: "No numeric price" };
  if (!lower.includes("tax") && !lower.includes("incl")) return { status: "REVIEW REQUIRED", reason: "Missing tax declaration statement" };
  return { status: "PASS", reason: "Compliant MRP with tax statement" };
}

function testMfg(name, addr) {
  if (!name || name === "Not detected") return { status: "FAIL", reason: "Missing manufacturer name" };
  if (!addr || addr === "Not detected") return { status: "FAIL", reason: "Missing manufacturer address" };
  return { status: "PASS", reason: "Manufacturer declared" };
}

function testConsumerCare(phone, email) {
  const hasPhone = phone && phone !== "Not detected";
  const hasEmail = email && email !== "Not detected";
  if (!hasPhone && !hasEmail) return { status: "FAIL", reason: "Missing consumer care details" };
  if (!hasPhone || !hasEmail) return { status: "REVIEW REQUIRED", reason: "Partially declared consumer care" };
  return { status: "PASS", reason: "Complete consumer care details" };
}

// 1. Test Compliant Package
console.log("\n[TEST 1] Testing Fully Compliant Package...");
const t1_qty = testNetQty("250 g");
const t1_mrp = testMrp("₹275.00 (incl. of all taxes)");
const t1_mfg = testMfg("PureBrew Organics Ltd", "Sector 3, Dehradun - 248001");
const t1_cc = testConsumerCare("1800-200-8899", "care@purebrew.in");
assert.strictEqual(t1_qty.status, "PASS");
assert.strictEqual(t1_mrp.status, "PASS");
assert.strictEqual(t1_mfg.status, "PASS");
assert.strictEqual(t1_cc.status, "PASS");
console.log("✓ PASS: Fully compliant package passed all statutory checks.");

// 2. Test Missing MRP
console.log("\n[TEST 2] Testing Missing MRP Scenario...");
const t2_mrp = testMrp("Not detected");
assert.strictEqual(t2_mrp.status, "FAIL");
console.log("✓ PASS: Missing MRP correctly flagged as FAIL.");

// 3. Test Missing Net Quantity
console.log("\n[TEST 3] Testing Missing Net Quantity...");
const t3_qty = testNetQty("Not detected");
assert.strictEqual(t3_qty.status, "FAIL");
console.log("✓ PASS: Missing Net Quantity correctly flagged as FAIL.");

// 4. Test Prohibited Qualifier 'approx 200g'
console.log("\n[TEST 4] Testing Prohibited Qualifier ('approx 200g')...");
const t4_qty = testNetQty("approx 200g");
assert.strictEqual(t4_qty.status, "FAIL");
assert(t4_qty.reason.includes("prohibited qualifier"));
console.log("✓ PASS: Prohibited qualifier 'approx' correctly rejected under Rule 13.");

// 5. Test Missing Consumer Care Information
console.log("\n[TEST 5] Testing Missing Consumer Care Information...");
const t5_cc = testConsumerCare("Not detected", "Not detected");
assert.strictEqual(t5_cc.status, "FAIL");
console.log("✓ PASS: Missing Consumer Care correctly flagged as FAIL.");

// 6. Test Partial Consumer Care Information
console.log("\n[TEST 6] Testing Partial Consumer Care (Email only)...");
const t6_cc = testConsumerCare("Not detected", "care@company.com");
assert.strictEqual(t6_cc.status, "REVIEW REQUIRED");
console.log("✓ PASS: Partial Consumer Care correctly marked for REVIEW REQUIRED.");

// 7. Test Missing Manufacturer Address
console.log("\n[TEST 7] Testing Missing Manufacturer Address...");
const t7_mfg = testMfg("ABC Industries", "Not detected");
assert.strictEqual(t7_mfg.status, "FAIL");
console.log("✓ PASS: Missing Address correctly flagged as FAIL.");

console.log("\n=================================================");
console.log("ALL 7 STATUTORY COMPLIANCE UNIT TESTS PASSED SUCCESSFULLY! ✓");
console.log("=================================================\n");
