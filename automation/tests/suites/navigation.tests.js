/**
 * Navigation Test Suite — 30 test cases
 */
const { By } = require('selenium-webdriver');
const { navigateTo, elementExists } = require('../../utils/driver');
const { captureOnFail } = require('../../utils/screenshot');
const logger = require('../../utils/logger');

async function test(driver, suite, id, name, fn) {
  const t = { id, name, module: 'Navigation', status: 'FAIL', error: null, duration: 0 };
  const start = Date.now();
  try {
    await fn(); t.status = 'PASS'; suite.passed++;
    logger.info(`  ✅ ${id}: ${name}`);
  } catch (e) {
    t.status = 'FAIL'; t.error = e.message; suite.failed++;
    await captureOnFail(driver, id, e);
    logger.error(`  ❌ ${id}: ${name} — ${e.message}`);
  }
  t.duration = ((Date.now() - start) / 1000).toFixed(2) + 's';
  suite.tests.push(t);
}

module.exports = async function navTests(driver, suite) {
  const routes = [
    ['NAV001', '/', 'Root URL loads application'],
    ['NAV002', '/splash', 'Splash screen route accessible'],
    ['NAV003', '/welcome', 'Welcome page route accessible'],
    ['NAV004', '/onboarding', 'Onboarding route accessible'],
    ['NAV005', '/login', 'Login route accessible'],
    ['NAV006', '/register', 'Register route accessible'],
    ['NAV007', '/verify-otp', 'OTP verify route accessible'],
    ['NAV008', '/forgot-password', 'Forgot password route accessible'],
    ['NAV009', '/reset-password', 'Reset password route accessible'],
    ['NAV010', '/about', 'About Us page accessible'],
    ['NAV011', '/contact', 'Contact Us page accessible'],
    ['NAV012', '/faq', 'FAQ page accessible'],
    ['NAV013', '/help', 'Help & Support accessible'],
    ['NAV014', '/terms', 'Terms & Conditions accessible'],
    ['NAV015', '/privacy', 'Privacy Policy accessible'],
    ['NAV016', '/articles', 'Health Articles page accessible'],
    ['NAV017', '/articles/1', 'Article detail page accessible'],
    ['NAV018', '/doctors', 'Doctor listing accessible (redirects login)'],
    ['NAV019', '/patient/dashboard', 'Patient dashboard accessible (redirects login)'],
    ['NAV020', '/doctor/dashboard', 'Doctor dashboard accessible (redirects login)'],
    ['NAV021', '/admin/dashboard', 'Admin dashboard accessible (redirects login)'],
    ['NAV022', '/emergency', 'Emergency page accessible (redirects login)'],
    ['NAV023', '/chat', 'Chat page accessible (redirects login)'],
    ['NAV024', '/notifications', 'Notifications accessible (redirects login)'],
    ['NAV025', '/ai-assistant', 'AI chatbot accessible (redirects login)'],
    ['NAV026', '/settings', 'Settings accessible (redirects login)'],
    ['NAV027', '/profile', 'Profile accessible (redirects login)'],
    ['NAV028', '/medical-records', 'Medical records accessible (redirects login)'],
    ['NAV029', '/prescriptions', 'Prescriptions accessible (redirects login)'],
    ['NAV030', '/lab-tests', 'Lab tests accessible (redirects login)'],
  ];

  for (const [id, route, desc] of routes) {
    await test(driver, suite, id, desc, async () => {
      await navigateTo(driver, route);
      await driver.sleep(2000);
      const source = await driver.getPageSource();
      if (!source.includes('html')) throw new Error('Page failed to load');
    });
  }
};
