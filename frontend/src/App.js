import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoadingScreen from "./components/common/LoadingScreen";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// ── Auth Pages ────────────────────────────────────────────────
const SplashScreen      = lazy(() => import("./pages/SplashScreen"));
const WelcomePage       = lazy(() => import("./pages/WelcomePage"));
const OnboardingPage    = lazy(() => import("./pages/OnboardingPage"));
const LoginPage         = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage      = lazy(() => import("./pages/auth/RegisterPage"));
const OTPVerifyPage     = lazy(() => import("./pages/auth/OTPVerifyPage"));
const ForgotPasswordPage= lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));

// ── Patient Pages ─────────────────────────────────────────────
const PatientDashboard  = lazy(() => import("./pages/patient/PatientDashboard"));
const DoctorListPage    = lazy(() => import("./pages/patient/DoctorListPage"));
const DoctorProfilePage = lazy(() => import("./pages/patient/DoctorProfilePage"));
const BookAppointment   = lazy(() => import("./pages/patient/BookAppointment"));
const AppointmentConfirm= lazy(() => import("./pages/patient/AppointmentConfirm"));
const MedicalRecords    = lazy(() => import("./pages/patient/MedicalRecords"));
const UploadReports     = lazy(() => import("./pages/patient/UploadReports"));
const PrescriptionViewer= lazy(() => import("./pages/patient/PrescriptionViewer"));
const LabTestBooking    = lazy(() => import("./pages/patient/LabTestBooking"));
const PaymentPage       = lazy(() => import("./pages/patient/PaymentPage"));
const PaymentHistory    = lazy(() => import("./pages/patient/PaymentHistory"));
const EmergencySupport  = lazy(() => import("./pages/patient/EmergencySupport"));
const MedicineReminder  = lazy(() => import("./pages/patient/MedicineReminder"));

// ── Doctor Pages ──────────────────────────────────────────────
const DoctorDashboard   = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorAppointments= lazy(() => import("./pages/doctor/DoctorAppointments"));
const PatientRecords    = lazy(() => import("./pages/doctor/PatientRecords"));
const PrescriptionUpload= lazy(() => import("./pages/doctor/PrescriptionUpload"));
const VideoConsultation = lazy(() => import("./pages/VideoConsultation"));
const ChatPage          = lazy(() => import("./pages/ChatPage"));

// ── Admin Pages ───────────────────────────────────────────────
const AdminDashboard    = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement    = lazy(() => import("./pages/admin/UserManagement"));
const DoctorVerification= lazy(() => import("./pages/admin/DoctorVerification"));
const AnalyticsDashboard= lazy(() => import("./pages/admin/AnalyticsDashboard"));
const ActivityLogs      = lazy(() => import("./pages/admin/ActivityLogs"));

// ── Shared Pages ──────────────────────────────────────────────
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const UserProfile       = lazy(() => import("./pages/UserProfile"));
const EditProfile       = lazy(() => import("./pages/EditProfile"));
const SettingsPage      = lazy(() => import("./pages/SettingsPage"));
const HealthArticles    = lazy(() => import("./pages/HealthArticles"));
const ArticleDetail     = lazy(() => import("./pages/ArticleDetail"));
const FeedbackRatings   = lazy(() => import("./pages/FeedbackRatings"));
const AIChatbot         = lazy(() => import("./pages/AIChatbot"));
const ContactUs         = lazy(() => import("./pages/ContactUs"));
const AboutUs           = lazy(() => import("./pages/AboutUs"));
const FAQPage           = lazy(() => import("./pages/FAQPage"));
const HelpSupport       = lazy(() => import("./pages/HelpSupport"));
const TermsPage         = lazy(() => import("./pages/TermsPage"));
const PrivacyPage       = lazy(() => import("./pages/PrivacyPage"));
const NotFoundPage      = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "doctor") return "/doctor/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/patient/dashboard";
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Public splash / onboarding ── */}
        <Route path="/splash"      element={<SplashScreen />} />
        <Route path="/welcome"     element={<WelcomePage />} />
        <Route path="/onboarding"  element={<OnboardingPage />} />

        {/* ── Auth routes ── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/verify-otp"      element={<OTPVerifyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* ── Protected app routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Patient */}
            <Route path="/patient/dashboard"    element={<PatientDashboard />} />
            <Route path="/doctors"              element={<DoctorListPage />} />
            <Route path="/doctors/:id"          element={<DoctorProfilePage />} />
            <Route path="/book-appointment/:id" element={<BookAppointment />} />
            <Route path="/appointment-confirm"  element={<AppointmentConfirm />} />
            <Route path="/medical-records"      element={<MedicalRecords />} />
            <Route path="/upload-reports"       element={<UploadReports />} />
            <Route path="/prescriptions"        element={<PrescriptionViewer />} />
            <Route path="/lab-tests"            element={<LabTestBooking />} />
            <Route path="/payment"              element={<PaymentPage />} />
            <Route path="/payment-history"      element={<PaymentHistory />} />
            <Route path="/emergency"            element={<EmergencySupport />} />
            <Route path="/medicine-reminder"    element={<MedicineReminder />} />

            {/* Doctor */}
            <Route path="/doctor/dashboard"     element={<DoctorDashboard />} />
            <Route path="/doctor/appointments"  element={<DoctorAppointments />} />
            <Route path="/doctor/patients"      element={<PatientRecords />} />
            <Route path="/doctor/prescriptions" element={<PrescriptionUpload />} />

            {/* Admin */}
            <Route path="/admin/dashboard"      element={<AdminDashboard />} />
            <Route path="/admin/users"          element={<UserManagement />} />
            <Route path="/admin/verify-doctors" element={<DoctorVerification />} />
            <Route path="/admin/analytics"      element={<AnalyticsDashboard />} />
            <Route path="/admin/logs"           element={<ActivityLogs />} />

            {/* Shared */}
            <Route path="/video-call/:id"       element={<VideoConsultation />} />
            <Route path="/chat"                 element={<ChatPage />} />
            <Route path="/chat/:id"             element={<ChatPage />} />
            <Route path="/notifications"        element={<NotificationsPage />} />
            <Route path="/profile"              element={<UserProfile />} />
            <Route path="/profile/edit"         element={<EditProfile />} />
            <Route path="/settings"             element={<SettingsPage />} />
            <Route path="/articles"             element={<HealthArticles />} />
            <Route path="/articles/:id"         element={<ArticleDetail />} />
            <Route path="/feedback"             element={<FeedbackRatings />} />
            <Route path="/ai-assistant"          element={<AIChatbot />} />
            <Route path="/contact"              element={<ContactUs />} />
            <Route path="/about"                element={<AboutUs />} />
            <Route path="/faq"                  element={<FAQPage />} />
            <Route path="/help"                 element={<HelpSupport />} />
            <Route path="/terms"                element={<TermsPage />} />
            <Route path="/privacy"              element={<PrivacyPage />} />
          </Route>
        </Route>

        {/* ── Root redirect ── */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={getDashboardPath()} replace />
              : <Navigate to="/splash" replace />
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
