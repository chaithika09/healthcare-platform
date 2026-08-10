import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../theme/colors';

export default function GradientButton({ title, onPress, loading, style, textStyle, disabled, variant = 'primary' }) {
  const colors = variant === 'secondary'
    ? [Colors.secondary, '#00875A']
    : [Colors.primary, Colors.primary600];

  return (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[styles.wrapper, style]} activeOpacity={0.85}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.outline, style]} activeOpacity={0.7}>
      <Text style={[styles.outlineText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper:     { borderRadius: Radius.xl, overflow: 'hidden' },
  gradient:    { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  text:        { color: '#fff', fontSize: Fonts.size.md, fontWeight: '700', letterSpacing: 0.3 },
  outline:     { borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.primary, paddingVertical: 13, paddingHorizontal: 24, alignItems: 'center' },
  outlineText: { color: Colors.primary, fontSize: Fonts.size.md, fontWeight: '600' },
});
