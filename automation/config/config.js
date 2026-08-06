/**
 * Selenium Framework Configuration
 * MedIQ+ Healthcare Portal — E2E Test Suite
 */

module.exports = {
  BASE_URL:    process.env.BASE_URL    || "https://chaithika09.github.io/healthcare-platform/",
  HEADLESS:    process.env.HEADLESS    !== "false",
  PARALLEL:    parseInt(process.env.PARALLEL) || 4,
  TIMEOUT:     parseInt(process.env.TIMEOUT)  || 30000,
  RETRY_COUNT: parseInt(process.env.RETRY)    || 2,
  SCREENSHOT_ON_FAIL: true,

  // Test user credentials
  USERS: {
    patient: { email: "lschaithika+patient@gmail.com", password: "Demo@1234", name: "John Patient" },
    doctor:  { email: "lschaithika+doctor@gmail.com",  password: "Demo@1234", name: "Dr. Sarah Johnson" },
    admin:   { email: "lschaithika+admin@gmail.com",   password: "Demo@1234", name: "Admin User" },
  },

  // Browser options
  CHROME_OPTIONS: [
    "--headless",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080",
    "--disable-extensions",
    "--disable-notifications",
    "--ignore-certificate-errors",
  ],

  // Report paths
  REPORTS: {
    html:        "./reports/html/",
    excel:       "./reports/excel/",
    screenshots: "./reports/screenshots/",
    logs:        "./reports/logs/",
    json:        "./reports/json/",
    summary:     "./reports/summary/",
  },
};
