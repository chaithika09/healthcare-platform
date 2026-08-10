import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import GradientButton, { OutlineButton } from '../../components/GradientButton';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
    if (!password)      { Alert.alert('Error', 'Please enter your password'); return; }

    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim(), password });
      const { user, token, refreshToken } = res.data.data;
      await setAuth(user, token, refreshToken);
      const map = { doctor:'DoctorTab', admin:'AdminTab', patient:'PatientTab' };
      navigation.replace(map[user.role] || 'PatientTab');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      patient: { email:'lschaithika+patient@gmail.com', pass:'Demo@1234' },
      doctor:  { email:'lschaithika+doctor@gmail.com',  pass:'Demo@1234' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].pass);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient colors={['#0066CC','#00A86B']} style={styles.header}>
        <View style={styles.logoBox}><Text style={styles.logoText}>+</Text></View>
        <Text style={styles.brandName}>Med<Text style={{color:'#00E5A0'}}>IQ</Text>+</Text>
        <Text style={styles.brandSub}>Smart Healthcare Portal</Text>
      </LinearGradient>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your healthcare account</Text>

        <Input label="Email Address" value={email} onChangeText={setEmail}
          placeholder="you@example.com" keyboardType="email-address" icon="mail-outline" />
        <Input label="Password" value={password} onChangeText={setPassword}
          placeholder="••••••••" secureTextEntry icon="lock-closed-outline" />

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <GradientButton title="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />

        {/* Demo accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Access</Text>
          <View style={styles.demoRow}>
            {['patient','doctor'].map(role => (
              <TouchableOpacity key={role} onPress={() => fillDemo(role)} style={styles.demoBtn}>
                <Text style={styles.demoBtnText}>{role === 'patient' ? '🧑‍⚕️ Patient' : '👨‍⚕️ Doctor'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.demoHint}>Tap to fill credentials, then Sign In</Text>
        </View>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: Colors.background },
  container:    { flexGrow: 1 },
  header:       { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  logoBox:      { width: 72, height: 72, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText:     { fontSize: 36, color: '#fff', fontWeight: '800' },
  brandName:    { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  brandSub:     { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  form:         { flex: 1, padding: 24, paddingTop: 28 },
  title:        { fontSize: Fonts.size.xl, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle:     { fontSize: Fonts.size.sm, color: Colors.textMuted, marginBottom: 24 },
  forgotRow:    { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotText:   { color: Colors.primary, fontSize: Fonts.size.sm, fontWeight: '600' },
  btn:          { marginBottom: 24 },
  demoSection:  { backgroundColor: Colors.primary100, borderRadius: Radius.xl, padding: 16, marginBottom: 24 },
  demoTitle:    { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.primary, marginBottom: 10 },
  demoRow:      { flexDirection: 'row', gap: 10, marginBottom: 8 },
  demoBtn:      { flex: 1, backgroundColor: '#fff', borderRadius: Radius.lg, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary },
  demoBtnText:  { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.primary },
  demoHint:     { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { color: Colors.textMuted, fontSize: Fonts.size.sm },
  registerLink: { color: Colors.primary, fontWeight: '700', fontSize: Fonts.size.sm },
});
