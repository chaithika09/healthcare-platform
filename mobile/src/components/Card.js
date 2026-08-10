import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../theme/colors';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: 16,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
