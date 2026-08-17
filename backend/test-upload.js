require("dotenv").config();
const http    = require("http");
const fs      = require("fs");
const path    = require("path");
const FormData = require("form-data");

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log("1️⃣  Logging in as Harika...");
  const loginData = JSON.stringify({ email: "ksubramanyam906@gmail.com", password: "Chaithika@09" });
  const loginRes = await httpRequest({
    hostname: "localhost", port: 5000,
    path: "/api/v1/auth/login", method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": loginData.length },
  }, loginData);

  if (!loginRes.body.success) {
    console.error("❌ Login failed:", loginRes.body);
    return;
  }
  const token = loginRes.body.data.token;
  console.log("✅ Logged in, token ok");

  console.log("\n2️⃣  Creating test file...");
  const testFilePath = path.join(__dirname, "test-report.txt");
  fs.writeFileSync(testFilePath, "Blood Test Report\nHemoglobin: 13.5 g/dL\nWBC: 6500\nPlatelets: 2.5 Lac");

  console.log("\n3️⃣  Uploading via form-data...");
  const form = new FormData();
  form.append("title",      "Blood Test Report Aug 2026");
  form.append("type",       "lab-report");
  form.append("reportDate", "2026-08-17");
  form.append("doctor",     "Dr. Chaithika");
  form.append("notes",      "Routine blood test");
  form.append("files",      fs.createReadStream(testFilePath), {
    filename:    "test-report.txt",
    contentType: "text/plain",
  });

  const uploadRes = await new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost", port: 5000,
      path: "/api/v1/records", method: "POST",
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    };
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    form.pipe(req);
  });

  if (uploadRes.body.success) {
    console.log("✅ UPLOAD SUCCESS!");
    console.log("   Record ID:", uploadRes.body.data.record._id);
    console.log("   Title:", uploadRes.body.data.record.title);
    console.log("   Files:", uploadRes.body.data.record.files?.length);
  } else {
    console.error("❌ UPLOAD FAILED:", JSON.stringify(uploadRes.body, null, 2));
  }

  // Cleanup
  fs.unlinkSync(testFilePath);
  console.log("\n4️⃣  Verifying in DB...");

  const mongoose = require("mongoose");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db");
  const MedicalRecord = require("./src/models/MedicalRecord");
  const count = await MedicalRecord.countDocuments();
  console.log(`✅ Medical records in DB: ${count}`);
  await mongoose.disconnect();
}

run().catch(console.error);
