// ── API ───────────────────────────────────────────────────────
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

// ── Roles ─────────────────────────────────────────────────────
export const ROLES = { PATIENT: "patient", DOCTOR: "doctor", ADMIN: "admin" };

// ── Appointment statuses ──────────────────────────────────────
export const APPOINTMENT_STATUS = {
  PENDING:     "pending",
  CONFIRMED:   "confirmed",
  IN_PROGRESS: "in-progress",
  COMPLETED:   "completed",
  CANCELLED:   "cancelled",
  NO_SHOW:     "no-show",
};

export const APPOINTMENT_STATUS_COLORS = {
  pending:     "bg-amber-100 text-amber-700",
  confirmed:   "bg-primary-100 text-primary-700",
  "in-progress":"bg-blue-100 text-blue-700",
  completed:   "bg-green-100 text-green-700",
  cancelled:   "bg-red-100 text-red-700",
  "no-show":   "bg-gray-100 text-gray-600",
};

// ── Medical record types ──────────────────────────────────────
export const RECORD_TYPES = [
  { value: "lab-report",        label: "Lab Report" },
  { value: "imaging",           label: "Imaging / Radiology" },
  { value: "prescription",      label: "Prescription" },
  { value: "discharge-summary", label: "Discharge Summary" },
  { value: "vaccination",       label: "Vaccination" },
  { value: "other",             label: "Other" },
];

// ── Specialties ───────────────────────────────────────────────
export const SPECIALTIES = [
  "Cardiologist", "Neurologist", "Dermatologist", "Pediatrician",
  "Orthopedic", "Gynecologist", "Psychiatrist", "Ophthalmologist",
  "Endocrinologist", "Gastroenterologist", "Pulmonologist",
  "Nephrologist", "Oncologist", "Rheumatologist", "General Physician",
];

// ── Blood groups ──────────────────────────────────────────────
export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ── Time slots ────────────────────────────────────────────────
export const TIME_SLOTS = [
  "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM",
  "4:00 PM","4:30 PM","5:00 PM",
];

// ── Payment methods ───────────────────────────────────────────
export const PAYMENT_METHODS = [
  { value: "card",       label: "Credit / Debit Card", icon: "💳" },
  { value: "paypal",     label: "PayPal",               icon: "🅿️" },
  { value: "apple-pay",  label: "Apple Pay",            icon: "🍎" },
  { value: "google-pay", label: "Google Pay",           icon: "🔵" },
];

// ── Languages ─────────────────────────────────────────────────
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
];

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_MB  = 10;

// ── Date formats ──────────────────────────────────────────────
export const DATE_FORMAT      = "MMM dd, yyyy";
export const DATETIME_FORMAT  = "MMM dd, yyyy 'at' h:mm a";
export const TIME_FORMAT      = "h:mm a";
