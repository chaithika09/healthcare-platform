/**
 * WebDriver Factory
 * Creates and manages Selenium Chrome WebDriver instances
 */
const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const config = require("../config/selenium.config");

class DriverFactory {
  static async create() {
    const opts = new chrome.Options();
    config.CHROME_ARGS.forEach(a => opts.addArguments(a));
    opts.addArguments("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");

    const driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(opts)
      .build();

    await driver.manage().setTimeouts({
      implicit:  5000,
      pageLoad:  config.TIMEOUT,
      script:    30000,
    });

    return driver;
  }

  static async quit(driver) {
    try { if (driver) await driver.quit(); } catch {}
  }
}

// ── Helper utilities ──────────────────────────────────────────

async function navigateTo(driver, path) {
  const url = config.BASE_URL.replace(/\/$/, "") + (path.startsWith("/") ? path : "/" + path);
  await driver.get(url);
  await driver.sleep(2000);
}

async function waitFor(driver, locator, timeout) {
  const el = await driver.wait(until.elementLocated(locator), timeout || config.TIMEOUT);
  await driver.wait(until.elementIsVisible(el), timeout || config.TIMEOUT);
  return el;
}

async function click(driver, locator, retries) {
  retries = retries || 3;
  for (let i = 0; i < retries; i++) {
    try {
      const el = await waitFor(driver, locator);
      await driver.executeScript("arguments[0].scrollIntoView(true);", el);
      await driver.sleep(200);
      await el.click();
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await driver.sleep(500);
    }
  }
}

async function type(driver, locator, text) {
  const el = await waitFor(driver, locator);
  await el.clear();
  await el.sendKeys(text);
}

async function getText(driver, locator) {
  const el = await waitFor(driver, locator);
  return el.getText();
}

async function exists(driver, locator, timeout) {
  try {
    await driver.wait(until.elementLocated(locator), timeout || 5000);
    return true;
  } catch { return false; }
}

async function getPageSource(driver) { return driver.getPageSource(); }
async function getCurrentURL(driver) { return driver.getCurrentUrl(); }
async function getTitle(driver)      { return driver.getTitle(); }

module.exports = { DriverFactory, navigateTo, waitFor, click, type, getText, exists, getPageSource, getCurrentURL, getTitle, By, until, Key };
