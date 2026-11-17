import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuthStore } from './src/store/authStore';
import { Colors } from './src/theme/colors';

// ─── Auth / Onboarding ──────────────────────────────────────────
import SplashScreen       from './src/screens/auth/SplashScreen';
import WelcomeScreen      from './src/screens/auth/WelcomeScreen';
import LoginScreen        from './src/screens/auth/LoginScreen';
import RegisterScreen     from './src/screens/auth/RegisterScreen';
import OTPVerifyScreen    from './src/screens/auth/OTPVerifyScreen';

// ─── Shared ─────────────────────────────────────────────────────
import IncomingCallModal    from './src/components/IncomingCallModal';
import NotificationsScreen  from './src/screens/shared/NotificationsScreen';

// ─── Patient Screens ────────────────────────────────────────────
import PatientDashboard      from './src/screens/patient/PatientDashboard';
import AppointmentsScreen    from './src/screens/patient/AppointmentsScreen';
import BookAppointmentScreen from './src/screens/patient/BookAppointmentScreen';
import DoctorsScreen         from './src/screens/patient/DoctorsScreen';
import DoctorProfileScreen   from './src/screens/patient/DoctorProfileScreen';
import MedicalRecordsScreen  from './src/screens/patient/MedicalRecordsScreen';
import PrescriptionsScreen   from './src/screens/patient/PrescriptionsScreen';
import ProfileScreen         from './src/screens/patient/ProfileScreen';
import EditProfileScreen     from './src/screens/patient/EditProfileScreen';
import LabTestScreen         from './src/screens/patient/LabTestScreen';
import EmergencyScreen       from './src/screens/patient/EmergencyScreen';
import VideoConsultationScreen from './src/screens/patient/VideoConsultationScreen';

// ─── Doctor Screens ─────────────────────────────────────────────
import DoctorDashboard          from './src/screens/doctor/DoctorDashboard';
import DoctorAppointmentsScreen from './src/screens/doctor/DoctorAppointmentsScreen';
import DoctorPatientsScreen     from './src/screens/doctor/DoctorPatientsScreen';
import DoctorProfileEditScreen  from './src/screens/doctor/DoctorProfileScreen';
import WritePrescriptionScreen  from './src/screens/doctor/WritePrescriptionScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────────
// PATIENT Tab Navigator
// ─────────────────────────────────────────────────────────────────
function PatientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:            { backgroundColor: Colors.card, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle:       { fontWeight: '700', color: Colors.text, fontSize: 18 },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 60, paddingBottom: 8, paddingTop: 6,
          backgroundColor: Colors.card, borderTopColor: Colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard:     'grid-outline',
            Appointments:  'calendar-outline',
            Records:       'folder-open-outline',
            Prescriptions: 'medical-outline',
            Profile:       'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size || 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard"     component={PatientDashboard}    options={{ title: 'Home' }} />
      <Tab.Screen name="Appointments"  component={AppointmentsScreen}  options={{ title: 'Appointments' }} />
      <Tab.Screen name="Records"       component={MedicalRecordsScreen} options={{ title: 'Records' }} />
      <Tab.Screen name="Prescriptions" component={PrescriptionsScreen} options={{ title: 'Prescriptions' }} />
      <Tab.Screen name="Profile"       component={ProfileScreen}       options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────
// DOCTOR Tab Navigator
// ─────────────────────────────────────────────────────────────────
function DoctorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:            { backgroundColor: Colors.card, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle:       { fontWeight: '700', color: Colors.text, fontSize: 18 },
        tabBarActiveTintColor:   Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 60, paddingBottom: 8, paddingTop: 6,
          backgroundColor: Colors.card, borderTopColor: Colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            DoctorHome:     'grid-outline',
            DoctorApts:     'calendar-outline',
            DoctorPatients: 'people-outline',
            DoctorProfile:  'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse-outline'} size={size || 22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DoctorHome"     component={DoctorDashboard}          options={{ title: 'Home' }} />
      <Tab.Screen name="DoctorApts"     component={DoctorAppointmentsScreen} options={{ title: 'Appointments' }} />
      <Tab.Screen name="DoctorPatients" component={DoctorPatientsScreen}     options={{ title: 'Patients' }} />
      <Tab.Screen name="DoctorProfile"  component={DoctorProfileEditScreen}  options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────
// Auth Stack
// ─────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"     component={LoginScreen} />
      <Stack.Screen name="Register"  component={RegisterScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
    </Stack.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root App
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isLoading, loadFromStorage, user } = useAuthStore();

  useEffect(() => { loadFromStorage(); }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isDoctor = user?.role === 'doctor';

  // Header options helper
  const header = (title, tintColor) => ({
    headerShown: true,
    title,
    headerBackTitleVisible: false,
    ...(tintColor ? { headerStyle: { backgroundColor: tintColor }, headerTintColor: '#fff', headerTitleStyle: { color: '#fff', fontWeight: '800' } } : {}),
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <IncomingCallModal />

        <Stack.Navigator screenOptions={{ headerShown: false }}>

          {/* ── Onboarding (always available) ── */}
          <Stack.Screen name="Splash"   component={SplashScreen} />
          <Stack.Screen name="Welcome"  component={WelcomeScreen} />

          {!isAuthenticated ? (
            /* ── Unauthenticated ── */
            <Stack.Screen name="Auth" component={AuthStack} />

          ) : isDoctor ? (
            /* ── Doctor Flow ── */
            <>
              <Stack.Screen name="DoctorTab" component={DoctorTabNavigator} />
              <Stack.Screen name="WritePrescription" component={WritePrescriptionScreen} />
              <Stack.Screen name="Notifications"     component={NotificationsScreen}  options={header('Notifications')} />
              <Stack.Screen name="Emergency"         component={EmergencyScreen}      options={header('Emergency Support', '#EF4444')} />
            </>

          ) : (
            /* ── Patient Flow ── */
            <>
              <Stack.Screen name="PatientTab" component={PatientTabNavigator} />

              <Stack.Screen name="Doctors"          component={DoctorsScreen}          options={header('Find Doctors')} />
              <Stack.Screen name="DoctorProfile"    component={DoctorProfileScreen}    options={{ headerShown: false }} />
              <Stack.Screen name="BookAppointment"  component={BookAppointmentScreen}  options={header('Book Appointment')} />
              <Stack.Screen name="EditProfile"      component={EditProfileScreen}      options={{ headerShown: false }} />
              <Stack.Screen name="Notifications"    component={NotificationsScreen}    options={header('Notifications')} />
              <Stack.Screen name="LabTests"         component={LabTestScreen}          options={header('Lab Tests')} />
              <Stack.Screen name="Emergency"        component={EmergencyScreen}        options={header('Emergency Support', '#EF4444')} />
              <Stack.Screen name="VideoConsultation" component={VideoConsultationScreen} options={{ headerShown: false }} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});
