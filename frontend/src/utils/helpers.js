import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";

/**
 * Format a date to a readable string
 */
export const formatDate = (date, pattern = "MMM dd, yyyy") => {
  if (!date) return "";
  return format(new Date(date), pattern);
};

/**
 * Format a date with time
 */
export const formatDateTime = (date) => {
  if (!date) return "";
  return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
};

/**
 * Relative time (e.g. "2 hours ago")
 */
export const timeAgo = (date) => {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Smart date label
 */
export const smartDate = (date) => {
  const d = new Date(date);
  if (isToday(d))     return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d))  return `Tomorrow, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM dd, yyyy");
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount || 0);

/**
 * Truncate text
 */
export const truncate = (str, max = 100) =>
  str && str.length > max ? str.slice(0, max) + "..." : str || "";

/**
 * Get initials from name
 */
export const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

/**
 * Capitalize first letter
 */
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Debounce function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Generate a random color from a string (for avatars)
 */
export const stringToColor = (str = "") => {
  const colors = [
    "from-blue-500 to-blue-700",
    "from-green-500 to-green-700",
    "from-purple-500 to-purple-700",
    "from-orange-500 to-orange-700",
    "from-pink-500 to-pink-700",
    "from-teal-500 to-teal-700",
    "from-indigo-500 to-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Validate email
 */
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/**
 * Sleep
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
