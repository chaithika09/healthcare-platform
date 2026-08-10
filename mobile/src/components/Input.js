import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Radius } from '../theme/colors';

export default function Input({ label, error, secureTextEntry, icon, style, ...props }) {
  const [showPass, setShowPass] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={Colors.textFaint} style={styles.icon} />}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 0 }]}
          placeholderTextColor={Colors.textFaint}
          secureTextEntry={isPassword && !showPass}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { marginBottom: 16 },
  label:      { fontSize: Fonts.size.sm, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14, height: 50 },
  inputError: { borderColor: Colors.error },
  icon:       { marginRight: 8 },
  input:      { flex: 1, fontSize: Fonts.size.md, color: Colors.text, height: '100%' },
  eyeBtn:     { padding: 4 },
  error:      { color: Colors.error, fontSize: Fonts.size.xs, marginTop: 4 },
});
