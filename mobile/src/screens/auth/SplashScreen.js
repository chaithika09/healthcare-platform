import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const { loadFromStorage, isAuthenticated, user } = useAuthStore();
  const scale = new Animated.Value(0.8);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const init = async () => {
      await loadFromStorage();
      setTimeout(() => {
        const store = useAuthStore.getState();
        if (store.isAuthenticated && store.user) {
          const map = { doctor: 'DoctorTab', admin: 'AdminTab', patient: 'PatientTab' };
          navigation.replace(map[store.user.role] || 'PatientTab');
        } else {
          navigation.replace('Welcome');
        }
      }, 2500);
    };
    init();
  }, []);

  return (
    <LinearGradient colors={['#003d7a', '#0066CC', '#005a3c']} style={styles.container}>
      {/* Background circles */}
      <View style={[styles.circle, { top: -60, right: -60, width: 200, height: 200 }]} />
      <View style={[styles.circle, { bottom: -40, left: -40, width: 160, height: 160, opacity: 0.15 }]} />

      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity }}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoPlus}>+</Text>
        </View>

        <Text style={styles.brandName}>
          Med<Text style={styles.brandGreen}>IQ</Text>+
        </Text>
        <Text style={styles.tagline}>Smart Healthcare Portal</Text>
        <Text style={styles.subtitle}>"Your Health, Our Priority"</Text>

        {/* Dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotGreen]} />
          ))}
        </View>
      </Animated.View>

      {/* Badges */}
      <View style={styles.badges}>
        {['🔒 Secure', '⚡ Fast', '🏥 Trusted'].map(b => (
          <Text key={b} style={styles.badge}>{b}</Text>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle:    { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999 },
  logoBox:   { width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  logoPlus:  { fontSize: 52, color: '#fff', fontWeight: '800' },
  brandName: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1, marginBottom: 6 },
  brandGreen:{ color: '#00E5A0' },
  tagline:   { fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: 32 },
  dots:      { flexDirection: 'row', gap: 8 },
  dot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotGreen:  { backgroundColor: '#00E5A0' },
  badges:    { position: 'absolute', bottom: 40, flexDirection: 'row', gap: 20 },
  badge:     { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
});
