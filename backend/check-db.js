const mongoose = require("mongoose");
require("dotenv").config();

const check = async () => {
  const uri = process.env.MONGODB_URI;
  console.log("🔍 Checking Database Connection...");
  console.log(`📍 URI: ${uri ? (uri.startsWith("mongodb+srv") ? "Cloud (Atlas)" : "Local") : "MISSING"}`);

  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB!");

    const dbName = mongoose.connection.name;
    const collections = await mongoose.connection.db.listCollections().toArray();

    console.log(`📦 Database Name: ${dbName}`);
    console.log(`📚 Collections found: ${collections.length}`);
    collections.forEach(c => console.log(`   - ${c.name}`));

    if (collections.length === 0) {
      console.warn("⚠️  Warning: The database is empty. You may need to run 'npm run seed'.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection FAILED:");
    console.error(`   Reason: ${error.message}`);
    process.exit(1);
  }
};

check();
