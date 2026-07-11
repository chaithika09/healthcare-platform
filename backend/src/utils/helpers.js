const crypto = require("crypto");

/**
 * Paginate a mongoose query result
 */
const paginate = (page = 1, limit = 20) => ({
  skip:  (parseInt(page) - 1) * parseInt(limit),
  limit: parseInt(limit),
});

/**
 * Build pagination metadata
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page:  parseInt(page),
  limit: parseInt(limit),
  pages: Math.ceil(total / parseInt(limit)),
  hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
  hasPrev: parseInt(page) > 1,
});

/**
 * Generate a random alphanumeric ID
 */
const generateId = (prefix = "", length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = prefix ? prefix + "-" : "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.refreshTokens;
  return obj;
};

/**
 * Format date to readable string
 */
const formatDate = (date, locale = "en-US") =>
  new Date(date).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });

/**
 * Format currency
 */
const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

/**
 * Calculate age from date of birth
 */
const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/**
 * Hash a string with SHA-256
 */
const hashString = (str) =>
  crypto.createHash("sha256").update(str).digest("hex");

/**
 * Sleep utility for async delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pick specific keys from an object
 */
const pick = (obj, keys) =>
  keys.reduce((acc, key) => { if (key in obj) acc[key] = obj[key]; return acc; }, {});

/**
 * Omit specific keys from an object
 */
const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

/**
 * Capitalize first letter
 */
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

/**
 * Truncate string
 */
const truncate = (str, maxLength = 100) =>
  str && str.length > maxLength ? str.slice(0, maxLength) + "..." : str;

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

module.exports = {
  paginate, paginationMeta, generateId, sanitizeUser,
  formatDate, formatCurrency, calculateAge, hashString,
  sleep, pick, omit, capitalize, truncate, isValidObjectId,
};
