const { verifyAccessToken } = require("../utils/jwtUtils");
const User = require("../models/User");
const logger = require("../utils/logger");

// ── Authenticate JWT ──────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry -refreshTokens");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account is deactivated" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    logger.error("Auth middleware error:", error.message);
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

// ── Role-based authorization ──────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(" or ")}`,
    });
  }
  next();
};

// ── Optional auth (doesn't fail if no token) ─────────────────
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("-password");
      if (user && user.isActive) req.user = user;
    }
  } catch {
    // Silently ignore auth errors for optional routes
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
