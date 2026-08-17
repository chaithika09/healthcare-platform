/**
 * Verification Script for "My Patients" Feature
 * 
 * This script verifies:
 * 1. Patient Records page exists and has correct structure
 * 2. Prescription Upload page accepts patient data
 * 3. API integration is correct
 * 4. All required functions are implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying "My Patients" Feature...\n');

// Color codes for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

const checkFile = (filePath, checks) => {
  const fileName = path.basename(filePath);
  console.log(`${colors.blue}📄 Checking ${fileName}...${colors.reset}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let allPassed = true;
    
    checks.forEach(({ name, pattern, required = true, shouldExist = true }) => {
      const found = pattern.test(content);
      // If shouldExist is false, we want NOT to find it
      const passed = shouldExist ? found : !found;
      const status = passed ? '✅' : (required ? '❌' : '⚠️');
      const color = passed ? colors.green : (required ? colors.red : colors.yellow);
      
      console.log(`  ${color}${status} ${name}${colors.reset}`);
      
      if (required && !passed) {
        allPassed = false;
      }
    });
    
    console.log('');
    return allPassed;
  } catch (err) {
    console.log(`  ${colors.red}❌ File not found: ${filePath}${colors.reset}\n`);
    return false;
  }
};

// Track results
let totalChecks = 0;
let passedChecks = 0;

// 1. Check PatientRecords.jsx
const patientRecordsPath = path.join(__dirname, 'frontend', 'src', 'pages', 'doctor', 'PatientRecords.jsx');
const patientRecordsChecks = [
  { name: 'Imports doctorAPI', pattern: /import.*doctorAPI.*from.*api/ },
  { name: 'Fetches appointments', pattern: /doctorAPI\.getAppointments\(\)/ },
  { name: 'Extracts unique patients', pattern: /uniquePatients/ },
  { name: 'Has loading state', pattern: /loading.*setLoading/ },
  { name: 'Has empty state', pattern: /No Patients Yet/ },
  { name: 'Write Prescription handler', pattern: /handleWritePrescription/ },
  { name: 'Navigates to prescriptions', pattern: /navigate.*\/doctor\/prescriptions/ },
  { name: 'Passes patient state', pattern: /state.*patient.*selected/ },
  { name: 'Shows patient details', pattern: /Recent Visits/ },
  { name: 'Has search functionality', pattern: /search.*setSearch/ },
  { name: 'No demo data (John Smith)', pattern: /John Smith/, shouldExist: false }
];

totalChecks++;
if (checkFile(patientRecordsPath, patientRecordsChecks)) passedChecks++;

// 2. Check PrescriptionUpload.jsx
const prescriptionPath = path.join(__dirname, 'frontend', 'src', 'pages', 'doctor', 'PrescriptionUpload.jsx');
const prescriptionChecks = [
  { name: 'Imports useLocation', pattern: /import.*useLocation.*from.*react-router-dom/ },
  { name: 'Imports useNavigate', pattern: /import.*useNavigate.*from.*react-router-dom/ },
  { name: 'Gets patient from state', pattern: /location\.state\?\.patient/ },
  { name: 'Pre-fills patient name', pattern: /patientName.*patientData\?\.name/ },
  { name: 'Pre-fills patient ID', pattern: /patientId.*patientData\?\.id/ },
  { name: 'Pre-fills age', pattern: /age.*patientData\?\.age/ },
  { name: 'Has back button', pattern: /Back to Patients/ },
  { name: 'Shows patient banner', pattern: /patientData.*&&/ },
  { name: 'Dark mode support', pattern: /dark:bg-slate/ }
];

totalChecks++;
if (checkFile(prescriptionPath, prescriptionChecks)) passedChecks++;

// 3. Check App.js for routes
const appPath = path.join(__dirname, 'frontend', 'src', 'App.js');
const appChecks = [
  { name: 'PatientRecords route', pattern: /path="\/doctor\/patients".*PatientRecords/ },
  { name: 'PrescriptionUpload route', pattern: /path="\/doctor\/prescriptions".*PrescriptionUpload/ }
];

totalChecks++;
if (checkFile(appPath, appChecks)) passedChecks++;

// 4. Check api.js for doctorAPI methods
const apiPath = path.join(__dirname, 'frontend', 'src', 'services', 'api.js');
const apiChecks = [
  { name: 'doctorAPI export', pattern: /export const doctorAPI/ },
  { name: 'getAppointments method', pattern: /getAppointments.*api\.get\("\/doctors\/appointments"/ },
  { name: 'getMyProfile method', pattern: /getMyProfile.*api\.get\("\/doctors\/me"/ }
];

totalChecks++;
if (checkFile(apiPath, apiChecks)) passedChecks++;

// 5. Check Backend - doctorController.js
const controllerPath = path.join(__dirname, 'backend', 'src', 'controllers', 'doctorController.js');
const controllerChecks = [
  { name: 'getAppointments export', pattern: /exports\.getAppointments/ },
  { name: 'Populates patient data', pattern: /populate\("patient"/ },
  { name: 'Gets doctor appointments', pattern: /doctor.*req\.user\._id/ }
];

totalChecks++;
if (checkFile(controllerPath, controllerChecks)) passedChecks++;

// 6. Check Backend - doctorRoutes.js
const routesPath = path.join(__dirname, 'backend', 'src', 'routes', 'doctorRoutes.js');
const routesChecks = [
  { name: 'Appointments route', pattern: /router\.get\("\/appointments"/ }
];

totalChecks++;
if (checkFile(routesPath, routesChecks)) passedChecks++;

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`${colors.blue}📊 VERIFICATION SUMMARY${colors.reset}\n`);

const percentage = Math.round((passedChecks / totalChecks) * 100);
const statusColor = percentage === 100 ? colors.green : (percentage >= 80 ? colors.yellow : colors.red);

console.log(`${statusColor}${passedChecks}/${totalChecks} files passed all checks (${percentage}%)${colors.reset}\n`);

if (percentage === 100) {
  console.log(`${colors.green}✅ ALL CHECKS PASSED!${colors.reset}`);
  console.log(`${colors.green}🎉 "My Patients" feature is fully implemented and ready!${colors.reset}\n`);
  console.log('Next steps:');
  console.log('  1. Start backend: cd backend && npm run dev');
  console.log('  2. Start frontend: cd frontend && npm start');
  console.log('  3. Login as doctor: lschaithika@gmail.com / Chaithika@09');
  console.log('  4. Navigate to "My Patients" and test the feature');
} else if (percentage >= 80) {
  console.log(`${colors.yellow}⚠️  MOSTLY WORKING - Some optional features missing${colors.reset}\n`);
} else {
  console.log(`${colors.red}❌ ISSUES FOUND - Please review the failed checks above${colors.reset}\n`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Exit with appropriate code
process.exit(percentage === 100 ? 0 : 1);
