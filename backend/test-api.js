/**
 * API Verification Script
 * Run: node test-api.js
 */

const http = require("http");

const BASE = "http://localhost:5000/api/v1";
let pass = 0, fail = 0, failList = [];

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const isFullUrl = path.startsWith("http");
    const url = isFullUrl ? path : BASE + path;
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data)  headers["Content-Length"] = Buffer.byteLength(data);

    const req = http.request(
      { hostname: parsed.hostname, port: parsed.port || 5000, path: parsed.pathname + parsed.search, method, headers },
      (res) => {
        let raw = "";
        res.on("data", (c) => raw += c);
        res.on("end", () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, data: {} }); }
        });
      }
    );
    req.on("error", () => resolve({ status: 0, data: {} }));
    req.setTimeout(6000, () => { req.destroy(); resolve({ status: 0, data: {} }); });
    if (data) req.write(data);
    req.end();
  });
}

function check(status, label) {
  const ok = status >= 200 && status < 400;
  if (ok) { pass++; console.log(`✅  PASS  ${label}`); }
  else    { fail++; failList.push(label); console.log(`❌  FAIL  ${label} (HTTP ${status})`); }
}

async function run() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("       SMART HEALTHCARE - API VERIFICATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── SYSTEM ────────────────────────────────────────────────
  console.log("[ SYSTEM ]");
  let r = await request("GET", "http://localhost:5000/health");
  check(r.status, "Health Check");

  // ── AUTH ──────────────────────────────────────────────────
  console.log("\n[ AUTH ]");
  r = await request("POST", "/auth/login", { email:"patient@demo.com", password:"Demo@1234" });
  check(r.status, "Login - Patient");
  const PT = r.data?.data?.token;

  r = await request("POST", "/auth/login", { email:"doctor@demo.com", password:"Demo@1234" });
  check(r.status, "Login - Doctor");
  const DT = r.data?.data?.token;

  r = await request("POST", "/auth/login", { email:"admin@demo.com", password:"Demo@1234" });
  check(r.status, "Login - Admin");
  const AT = r.data?.data?.token;

  r = await request("GET", "/auth/me", null, PT);
  check(r.status, "Get Me (patient)");

  // ── PATIENT ───────────────────────────────────────────────
  console.log("\n[ PATIENT ]");
  r = await request("GET", "/patients/me",        null, PT); check(r.status, "Patient - Profile");
  r = await request("GET", "/patients/dashboard", null, PT); check(r.status, "Patient - Dashboard");

  // ── DOCTORS ───────────────────────────────────────────────
  console.log("\n[ DOCTORS ]");
  r = await request("GET", "/doctors",             null, null); check(r.status, "Doctors - List all");
  r = await request("GET", "/doctors/dashboard",   null, DT);   check(r.status, "Doctors - Dashboard");
  r = await request("GET", "/doctors/appointments",null, DT);   check(r.status, "Doctors - Appointments");

  // ── APPOINTMENTS ──────────────────────────────────────────
  console.log("\n[ APPOINTMENTS ]");
  r = await request("GET", "/appointments",        null, PT); check(r.status, "Appointments - Patient list");
  r = await request("GET", "/appointments",        null, DT); check(r.status, "Appointments - Doctor list");
  r = await request("GET", "/appointments/slots/507f1f77bcf86cd799439011?date=2024-07-01", null, PT);
  check(r.status, "Appointments - Available slots");

  // ── RECORDS ───────────────────────────────────────────────
  console.log("\n[ RECORDS ]");
  r = await request("GET", "/records", null, PT); check(r.status, "Medical Records - List");

  // ── PRESCRIPTIONS ─────────────────────────────────────────
  console.log("\n[ PRESCRIPTIONS ]");
  r = await request("GET", "/prescriptions", null, PT); check(r.status, "Prescriptions - Patient");
  r = await request("GET", "/prescriptions", null, DT); check(r.status, "Prescriptions - Doctor");

  // ── NOTIFICATIONS ─────────────────────────────────────────
  console.log("\n[ NOTIFICATIONS ]");
  r = await request("GET",   "/notifications",          null, PT); check(r.status, "Notifications - Get all");
  r = await request("PATCH", "/notifications/read-all", null, PT); check(r.status, "Notifications - Mark all read");

  // ── PAYMENTS ──────────────────────────────────────────────
  console.log("\n[ PAYMENTS ]");
  r = await request("GET", "/payments", null, PT); check(r.status, "Payments - History");

  // ── LAB TESTS ─────────────────────────────────────────────
  console.log("\n[ LAB TESTS ]");
  r = await request("GET", "/lab-tests",          null, null); check(r.status, "Lab Tests - Catalog");
  r = await request("GET", "/lab-tests/bookings", null, PT);   check(r.status, "Lab Tests - Bookings");

  // ── ARTICLES ──────────────────────────────────────────────
  console.log("\n[ ARTICLES ]");
  r = await request("GET", "/articles",   null, null); check(r.status, "Articles - List");
  r = await request("GET", "/articles/1", null, null); check(r.status, "Articles - By ID");

  // ── CHAT ──────────────────────────────────────────────────
  console.log("\n[ CHAT ]");
  r = await request("GET", "/chat/conversations", null, PT); check(r.status, "Chat - Conversations");

  // ── FEEDBACK ──────────────────────────────────────────────
  console.log("\n[ FEEDBACK ]");
  r = await request("POST", "/feedback", { rating:5, feedback:"Great service!", category:"Overall Experience" }, PT);
  check(r.status, "Feedback - Submit");
  r = await request("GET", "/feedback", null, AT); check(r.status, "Feedback - Admin view");

  // ── ADMIN ─────────────────────────────────────────────────
  console.log("\n[ ADMIN ]");
  r = await request("GET", "/admin/users",              null, AT); check(r.status, "Admin - User list");
  r = await request("GET", "/admin/doctors/pending",    null, AT); check(r.status, "Admin - Pending doctors");
  r = await request("GET", "/admin/analytics",          null, AT); check(r.status, "Admin - Analytics");
  r = await request("GET", "/admin/logs",               null, AT); check(r.status, "Admin - Activity logs");

  // ── REGISTER (new user) ───────────────────────────────────
  console.log("\n[ REGISTRATION ]");
  r = await request("POST", "/auth/register", {
    name:"Verify Test User", email:`verify_${Date.now()}@test.com`,
    password:"Test@1234", phone:"+1-555-9988", role:"patient"
  });
  check(r.status, "Register - New patient");

  // ── SUMMARY ───────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  TOTAL: ${pass+fail}  |  ✅ PASSED: ${pass}  |  ❌ FAILED: ${fail}`);
  if (failList.length > 0) {
    console.log(`  Failed endpoints:`);
    failList.forEach(f => console.log(`    - ${f}`));
  } else {
    console.log("  🎉 ALL ENDPOINTS PASSING!");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(console.error);
