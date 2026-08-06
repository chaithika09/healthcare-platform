const { By } = require("selenium-webdriver");
const BasePage = require("./BasePage");

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      emailInput:    By.css('input[type="email"]'),
      passwordInput: By.css('input[type="password"]'),
      submitBtn:     By.css('button[type="submit"]'),
      forgotLink:    By.xpath('//*[contains(text(),"Forgot")]'),
      registerLink:  By.xpath('//*[contains(text(),"Create")]'),
      errorToast:    By.css('[data-hot-toast],.go3958317564'),
      showPassBtn:   By.css('button[type="button"]'),
      demoPatient:   By.xpath('//button[contains(text(),"patient")]'),
      demoDoctor:    By.xpath('//button[contains(text(),"doctor")]'),
      demoAdmin:     By.xpath('//button[contains(text(),"admin")]'),
    };
  }

  async open() { await this.navigate("/login"); }

  async enterEmail(email) { await this.type(this.selectors.emailInput, email); }
  async enterPassword(pw) { await this.type(this.selectors.passwordInput, pw); }
  async clickSubmit()     { await this.click(this.selectors.submitBtn); }
  async clickForgot()     { await this.click(this.selectors.forgotLink); }
  async clickRegister()   { await this.click(this.selectors.registerLink); }
  async clickDemoPatient(){ await this.click(this.selectors.demoPatient); }
  async clickDemoDoctor() { await this.click(this.selectors.demoDoctor); }
  async clickDemoAdmin()  { await this.click(this.selectors.demoAdmin); }

  async login(email, password) {
    await this.open();
    await this.sleep(1000);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSubmit();
    await this.sleep(2000);
  }

  async isOnLoginPage() {
    const url = await this.getCurrentURL();
    return url.includes("login") || url.includes("register") || url.includes("splash");
  }

  async getSubmitButtonText() {
    return this.getText(this.selectors.submitBtn);
  }

  async togglePasswordVisibility() {
    await this.click(this.selectors.showPassBtn);
  }
}

module.exports = LoginPage;
