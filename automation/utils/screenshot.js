const fs   = require("fs-extra");
const path = require("path");
const config = require("../config/config");

/**
 * Capture screenshot and save to reports/screenshots/
 */
async function capture(driver, testId, label = "screenshot") {
  try {
    await fs.ensureDir(config.REPORTS.screenshots);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename  = `${testId}_${label}_${timestamp}.png`;
    const filepath  = path.join(config.REPORTS.screenshots, filename);
    const data = await driver.takeScreenshot();
    await fs.writeFile(filepath, data, "base64");
    return filepath;
  } catch (e) {
    console.error("Screenshot capture failed:", e.message);
    return null;
  }
}

/**
 * Capture on test failure
 */
async function captureOnFail(driver, testId, error) {
  const filepath = await capture(driver, testId, "FAIL");
  return { screenshot: filepath, error: error?.message, stack: error?.stack };
}

module.exports = { capture, captureOnFail };
