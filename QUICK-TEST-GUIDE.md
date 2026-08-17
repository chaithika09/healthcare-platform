# ⚡ QUICK TEST GUIDE - 5 Minutes

## ✅ Pre-Test Setup (Do This First!)

### 1. Clear Browser Storage
Open http://localhost:3000, press **F12**, go to **Console**, type:
```javascript
localStorage.clear()
```
Press Enter, then refresh the page (**F5**).

---

## 🧪 5-Minute Test Flow

### TEST 1: Patient Can See Real Doctors (30 seconds)
```
1. Login as: ksubramanyam906@gmail.com / Chaithika@09
2. Click "Find Doctors" in sidebar
3. ✅ Should see: Dr. Chaithika & Dr. Subramanyam
4. ❌ Should NOT see: Dr. Sarah Johnson, Dr. Michael Chen
```

### TEST 2: Patient Can Book Appointment (1 minute)
```
1. Still logged in as Harika
2. Click "Book Now" on Dr. Chaithika
3. Select tomorrow's date
4. Select any time slot (e.g., 2:00 PM)
5. Enter symptoms: "Test booking"
6. Click "Confirm Appointment"
7. ✅ Should see: Success message with confirmation ID
8. Click "My Appointments" in sidebar
9. ✅ Should see: Your new appointment listed
```

### TEST 3: Doctor Can See Real Patient (1 minute)
```
1. Logout (click profile icon → Logout)
2. Login as doctor: lschaithika@gmail.com / Chaithika@09
3. Click "Appointments" in sidebar
4. ✅ Should see: Harika's appointment
5. ✅ Patient name should be: "Harika"
6. ✅ Patient email should be: "ksubramanyam906@gmail.com"
7. ❌ Should NOT see: John Smith, Maria Garcia, or any demo names
```

### TEST 4: Doctor Profile Edit (1 minute)
```
1. Still logged in as Dr. Chaithika
2. Click "My Profile" in sidebar (3rd option)
3. Click "Edit Profile" button
4. Change "Experience" from current value to any number
5. Click "Save Changes"
6. ✅ Should see: Success toast notification
7. Refresh page (F5)
8. ✅ Should see: Your change persisted
```

### TEST 5: Appointment Status Sync (1.5 minutes)
```
1. Still logged in as doctor
2. Go to "Appointments"
3. Find Harika's appointment
4. Click "Complete" button
5. ✅ Status should change to "Completed"
6. Logout
7. Login as patient: ksubramanyam906@gmail.com / Chaithika@09
8. Go to "My Appointments"
9. ✅ Should see: Appointment status is "Completed"
   (Status synced from doctor to patient!)
```

---

## 🎯 Expected Results

All 5 tests should **PASS** with ✅

If any test fails:
1. Check browser console (F12 → Console) for errors
2. Check backend is running (http://localhost:5000)
3. Check TEST-CHECKLIST.md for detailed troubleshooting

---

## ✅ Quick Verification Checklist

After running all 5 tests:

- [ ] Patient sees ONLY real doctors (no demo data)
- [ ] Patient can book appointments successfully
- [ ] Doctor sees ONLY real patients (no demo data)
- [ ] Doctor can edit profile and changes save
- [ ] Appointment status syncs between patient and doctor portals
- [ ] No console errors in browser
- [ ] All pages load without errors

**If all checked → Portal is working perfectly! 🎉**

---

## 🚨 Common Issues

**Issue:** Still seeing "Dr. Sarah Johnson"
**Fix:** Clear localStorage again, hard refresh (Ctrl+F5)

**Issue:** "Doctor not found" error
**Fix:** Make sure both doctors are approved. Run:
```bash
cd backend
node approve-doctor.js lschaithika@gmail.com
node approve-doctor.js ksubramanyam@gmail.com
```

**Issue:** No appointments showing
**Fix:** Book a new appointment and check database

**Issue:** Cannot login
**Fix:** Verify password is exactly: `Chaithika@09`

---

*Total Test Time: ~5 minutes*
*Status: Ready to test!*
