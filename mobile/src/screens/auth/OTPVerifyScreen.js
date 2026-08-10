import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/GradientButton';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function OTPVerifyScreen({ navigation, route }) {
  const email = route.params?.email || 'user@example.com';
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    const otp = code.join('');
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter all 4 digits');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Verified', 'Your account has been verified!', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    }, 1000);
  };

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0066CC', '#00A86B']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
        <Text style={styles.headerSub}>Code sent to {email}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.instruction}>Enter 4-Digit Verification Code</Text>
        
        <View style={styles.otpRow}>
          {[0, 1, 2, 3].map((i) => (
            <TextInput
              key={i}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={code[i]}
              onChangeText={(val) => handleChange(val, i)}
            />
          ))}
        </View>

        <GradientButton title="Verify OTP" onPress={handleVerify} loading={loading} style={styles.btn} />

        <TouchableOpacity style={styles.resendBtn} onPress={() => Alert.alert('Sent', 'A new OTP has been sent to your email')}>
          <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendBold}>Resend Code</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  header:      { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  backBtn:     { position: 'absolute', top: 55, left: 20, zIndex: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  content:     { padding: 24, alignItems: 'center' },
  instruction: { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text, marginBottom: 24, marginTop: 10 },
  otpRow:      { flexDirection: 'row', gap: 14, marginBottom: 30 },
  otpBox:      { width: 56, height: 60, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.lg, textAlign: 'center', fontSize: 24, fontWeight: '800', color: Colors.text, backgroundColor: Colors.card },
  btn:         { width: '100%', marginBottom: 20 },
  resendBtn:   { padding: 10 },
  resendText:  { color: Colors.textMuted, fontSize: Fonts.size.sm },
  resendBold:  { color: Colors.primary, fontWeight: '700' },
});
