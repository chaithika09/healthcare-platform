# 🏗️ Healthcare Platform - Architecture Overview

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│  │   Patient    │        │    Doctor    │        │    Admin     │  │
│  │   Portal     │        │    Portal    │        │    Panel     │  │
│  └──────┬───────┘        └──────┬───────┘        └──────┬───────┘  │
│         │                       │                       │           │
│         └───────────────────────┴───────────────────────┘           │
│                                 │                                    │
│                          React 18 Frontend                           │
│                    (localhost:3000 / Vercel)                         │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                           HTTP/HTTPS (JWT)
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                         API LAYER (Express.js)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API Routes                               │  │
│  │  /auth  |  /patients  |  /doctors  |  /appointments          │  │
│  └────┬─────────┬─────────────┬────────────┬──────────────────┘  │
│       │         │             │            │                       │
│  ┌────┴─────────┴─────────────┴────────────┴────────────────┐    │
│  │                   Controllers                              │    │
│  │  authController | patientController | doctorController     │    │
│  └────┬─────────────────────────────────────────────────────┬┘    │
│       │                                                      │      │
│  ┌────┴──────────────────────────────────────────────────┬──┴───┐ │
│  │              Middleware                                │      │ │
│  │  - Authentication (JWT)                                │      │ │
│  │  - Role Verification                                   │      │ │
│  │  - Error Handling                                      │      │ │
│  └────────────────────────────────────────────────────────┘      │ │
│                                                                    │ │
│                   Node.js + Express Backend                       │ │
│              (localhost:5000 / Render.com)                        │ │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                            Mongoose ODM
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                         DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Users   │  │ Patients │  │ Doctors  │  │  Appointments    │   │
│  │          │  │          │  │          │  │                  │   │
│  │ _id      │  │ user_id  │  │ user_id  │  │ patient_id       │   │
│  │ email    │  │ dob      │  │ specialty│  │ doctor_id        │   │
│  │ password │  │ gender   │  │ license  │  │ date             │   │
│  │ role     │  │ phone    │  │ fees     │  │ timeSlot         │   │
│  └──────────┘  └──────────┘  └──────────┘  │ symptoms         │   │
│                                             │ status           │   │
│  ┌──────────┐  ┌──────────┐                └──────────────────┘   │
│  │ Records  │  │Prescr... │                                        │
│  └──────────┘  └──────────┘                                        │
│                                                                      │
│                    MongoDB Database                                  │
│           (mongodb://localhost:27017 / Atlas)                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 "My Patients" Feature Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MY PATIENTS FEATURE FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: PATIENT BOOKS APPOINTMENT
┌──────────────────────────────────┐
│  Patient Portal                   │
│  - Selects doctor                 │
│  - Chooses date/time              │
│  - Enters symptoms                │
│  - Confirms booking               │
└────────────┬─────────────────────┘
             │ POST /appointments
             ▼
┌──────────────────────────────────┐
│  Backend API                      │
│  - Validates data                 │
│  - Creates appointment document   │
│  - Links patient._id → doctor._id │
│  - Saves to MongoDB               │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  MongoDB                          │
│  Appointment {                    │
│    patient: ObjectId("...")       │
│    doctor: ObjectId("...")        │
│    date: "2026-08-20"             │
│    symptoms: "Chest pain"         │
│    status: "confirmed"            │
│  }                                │
└───────────────────────────────────┘


STEP 2: DOCTOR VIEWS "MY PATIENTS"
┌──────────────────────────────────┐
│  Doctor Portal                    │
│  - Navigate to "My Patients"      │
│  - Page loads                     │
└────────────┬─────────────────────┘
             │ GET /doctors/appointments
             ▼
┌──────────────────────────────────┐
│  Backend API                      │
│  - Verify JWT token               │
│  - Get doctor ID from token       │
│  - Query appointments             │
│  - Populate patient data          │
│  - Return appointments[]          │
└────────────┬─────────────────────┘
             │ Response with patient data
             ▼
┌──────────────────────────────────┐
│  PatientRecords.jsx               │
│  - Receive appointments           │
│  - Extract unique patients        │
│  - Build patient objects          │
│  - Count visits per patient       │
│  - Display in list                │
└───────────────────────────────────┘


STEP 3: DOCTOR VIEWS PATIENT DETAILS
┌──────────────────────────────────┐
│  Patient List                     │
│  - Click on patient name          │
└────────────┬─────────────────────┘
             │ setSelected(patient)
             ▼
┌──────────────────────────────────┐
│  Patient Details Panel            │
│  Display:                         │
│  - Name, age, gender              │
│  - Phone, email                   │
│  - Last visit, condition          │
│  - Total visits                   │
│  - Recent visit history           │
│  - Action buttons:                │
│    • Write Prescription           │
│    • View Records                 │
└───────────────────────────────────┘


STEP 4: WRITE PRESCRIPTION
┌──────────────────────────────────┐
│  PatientRecords.jsx               │
│  - User clicks "Write             │
│    Prescription"                  │
└────────────┬─────────────────────┘
             │ navigate("/doctor/prescriptions",
             │   { state: { patient: selected } })
             ▼
┌──────────────────────────────────┐
│  PrescriptionUpload.jsx           │
│  - Receives patient data          │
│  - Pre-fills form fields:         │
│    • Patient Name (read-only)     │
│    • Patient ID (read-only)       │
│    • Age (read-only)              │
│  - Shows patient banner           │
│  - Doctor adds prescription       │
│  - Submits form                   │
└───────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      APPOINTMENT LIFECYCLE                       │
└─────────────────────────────────────────────────────────────────┘

1. CREATION (Patient Portal)
   Patient → Book Appointment → API → MongoDB
   
2. VIEWING (Doctor Portal)
   Doctor → View Appointments → API → MongoDB → Display
   
3. PATIENT EXTRACTION (My Patients)
   Appointments[] → Extract Unique Patients → Display List
   
4. PRESCRIPTION CREATION (Write Prescription)
   Select Patient → Navigate → Pre-fill Form → Submit → Save
   
5. STATUS UPDATES (Both Portals)
   Update Status → API → MongoDB → Refresh UI
```

---

## 📦 Component Hierarchy

```
App.js (Routes)
│
├── Patient Portal
│   ├── WelcomePage
│   ├── DoctorListPage
│   ├── DoctorProfilePage
│   ├── BookAppointment
│   ├── AppointmentHistory
│   └── PatientDashboard
│
├── Doctor Portal
│   ├── DoctorDashboard
│   ├── DoctorAppointments
│   ├── PatientRecords ⭐ (My Patients)
│   │   ├── Patient List (Left)
│   │   ├── Patient Details (Right)
│   │   └── Action Buttons
│   │       ├── Write Prescription → PrescriptionUpload
│   │       └── View Records → Toast
│   ├── PrescriptionUpload ⭐
│   │   ├── Patient Info Banner
│   │   ├── Patient Details Form (Pre-filled)
│   │   ├── Medicines Array
│   │   └── Submit Button
│   └── DoctorProfile
│
└── Admin Portal
    ├── AdminDashboard
    ├── UserManagement
    └── DoctorApproval
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User Login
    ↓
POST /auth/login { email, password }
    ↓
Backend validates credentials
    ↓
Generate JWT Token
    ↓
Return { token, user, role }
    ↓
Store in Zustand + localStorage
    ↓
Set Authorization Header (All API calls)
    ↓
Protected Routes Check Token
    ↓
If Valid → Access Granted
If Invalid → Redirect to Login
```

---

## 🗄️ Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                         │
└──────────────────────────────────────────────────────────────────┘

User
├── _id (Primary Key)
├── email
├── password (hashed)
├── role (patient/doctor/admin)
└── timestamps

Patient
├── _id
├── user → User._id (Reference)
├── dateOfBirth
├── gender
├── phone
└── medicalHistory

Doctor
├── _id
├── user → User._id (Reference)
├── specialty
├── qualifications
├── licenseNumber
├── consultationFee
├── availability
└── verificationStatus

Appointment
├── _id
├── patient → Patient._id (Reference) ⭐
├── doctor → Doctor._id (Reference) ⭐
├── date
├── timeSlot
├── symptoms
├── status
└── timestamps

Prescription
├── _id
├── appointment → Appointment._id
├── patient → Patient._id
├── doctor → Doctor._id
├── medicines[]
├── diagnosis
└── notes
```

---

## 🌐 API Endpoint Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       API STRUCTURE                               │
└──────────────────────────────────────────────────────────────────┘

/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── GET /me
│
├── /patients
│   ├── GET /me (Get patient profile)
│   ├── PUT /me (Update profile)
│   └── GET /dashboard
│
├── /doctors
│   ├── GET / (Get all doctors)
│   ├── GET /:id (Get doctor by ID)
│   ├── GET /me (Get doctor profile)
│   ├── PUT /me (Update profile)
│   └── GET /appointments ⭐ (Get doctor's appointments)
│
├── /appointments
│   ├── POST / (Book appointment)
│   ├── GET / (Get user's appointments)
│   ├── GET /:id (Get specific appointment)
│   ├── PATCH /:id (Update appointment)
│   └── DELETE /:id/cancel
│
└── /prescriptions
    ├── POST / (Create prescription)
    ├── GET / (Get prescriptions)
    └── GET /:id (Get specific prescription)
```

---

## 🎨 Frontend State Management

```
┌──────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE STORE                            │
└──────────────────────────────────────────────────────────────────┘

authStore
├── user (Current user object)
├── token (JWT token)
├── isAuthenticated (boolean)
├── login() (Action)
├── logout() (Action)
└── updateUser() (Action)

Component Local State (useState)
├── PatientRecords
│   ├── patients[] (Extracted from appointments)
│   ├── selected (Currently selected patient)
│   ├── search (Search query)
│   └── loading (Loading state)
│
└── PrescriptionUpload
    ├── patientData (From navigation state)
    ├── submitted (Submission status)
    └── form data (react-hook-form)
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                          │
└──────────────────────────────────────────────────────────────────┘

Frontend (Vercel)
    ↓
CDN Distribution
    ↓
User Browser
    ↓
HTTPS Requests
    ↓
Backend (Render.com)
    ↓
MongoDB Atlas
    ↓
Cloud Database

Environment:
- Frontend: Vercel (Auto-deploy from Git)
- Backend: Render (Container deployment)
- Database: MongoDB Atlas (Cloud)
- SSL: Automatic (Vercel + Render)
```

---

## 📊 Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│               GET /doctors/appointments FLOW                      │
└──────────────────────────────────────────────────────────────────┘

1. User Action
   Doctor clicks "My Patients"
   
2. Frontend Request
   axios.get('/doctors/appointments', {
     headers: { Authorization: 'Bearer <token>' }
   })
   
3. Backend Receives
   - Extract JWT from header
   - Verify token
   - Get doctor ID from token
   
4. Database Query
   Appointment.find({ doctor: doctorId })
     .populate('patient', 'name email phone age gender')
     .sort({ date: -1 })
   
5. Backend Response
   {
     success: true,
     data: {
       appointments: [
         {
           _id: "...",
           patient: {
             _id: "...",
             name: "Harika",
             email: "ksubramanyam906@gmail.com",
             ...
           },
           date: "2026-08-20",
           symptoms: "Chest pain",
           ...
         }
       ]
     }
   }
   
6. Frontend Processing
   - Extract appointments
   - Filter unique patients
   - Build patient objects with visit counts
   - Update state
   - Render UI
```

---

## 🎯 Key Design Patterns

### 1. Repository Pattern
```
Controllers → Services → Models → Database
```

### 2. Middleware Chain
```
Request → Auth Middleware → Role Check → Controller → Response
```

### 3. State Management
```
Zustand (Global) + useState (Local) + React Query (Server State)
```

### 4. Component Composition
```
Page → Layout → Feature Components → UI Components
```

---

## 📝 Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalable structure
- ✅ Secure authentication
- ✅ Efficient data flow
- ✅ Maintainable codebase
- ✅ Production-ready deployment

**Status**: ✅ **Production-Ready Architecture**
**Created by**: Kiro AI Assistant
