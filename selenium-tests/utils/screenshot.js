const fs   = require("fs-extra");
const path = require("path");
const config = require("../config/selenium.config");

async function capture(driver, testId, label) {
  try {
    await fs.ensureDir(config.REPORTS.screenshots);
    const ts   = new Date().toISOString().replace(/[:.]/g, "-");
    const name = `${testId}_${label || "screenshot"}_${ts}.png`;
    const file = path.join(config.REPORTS.screenshots, name);
    const data = await driver.takeScreenshot();
    await fs.writeFile(file, data, "base64");
    return file;
  } catch (e) {
    console.error("Screenshot failed:", e.message);
    return null;
  }
}

async function onFail(driver, testId, error) {
  const file = await capture(driver, testId, "FAIL");
  return { screenshot: file, error: error ? error.message : "Unknown", stack: error ? error.stack : "" };
}

module.exports = { capture, onFail };
