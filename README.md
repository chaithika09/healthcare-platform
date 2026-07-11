# Smart Healthcare Record & Doctor-Patient Portal System

A full-stack, production-ready healthcare platform that connects patients with doctors through a secure, real-time digital portal. Manage appointments, electronic health records (EHR), prescriptions, lab results, and live consultations — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Patient Portal
- Secure registration & login (JWT-based authentication)
- Book, reschedule, and cancel appointments
- View and download medical records & lab results
- Access prescriptions and medication history
- Real-time chat and video consultation with doctors
- Health dashboard with charts and vitals tracking
- Notification center (email, in-app, optional SMS)

### Doctor Portal
- Manage availability and appointment schedule
- Access patient medical history and records
- Write digital prescriptions and referrals
- Upload and manage lab/diagnostic reports
- Real-time messaging with patients
- Analytics dashboard (appointments, patient stats)

### Admin Panel
- User management (patients, doctors, staff)
- Department and clinic management
- System-wide analytics and reporting
- Audit logs and compliance monitoring

### Platform
- Role-based access control (Patient, Doctor, Admin)
- End-to-end encrypted sensitive data
- Real-time notifications via Socket.io
- Responsive design — mobile, tablet, desktop
- WCAG 2.1 AA accessibility compliance

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI framework |
| React Router | 6.20.0 | Client-side routing |
| Tailwind CSS | 3.3.5 | Utility-first styling |
| Framer Motion | 10.16.4 | Animations & transitions |
| Recharts | 2.9.3 | Data visualization |
| TanStack Query | 5.8.4 | Server state management |
| Zustand | 4.4.6 | Client state management |
| React Hook Form | 7.48.2 | Form handling & validation |
| Axios | 1.6.2 | HTTP client |
| Socket.io Client | 4.6.1 | Real-time communication |
| Headless UI | 1.7.17 | Accessible UI primitives |
| React Hot Toast | 2.4.1 | Toast notifications |
| date-fns | 2.30.0 | Date utilities |
| React Icons | 4.11.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18.0.0 | Runtime |
| Express | 4.18.2 | Web framework |
| MongoDB + Mongoose | 8.0.1 | Database & ODM |
| JSON Web Token | 9.0.2 | Authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Socket.io | 4.6.1 | Real-time events |
| Multer | 1.4.5-lts.1 | File uploads |
| Nodemailer | 6.9.7 | Email delivery |
| Helmet | 7.1.0 | Security headers |
| express-rate-limit | 7.1.5 | Rate limiting |
| express-validator | 7.0.1 | Input validation |
| Morgan | 1.10.0 | HTTP request logging |
| UUID | 9.0.1 | Unique ID generation |

---

## Project Structure

```
healthcare-platform/
├── frontend/                    # React application
│   ├── public/
│   │   └── index.html           # HTML entry point
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Buttons, inputs, modals, etc.
│   │   │   ├── layout/          # Sidebar, navbar, footer
│   │   │   └── charts/          # Recharts wrappers
│   │   ├── pages/               # Route-level page components
│   │   │   ├── auth/            # Login, register, forgot password
│   │   │   ├── patient/         # Patient dashboard & features
│   │   │   ├── doctor/          # Doctor dashboard & features
│   │   │   └── admin/           # Admin panel
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state stores
│   │   ├── services/            # Axios API service layer
│   │   ├── utils/               # Helper functions
│   │   ├── constants/           # App-wide constants
│   │   ├── types/               # TypeScript types (if migrating)
│   │   ├── App.js               # Root component & routes
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles & Tailwind
│   ├── tailwind.config.js       # Tailwind theme configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── package.json
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── config/              # DB, mail, upload config
│   │   ├── controllers/         # Route handler logic
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── doctorController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── recordController.js
│   │   │   └── adminController.js
│   │   ├── middleware/          # Auth, error, validation middleware
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Patient.js
│   │   │   ├── Doctor.js
│   │   │   ├── Appointment.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── Prescription.js
│   │   │   └── Notification.js
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Business logic services
│   │   ├── sockets/             # Socket.io event handlers
│   │   └── utils/               # Helpers (email, tokens, etc.)
│   ├── uploads/                 # Local file upload storage (gitignored)
│   ├── logs/                    # Application logs (gitignored)
│   ├── .env.example             # Environment variable template
│   ├── .env                     # Your local env (DO NOT COMMIT)
│   ├── server.js                # Express app entry point
│   └── package.json
│
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **MongoDB** v6+ (local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **npm** v9+ or **yarn** v1.22+

### 1. Clone the repository

```bash
git clone https://github.com/your-org/healthcare-platform.git
cd healthcare-platform
```

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, SMTP credentials, etc.

# Start development server (with hot reload)
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

---

## Environment Variables

All required environment variables are documented in [`backend/.env.example`](./backend/.env.example).

Key variables to configure before running:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email delivery credentials |
| `CORS_ORIGINS` | Allowed frontend origins |

---

## Available Scripts

### Frontend (`/frontend`)

| Script | Description |
|---|---|
| `npm start` | Start development server on port 3000 |
| `npm run build` | Create optimized production build |
| `npm test` | Run test suite |

### Backend (`/backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npm test` | Run Jest test suite |

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login & receive tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/patients/me` | Get current patient profile |
| GET | `/doctors` | List all doctors |
| GET | `/doctors/:id` | Get doctor profile |
| POST | `/appointments` | Book an appointment |
| GET | `/appointments` | List user appointments |
| PATCH | `/appointments/:id` | Update appointment status |
| GET | `/records` | Get patient medical records |
| POST | `/records` | Upload a medical record |
| GET | `/prescriptions` | Get prescriptions |
| POST | `/prescriptions` | Create prescription (doctor) |

Full API documentation is available via Swagger at `http://localhost:5000/api/docs` (when running in development mode).

---

## Security

- All passwords are hashed with **bcryptjs** (12 salt rounds)
- API routes are protected with **JWT Bearer tokens**
- Sensitive medical data is encrypted at rest
- HTTP headers hardened with **Helmet**
- Rate limiting on auth endpoints to prevent brute-force attacks
- Input validation and sanitization on all endpoints
- CORS restricted to configured origins

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

*Built with care for better healthcare.*
