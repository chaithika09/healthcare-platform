# 🏥 Healthcare Platform - Complete Localhost Setup Guide

## 📋 Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional, for version control)

---

## 🚀 Quick Start (Complete Project)

### Step 1: Start MongoDB

**Option A - Windows Service:**
```cmd
net start MongoDB
```

**Option B - Manual Start:**
```cmd
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Step 2: Start Backend Server

Open **Terminal 1** (cmd or PowerShell):

```cmd
cd "c:\Users\lscha\OneDrive\Desktop\healcare project\healthcare-platform\backend"
npm install
npm run dev
```

✅ Backend will start on: **http://localhost:5000**

### Step 3: Start Frontend Server

Open **Terminal 2** (cmd or PowerShell):

```cmd
cd "c:\Users\lscha\OneDrive\Desktop\healcare project\healthcare-platform\frontend"
npm install
npm start
```

✅ Frontend will start on: **http://localhost:3000**

Your browser should automatically open to `http://localhost:3000`

---

## 🧪 Test User Credentials

### Patients
1. **Harika**
   - Email: `ksubramanyam906@gmail.com`
   - Password: `Chaithika@09`
   - Phone: `9392886725`

2. **Leela**
   - Email: `kleelavathi906@gmail.com`
   - Password: `Chaithika@09`
   - Phone: `9392886725`

### Doctors
1. **Dr. Chaithika** (Cardiologist)
   - Email: `lschaithika@gmail.com`
   - Password: `Chaithika@09`
   - Phone: `9392886725`
   - Status: ✅ Approved

2. **Dr. Subramanyam** (Cardiologist)
   - Email: `ksubramanyam@gmail.com`
   - Password: `Chaithika@09`
   - Phone: `9392886725`
   - Status: ✅ Approved

---

## 📝 Testing "My Patients" Feature

### Steps to Test:

1. **Login as Patient** (Harika or Leela)
   - Go to: http://localhost:3000/login
   - Login with patient credentials
   - Navigate to "Find Doctors"
   - Select a doctor (Dr. Chaithika or Dr. Subramanyam)
   - Book an appointment
   - Fill in symptoms and details
   - Confirm booking

2. **Login as Doctor**
   - Logout from patient account
   - Login with doctor credentials
   - Navigate to "My Appointments" to see the booked appointment
   - Navigate to "My Patients" from sidebar
   - You should see the patient who booked the appointment

3. **Test "My Patients" Buttons**
   - Click on a patient from the list
   - Patient details will show on the right side
   - Click **"Write Prescription"** button
     - Should navigate to `/doctor/prescriptions`
     - Patient information should be pre-filled
     - Fill in prescription details
     - Submit prescription
   - Click **"View Records"** button
     - Currently shows info toast
     - Feature can be enhanced in future

---

## 🔧 Troubleshooting

### Issue: Backend not starting
```cmd
# Check if MongoDB is running
mongosh
# or
mongo

# If connection error, start MongoDB service
net start MongoDB
```

### Issue: Port already in use
```cmd
# Kill process on port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Kill process on port 3000 (Frontend)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Module not found
```cmd
# Reinstall dependencies
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

cd ..\frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Issue: Database empty / No users
```cmd
# Re-seed the database
cd backend
node seed-real-users.js
node approve-doctor.js lschaithika@gmail.com
node approve-doctor.js ksubramanyam@gmail.com
```

---

## 📂 Project Structure

```
healthcare-platform/
├── backend/                  # Node.js + Express API
│   ├── server.js            # Entry point
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── middleware/      # Auth, error handling
│   └── .env                 # Environment variables
│
├── frontend/                 # React 18 application
│   ├── public/
│   └── src/
│       ├── pages/           # Page components
│       ├── components/      # Reusable components
│       ├── services/        # API calls
│       ├── store/           # Zustand state
│       └── App.js           # Route definitions
│
└── mobile/                   # React Native (Expo)
    └── App.js
```

---

## 🌐 API Endpoints

### Base URL (Local)
```
http://localhost:5000/api/v1
```

### Key Endpoints

**Auth:**
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login
- GET `/auth/me` - Get current user

**Patients:**
- GET `/patients/me` - Get patient profile
- PUT `/patients/me` - Update patient profile

**Doctors:**
- GET `/doctors` - Get all doctors
- GET `/doctors/:id` - Get doctor by ID
- GET `/doctors/me` - Get doctor profile
- GET `/doctors/appointments` - Get doctor's appointments

**Appointments:**
- POST `/appointments` - Book appointment
- GET `/appointments` - Get user's appointments
- PATCH `/appointments/:id` - Update appointment status

---

## ✅ Complete Testing Checklist

### Patient Portal
- [ ] Register new patient account
- [ ] Login as patient
- [ ] Browse doctors without login
- [ ] View doctor profiles
- [ ] Book appointment
- [ ] View appointment history
- [ ] Update profile

### Doctor Portal
- [ ] Login as doctor
- [ ] View dashboard stats
- [ ] View all appointments
- [ ] Update appointment status
- [ ] View "My Patients" page
- [ ] Select patient from list
- [ ] Click "Write Prescription"
- [ ] Fill and submit prescription
- [ ] Update doctor profile
- [ ] View patient visit history

### Cross-Portal Linking
- [ ] Patient books appointment → Shows in doctor's appointments
- [ ] Patient appears in doctor's "My Patients"
- [ ] Doctor can see patient details from appointments
- [ ] Appointment count updates correctly

---

## 🎯 Current Status

### ✅ Working Features
- Patient registration and login
- Doctor registration and login
- Browse doctors (public access)
- Book appointments (no payment required)
- View appointment history
- Doctor dashboard
- Doctor appointments management
- **My Patients page with real data**
- **Write Prescription feature**
- Doctor profile management
- Patient-Doctor portal linking

### ⚠️ Limited Features
- Chat (basic UI, needs Socket.io integration)
- View Records (placeholder)
- Email notifications (needs SMTP setup)

### 🚧 Future Enhancements
- Full medical records system
- Lab test booking
- Video consultation
- Admin panel enhancements

---

## 📞 Support

If you encounter any issues:
1. Check the console logs in browser (F12)
2. Check backend terminal for errors
3. Verify MongoDB is running
4. Ensure all dependencies are installed
5. Check if ports 3000 and 5000 are available

---

## 🔒 Environment Variables

### Backend `.env` file location:
```
c:\Users\lscha\OneDrive\Desktop\healcare project\healthcare-platform\backend\.env
```

### Required variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare-platform
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

---

## 🎉 You're All Set!

Your healthcare platform should now be running on:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

Happy Testing! 🏥✨
