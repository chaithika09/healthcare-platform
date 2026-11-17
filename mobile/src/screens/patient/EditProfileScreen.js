import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { patientAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name:        user?.name         || '',
    phone:       user?.phone        || '',
    age:         user?.age          ? String(user.age) : '',
    gender:      user?.gender       || '',
    bloodGroup:  user?.bloodGroup   || '',
    address:     user?.address      || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Name cannot be empty.'); return; }
    setLoading(true);
    try {
      const payload = {
        name:       form.name.trim(),
        phone:      form.phone.trim(),
        age:        form.age ? parseInt(form.age) : undefined,
        gender:     form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        address:    form.address.trim() || undefined,
      };
      const res = await patientAPI.update(payload);
      setUser({ ...user, ...res.data?.data?.patient, name: form.name.trim() });
      Alert.alert('Success', 'Profile updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{(form.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.avatarHint}>Tap to change photo (coming soon)</Text>
          </View>

          {/* Fields */}
          <FieldGroup label="Full Name" required>
            <TextInput style={styles.input} value={form.name} onChangeText={v => update('name', v)}
              placeholder="Your full name" placeholderTextColor={Colors.textFaint} />
          </FieldGroup>

          <FieldGroup label="Phone Number">
            <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)}
              placeholder="+91 9876543210" placeholderTextColor={Colors.textFaint}
              keyboardType="phone-pad" />
          </FieldGroup>

          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <FieldGroup label="Age">
                <TextInput style={styles.input} value={form.age} onChangeText={v => update('age', v)}
                  placeholder="25" placeholderTextColor={Colors.textFaint}
                  keyboardType="numeric" maxLength={3} />
              </FieldGroup>
            </View>
            <View style={{ flex: 1 }}>
              <FieldGroup label="Gender">
                <View style={styles.genderRow}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => update('gender', g.toLowerCase())}
                      style={[styles.genderBtn, form.gender === g.toLowerCase() && styles.genderBtnActive]}
                    >
                      <Text style={[styles.genderTxt, form.gender === g.toLowerCase() && styles.genderTxtActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FieldGroup>
            </View>
          </View>

          <FieldGroup label="Blood Group">
            <View style={styles.bloodRow}>
              {BLOOD_GROUPS.map(bg => (
                <TouchableOpacity
                  key={bg}
                  onPress={() => update('bloodGroup', bg)}
                  style={[styles.bgChip, form.bloodGroup === bg && styles.bgChipActive]}
                >
                  <Text style={[styles.bgTxt, form.bloodGroup === bg && styles.bgTxtActive]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FieldGroup>

          <FieldGroup label="Address">
            <TextInput style={[styles.input, { height: 72 }]}
              value={form.address} onChangeText={v => update('address', v)}
              placeholder="Your address" placeholderTextColor={Colors.textFaint}
              multiline />
          </FieldGroup>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveTxt}>Save Changes</Text>
                </>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const FieldGroup = ({ label, required, children }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}{required && <Text style={{ color: Colors.error }}> *</Text>}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: Fonts.size.lg, fontWeight: '700', color: Colors.text },
  body:         { padding: 16, paddingBottom: 40 },
  avatarSection:{ alignItems: 'center', paddingVertical: 20, gap: 8 },
  avatar:       { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:    { color: '#fff', fontSize: 32, fontWeight: '900' },
  avatarHint:   { fontSize: Fonts.size.xs, color: Colors.textFaint },
  fieldGroup:   { marginBottom: 16 },
  label:        { fontSize: Fonts.size.xs, fontWeight: '700', color: Colors.text, marginBottom: 7 },
  input:        { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: Fonts.size.sm, color: Colors.text },
  row2:         { flexDirection: 'row', gap: 12 },
  genderRow:    { flexDirection: 'row', gap: 6 },
  genderBtn:    { flex: 1, paddingVertical: 10, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  genderTxt:    { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  genderTxtActive: { color: '#fff' },
  bloodRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bgChip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
  bgChipActive: { backgroundColor: Colors.error, borderColor: Colors.error },
  bgTxt:        { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  bgTxtActive:  { color: '#fff' },
  saveBtn:      { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveTxt:      { color: '#fff', fontWeight: '700', fontSize: Fonts.size.md },
});
