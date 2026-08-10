import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter your full name'); return; }
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
    if (!password || password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const res = await authAPI.register({ name: name.trim(), email: email.trim(), password, role });
      const { user, token, refreshToken } = res.data.data;
      await setAuth(user, token, refreshToken);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.replace('PatientTab') }
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <LinearGradient colors={['#0066CC', '#00A86B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoBox}><Text style={styles.logoText}>+</Text></View>
        <Text style={styles.brandName}>Create Account</Text>
        <Text style={styles.brandSub}>Join MedIQ+ Healthcare Portal</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.subtitle}>Enter your personal details below</Text>

        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          icon="person-outline"
        />

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          icon="mail-outline"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          icon="lock-closed-outline"
        />

        {/* Role Selection */}
        <Text style={styles.label}>Account Role</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
            onPress={() => setRole('patient')}
          >
            <Ionicons name="person" size={18} color={role === 'patient' ? '#fff' : Colors.primary} />
            <Text style={[styles.roleTxt, role === 'patient' && styles.roleTxtActive]}>Patient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'doctor' && styles.roleBtnActive]}
            onPress={() => setRole('doctor')}
          >
            <Ionicons name="medical" size={18} color={role === 'doctor' ? '#fff' : Colors.primary} />
            <Text style={[styles.roleTxt, role === 'doctor' && styles.roleTxtActive]}>Doctor</Text>
          </TouchableOpacity>
        </View>

        <GradientButton title="Register" onPress={handleRegister} loading={loading} style={styles.btn} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: Colors.background },
  container:    { flexGrow: 1 },
  header:       { alignItems: 'center', paddingTop: 50, paddingBottom: 30, position: 'relative' },
  backBtn:      { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 4 },
  logoBox:      { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText:     { fontSize: 32, color: '#fff', fontWeight: '800' },
  brandName:    { fontSize: 24, fontWeight: '800', color: '#fff' },
  brandSub:     { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  form:         { flex: 1, padding: 24, paddingTop: 20 },
  title:        { fontSize: Fonts.size.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle:     { fontSize: Fonts.size.sm, color: Colors.textMuted, marginBottom: 20 },
  label:        { fontSize: Fonts.size.sm, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  roleRow:      { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.primary, justifyContent: 'center' },
  roleBtnActive:{ backgroundColor: Colors.primary },
  roleTxt:      { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.primary },
  roleTxtActive:{ color: '#fff' },
  btn:          { marginBottom: 20 },
  loginRow:     { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  loginText:    { color: Colors.textMuted, fontSize: Fonts.size.sm },
  loginLink:    { color: Colors.primary, fontWeight: '700', fontSize: Fonts.size.sm },
});
