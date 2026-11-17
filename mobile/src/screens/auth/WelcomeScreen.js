import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius } from '../../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon:    '🏥',
    title:   'Your Health, Our Priority',
    desc:    'Book appointments with top doctors, manage prescriptions, and access your medical records — all in one place.',
    colors:  ['#0066CC', '#004d99'],
  },
  {
    icon:    '🚑',
    title:   'Emergency Support',
    desc:    'Get help instantly. One tap dispatches an ambulance and alerts the nearest hospital with your GPS location.',
    colors:  ['#EF4444', '#B91C1C'],
  },
  {
    icon:    '👨‍⚕️',
    title:   'Expert Doctors',
    desc:    'Connect with verified specialists for video consultations or in-person visits. Real-time chat included.',
    colors:  ['#00A86B', '#047857'],
  },
  {
    icon:    '📋',
    title:   'Smart Records',
    desc:    'Upload and access your lab reports, prescriptions, and discharge summaries securely from anywhere.',
    colors:  ['#8B5CF6', '#6D28D9'],
  },
];

export default function WelcomeScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  const next = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const skip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <LinearGradient colors={item.colors} style={styles.slide}>
            {/* Skip */}
            <TouchableOpacity onPress={skip} style={styles.skipBtn}>
              <Text style={styles.skipTxt}>Skip</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </LinearGradient>
        )}
      />

      {/* Bottom area */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
          ))}
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextTxt}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name={current === SLIDES.length - 1 ? 'checkmark-circle' : 'arrow-forward'} size={20} color="#fff" />
        </TouchableOpacity>

        {current === SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerBtn}>
            <Text style={styles.registerTxt}>Create new account →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.card },
  slide:       { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  skipBtn:     { position: 'absolute', top: 56, right: 24, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full },
  skipTxt:     { color: '#fff', fontWeight: '700', fontSize: Fonts.size.sm },
  iconBox:     { width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  icon:        { fontSize: 60 },
  title:       { fontSize: Fonts.size.xxxl, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 16, lineHeight: 36 },
  desc:        { fontSize: Fonts.size.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  bottom:      { backgroundColor: Colors.card, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 36, gap: 16 },
  dots:        { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive:   { width: 24, backgroundColor: Colors.primary },
  nextBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextTxt:     { color: '#fff', fontWeight: '800', fontSize: Fonts.size.md },
  registerBtn: { alignItems: 'center' },
  registerTxt: { color: Colors.primary, fontWeight: '700', fontSize: Fonts.size.sm },
});
