const User    = require("../models/User");
const Patient = require("../models/Patient");
const Doctor  = require("../models/Doctor");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateOTP } = require("../utils/jwtUtils");
const { sendOTPEmail, sendPasswordResetEmail } = require("../utils/emailService");
const crypto = require("crypto");
const logger = require("../utils/logger");

// ── Register ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const otp       = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Auto-verify email in development/demo mode
    const isDev = process.env.NODE_ENV !== "production" || process.env.AUTO_VERIFY_EMAIL === "true";

    const user = await User.create({
      name, email, password, phone,
      role: role || "patient",
      otp,
      otpExpiry,
      isEmailVerified: isDev,
    });

    // Create role-specific profile
    if (user.role === "patient") {
      await Patient.create({ user: user._id });
    } else if (user.role === "doctor") {
      const { specialty, licenseNumber, experience } = req.body;
      await Doctor.create({
        user: user._id,
        specialty:     specialty     || "General",
        licenseNumber: licenseNumber || "PENDING",
        experience:    experience    || 0,
      });
    }

    // Send OTP email — non-blocking (don't await, don't fail if SMTP not set)
    sendOTPEmail(email, otp, name).catch((err) =>
      logger.warn(`OTP email not sent (SMTP not configured): ${err.message}`)
    );

    logger.info(`New user registered: ${email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: isDev
        ? "Registration successful! You can now log in."
        : "Registration successful. Please verify your email.",
      data: { userId: user._id, email: user.email, autoVerified: isDev },
    });
  } catch (error) {
    next(error);
  }
};

// ── Verify OTP ────────────────────────────────────────────────
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

// ── Resend OTP ────────────────────────────────────────────────
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: "Email already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp, user.name);
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshTokens");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive) return res.status(401).json({ success: false, message: "Account is deactivated. Contact support." });

    // Demo: skip email verification check for demo accounts
    const isDemoAccount = email.endsWith("@demo.com");
    if (!user.isEmailVerified && !isDemoAccount) {
      return res.status(401).json({ success: false, message: "Please verify your email first", code: "EMAIL_NOT_VERIFIED" });
    }

    const payload = { id: user._id, role: user.role, email: user.email };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token (keep last 5)
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user:         user.toSafeObject(),
        token:        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Refresh Token ─────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token required" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const payload      = { id: user._id, role: user.role, email: user.email };
    const newAccess    = generateAccessToken(payload);
    const newRefresh   = generateRefreshToken(payload);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();

    res.json({ success: true, data: { token: newAccess, refreshToken: newRefresh } });
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken && req.user) {
      const user = await User.findById(req.user._id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
        await user.save();
      }
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// ── Get Me ────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};

// ── Forgot Password ───────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken  = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Non-blocking — don't fail if SMTP not configured
    sendPasswordResetEmail(email, resetUrl, user.name).catch((err) =>
      logger.warn(`Reset email not sent (SMTP not configured): ${err.message}`)
    );

    const isDev = process.env.NODE_ENV !== "production";

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent."
    });
  } catch (error) {
    next(error);
  }
};

// ── Reset Password ────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpiry");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
