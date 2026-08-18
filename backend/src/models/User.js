const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 100 },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone:    { type: String, trim: true },
    role:     {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
      lowercase: true
    },
    avatar:   { type: String, default: null },

    // Verification
    isEmailVerified: { type: Boolean, default: false },
    isActive:        { type: Boolean, default: true },
    otp:             { type: String, select: false },
    otpExpiry:       { type: Date,   select: false },

    // Password reset
    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpiry: { type: Date,   select: false },

    // Refresh tokens (store hashed)
    refreshTokens: [{ type: String, select: false }],

    // Timestamps
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// ── Instance methods ──────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.refreshTokens;
  return obj;
};

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
