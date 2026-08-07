/**
 * Selenium Configuration
 * MedIQ+ Healthcare Portal — E2E Tests
 */
module.exports = {
  // Live deployment URL — never localhost
  BASE_URL: process.env.BASE_URL || "https://healthcare-platform-8mq2-fawn.vercel.app",
  API_URL:  process.env.API_URL  || "https://mediq-backend-vcus.onrender.com/api/v1",

  // Browser settings
  HEADLESS:    process.env.HEADLESS !== "false",
  TIMEOUT:     parseInt(process.env.TIMEOUT) || 30000,
  SLOW_MO:     parseInt(process.env.SLOW_MO) || 0,
  WINDOW_SIZE: { width: 1920, height: 1080 },

  // Chrome options
  CHROME_ARGS: [
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080",
    "--disable-extensions",
    "--disable-notifications",
    "--ignore-certificate-errors",
    "--disable-blink-features=AutomationControlled",
  ],

  // Demo credentials
  USERS: {
    patient: { email: "lschaithika+patient@gmail.com", password: "Demo@1234", name: "John Patient" },
    doctor:  { email: "lschaithika+doctor@gmail.com",  password: "Demo@1234", name: "Dr. Sarah Johnson" },
    admin:   { email: "lschaithika+admin@gmail.com",   password: "Demo@1234", name: "Admin User" },
  },

  // Report output paths
  REPORTS: {
    excel:       "./reports/output/",
    screenshots: "./reports/screenshots/",
    html:        "./reports/html/",
    logs:        "./reports/logs/",
    json:        "./reports/json/",
  },

  // Retry failed tests
  RETRY_COUNT: 2,
};
