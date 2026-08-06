const { By } = require("selenium-webdriver");
const BasePage = require("./BasePage");

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.selectors = {
      nameInput:     By.css('input[placeholder*="name"], input[placeholder*="Name"]'),
      emailInput:    By.css('input[type="email"]'),
      phoneInput:    By.css('input[type="tel"]'),
      passwordInput: By.css('input[type="password"]'),
      submitBtn:     By.css('button[type="submit"]'),
      loginLink:     By.xpath('//*[contains(text(),"Sign in") or contains(text(),"login")]'),
      patientRole:   By.xpath('//button[contains(text(),"Patient") or contains(text(),"patient")]'),
      doctorRole:    By.xpath('//button[contains(text(),"Doctor") or contains(text(),"doctor")]'),
      termsCheck:    By.css('input[type="checkbox"]'),
    };
  }

  async open() { await this.navigate("/register"); }
  async enterName(n)     { await this.type(this.selectors.nameInput, n); }
  async enterEmail(e)    { await this.type(this.selectors.emailInput, e); }
  async enterPhone(p)    { await this.type(this.selectors.phoneInput, p); }
  async enterPassword(p) { await this.type(this.selectors.passwordInput, p); }
  async submitForm()     { await this.click(this.selectors.submitBtn); }
  async acceptTerms()    { await this.click(this.selectors.termsCheck); }

  async register(name, email, phone, password) {
    await this.open();
    await this.sleep(1000);
    await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPhone(phone);
    await this.enterPassword(password);
    await this.acceptTerms();
    await this.submitForm();
    await this.sleep(2000);
  }
}

module.exports = RegisterPage;
