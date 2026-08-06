const { By, until } = require("selenium-webdriver");
const { navigateTo, waitFor, safeClick, typeText, elementExists } = require("../utils/driver");
const { capture } = require("../utils/screenshot");
const config = require("../config/config");

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.TIMEOUT;
  }

  async navigate(path = "") { await navigateTo(this.driver, path); }
  async waitFor(locator, t) { return waitFor(this.driver, locator, t || this.timeout); }
  async click(locator)       { return safeClick(this.driver, locator); }
  async type(locator, text)  { return typeText(this.driver, locator, text); }
  async screenshot(id, lbl)  { return capture(this.driver, id, lbl); }
  async exists(locator, t)   { return elementExists(this.driver, locator, t || 5000); }
  async sleep(ms)            { await this.driver.sleep(ms); }
  async getTitle()           { return this.driver.getTitle(); }
  async getCurrentURL()      { return this.driver.getCurrentUrl(); }

  async getText(locator) {
    const el = await this.waitFor(locator);
    return el.getText();
  }

  async getPageSource() {
    return this.driver.getPageSource();
  }

  async scrollToBottom() {
    await this.driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");
    await this.sleep(500);
  }

  async isDisplayed(locator) {
    try {
      const el = await this.waitFor(locator, 5000);
      return el.isDisplayed();
    } catch { return false; }
  }
}

module.exports = BasePage;
