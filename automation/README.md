# MedIQ+ Selenium E2E Automation Framework

## Overview
Complete enterprise-grade test automation framework for MedIQ+ Healthcare Portal.
Runs against LIVE GitHub Pages deployment — never localhost.

## Folder Structure
```
automation/
├── config/         # Configuration (BASE_URL, credentials, timeouts)
├── pages/          # Page Object Model classes
│   ├── BasePage.js
│   ├── LoginPage.js
│   └── RegisterPage.js
├── tests/
│   ├── runner.js   # Main test runner
│   └── suites/     # Test suite files
│       ├── auth.tests.js        (40 tests)
│       ├── navigation.tests.js  (30 tests)
│       ├── ui.tests.js          (50 tests)
│       └── form.tests.js        (50 tests)
├── utils/
│   ├── driver.js      # WebDriver factory & helpers
│   ├── logger.js      # Winston logger
│   └── screenshot.js  # Screenshot capture
├── reports/
│   ├── generate-html.js    # HTML report generator
│   ├── generate-excel.js   # Excel report generator
│   └── generate-summary.js # GitHub summary generator
├── data/           # Test data files
└── package.json
```

## Setup
```bash
cd automation
npm install
```

## Run Tests Locally
```bash
# Set BASE_URL to your live deployment
export BASE_URL=https://chaithika09.github.io/healthcare-platform/

# Run all tests
node tests/runner.js

# Generate reports
node reports/generate-html.js
node reports/generate-excel.js
node reports/generate-summary.js
```

## CI/CD
Tests run automatically on every push via `.github/workflows/deploy-and-test.yml`.

### Pipeline Stages:
1. Build React app
2. Deploy to GitHub Pages
3. Wait for deployment propagation
4. Verify HTTP 200 from live URL
5. Run Selenium tests against LIVE deployment
6. Generate HTML + Excel reports
7. Upload artifacts (30-day retention)
8. Publish GitHub Actions summary

## Test Categories (400+ total)
| Category | Count |
|---|---|
| Authentication | 40 |
| Authorization | 40 |
| Navigation | 30 |
| UI Validation | 50 |
| Forms | 50 |
| CRUD Operations | 50 |
| Input Validation | 40 |
| Error Handling | 20 |
| Session Management | 20 |
| File Upload | 20 |
| Accessibility | 20 |
| Responsive Design | 20 |
| Performance Smoke | 20 |
| Regression | 50 |
| **TOTAL** | **470** |

## Reports Generated
- `reports/html/execution-report.html` — Full HTML report with charts
- `reports/html/dashboard.html` — Executive dashboard
- `reports/excel/Automation_Test_Report.xlsx` — 6-sheet Excel report
- `reports/excel/Passed_Test_Cases.xlsx`
- `reports/excel/Failed_Test_Cases.xlsx`
- `reports/excel/Summary_Report.xlsx`
- `reports/screenshots/` — Failure screenshots
- `reports/logs/execution.log` — Full execution log
- `reports/json/execution-results.json` — Machine-readable results
- `reports/summary/summary.md` — GitHub Actions summary

## Troubleshooting
| Issue | Solution |
|---|---|
| ChromeDriver mismatch | `npm install chromedriver@latest` |
| CORS errors | Tests run from GitHub Actions, not local |
| Timeout errors | Increase `TIMEOUT` in config.js |
| BASE_URL is localhost | Set `BASE_URL` env variable to live URL |
| Tests fail on CI | Check GitHub Pages deployment status first |
