const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // ── Guard: no URI set ─────────────────────────────────────
  if (!uri || uri.includes("xxxxx")) {
    logger.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.error("  ❌  MONGODB_URI is not configured!");
    logger.error("  👉  Open backend/.env and set your connection string");
    logger.error("  Example (Atlas):");
    logger.error("  MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/healthcare_db");
    logger.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }

  try {
    logger.info("🔌 Connecting to MongoDB...");

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,  // 10 sec timeout
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);

    // ── Connection event listeners ────────────────────────
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("✅ MongoDB reconnected.");
    });

  } catch (error) {
    logger.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logger.error("  ❌  MongoDB connection FAILED");
    logger.error(`  Reason: ${error.message}`);
    logger.error("");

    if (error.message.includes("ENOTFOUND") || error.message.includes("querySrv")) {
      logger.error("  💡 Fix: Check your Atlas connection string in backend/.env");
      logger.error("         Make sure the cluster hostname is correct.");
    } else if (error.message.includes("Authentication failed")) {
      logger.error("  💡 Fix: Wrong username or password in your connection string.");
      logger.error("         Go to Atlas → Database Access → check credentials.");
    } else if (error.message.includes("IP") || error.message.includes("whitelist")) {
      logger.error("  💡 Fix: Your IP is not whitelisted.");
      logger.error("         Go to Atlas → Network Access → Add 0.0.0.0/0");
    } else if (error.message.includes("timed out")) {
      logger.error("  💡 Fix: Connection timed out.");
      logger.error("         Check your internet connection or Atlas network access.");
    }

    logger.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    process.exit(1);
  }
};

module.exports = connectDB;
