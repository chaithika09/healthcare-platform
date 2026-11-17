import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const ROLES = [
  { value: 'patient', label: 'Patient',  icon: 'person',  color: Colors.primary  },
  { value: 'doctor',  label: 'Doctor',   icon: 'medical', color: Colors.secondary },
];

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('patient');
  const [loading,  setLoading]  = useState(false);
  const { setAuth } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim())                  { Alert.alert('Error', 'Please enter your full name');      return; }
    if (!email.trim())                 { Alert.alert('Error', 'Please enter your email');           return; }
    if (!phone.trim())                 { Alert.alert('Error', 'Please enter your phone number');   return; }
    if (!password || password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      // Step 1: Register (returns { userId, email } — no token)
      await authAPI.register({
        name:  name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
      });

      // Step 2: Auto login with same credentials
      const loginRes = await authAPI.login({
        email:    email.trim().toLowerCase(),
        password,
      });
      const { user, token, refreshToken } = loginRes.data.data;
      await setAuth(user, token, refreshToken);

      const tabMap = { doctor: 'DoctorTab', patient: 'PatientTab' };
      navigation.replace(tabMap[user.role] || 'PatientTab');

    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      if (msg.toLowerCase().includes('already registered')) {
        Alert.alert('Account Exists', 'This email is already registered. Please sign in.', [
          { text: 'Sign In', onPress: () => navigation.navigate('Login') },
          { text: 'Cancel' },
        ]);
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <LinearGradient colors={['#0066CC', '#00A86B']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>+</Text>
          </View>
          <Text style={styles.brandName}>Create Account</Text>
          <Text style={styles.brandSub}>Join MedIQ Healthcare Portal</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Fill in your details below</Text>

          {/* Role selector */}
          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[styles.roleBtn, role === r.value && { backgroundColor: r.color, borderColor: r.color }]}
              >
                <Ionicons name={r.icon} size={20} color={role === r.value ? '#fff' : r.color} />
                <Text style={[styles.roleTxt, role === r.value && styles.roleTxtActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            icon="person-outline"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            icon="call-outline"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min 8 characters"
            secureTextEntry
            icon="lock-closed-outline"
          />
          <Text style={styles.passHint}>Use uppercase, lowercase and numbers</Text>

          <GradientButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.btn}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: Colors.background },
  container:     { flexGrow: 1 },
  header:        { alignItems: 'center', paddingTop: 50, paddingBottom: 30, position: 'relative' },
  backBtn:       { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 4 },
  logoBox:       { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText:      { fontSize: 32, color: '#fff', fontWeight: '800' },
  brandName:     { fontSize: 24, fontWeight: '800', color: '#fff' },
  brandSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  form:          { flex: 1, padding: 24, paddingTop: 20 },
  title:         { fontSize: Fonts.size.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle:      { fontSize: Fonts.size.sm, color: Colors.textMuted, marginBottom: 20 },
  label:         { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  roleRow:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 13, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, justifyContent: 'center', backgroundColor: Colors.card },
  roleTxt:       { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.textMuted },
  roleTxtActive: { color: '#fff' },
  passHint:      { fontSize: 11, color: Colors.textFaint, marginTop: -8, marginBottom: 16 },
  btn:           { marginBottom: 20 },
  loginRow:      { flexDirection: 'row', justifyContent: 'center', marginTop: 4, paddingBottom: 30 },
  loginText:     { color: Colors.textMuted, fontSize: Fonts.size.sm },
  loginLink:     { color: Colors.primary, fontWeight: '700', fontSize: Fonts.size.sm },
});
