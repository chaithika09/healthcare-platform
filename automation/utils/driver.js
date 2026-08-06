const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const config = require("../config/config");

/**
 * Create and configure a Chrome WebDriver instance
 */
async function createDriver() {
  const options = new chrome.Options();
  if (config.HEADLESS) {
    config.CHROME_OPTIONS.forEach(o => options.addArguments(o));
  } else {
    options.addArguments("--window-size=1920,1080");
  }
  options.addArguments("--disable-blink-features=AutomationControlled");
  options.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: config.TIMEOUT, script: 30000 });
  return driver;
}

/**
 * Navigate to a page relative to BASE_URL
 */
async function navigateTo(driver, path = "") {
  const url = config.BASE_URL.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
  await driver.get(url);
  await driver.sleep(1500);
}

/**
 * Wait for element to be visible and return it
 */
async function waitFor(driver, locator, timeout = config.TIMEOUT) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

/**
 * Safe click with retry
 */
async function safeClick(driver, locator, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const el = await waitFor(driver, locator);
      await driver.executeScript("arguments[0].scrollIntoView(true);", el);
      await driver.sleep(300);
      await el.click();
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await driver.sleep(500);
    }
  }
}

/**
 * Type text into a field
 */
async function typeText(driver, locator, text) {
  const el = await waitFor(driver, locator);
  await el.clear();
  await el.sendKeys(text);
}

/**
 * Get text of element
 */
async function getText(driver, locator) {
  const el = await waitFor(driver, locator);
  return await el.getText();
}

/**
 * Check if element exists (non-throwing)
 */
async function elementExists(driver, locator, timeout = 5000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for URL to contain a path segment
 */
async function waitForURL(driver, urlPart, timeout = config.TIMEOUT) {
  await driver.wait(until.urlContains(urlPart), timeout);
}

module.exports = { createDriver, navigateTo, waitFor, safeClick, typeText, getText, elementExists, waitForURL, By, until };
