import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { doctorAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Every 8 hours'];
const DURATIONS   = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', 'Ongoing'];

export default function WritePrescriptionScreen({ route, navigation }) {
  const { patient } = route.params || {};

  const [diagnosis, setDiagnosis]   = useState('');
  const [notes, setNotes]           = useState('');
  const [followUp, setFollowUp]     = useState('');
  const [medicines, setMedicines]   = useState([emptyMed()]);
  const [loading, setLoading]       = useState(false);

  function emptyMed() {
    return { name:'', dose:'', frequency: FREQUENCIES[0], duration: DURATIONS[2], instructions:'' };
  }

  const addMedicine = () => setMedicines([...medicines, emptyMed()]);

  const removeMedicine = (i) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, idx) => idx !== i));
  };

  const updateMedicine = (i, field, val) => {
    setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const handleSubmit = async () => {
    if (!diagnosis.trim()) { Alert.alert('Required', 'Please enter a diagnosis.'); return; }
    if (medicines.some(m => !m.name.trim())) { Alert.alert('Required', 'Please enter a name for each medicine.'); return; }

    setLoading(true);
    try {
      const payload = {
        patientId:  patient?._id,
        patientName: patient?.name,
        diagnosis,
        medicines,
        notes,
        followUpDate: followUp || null,
      };
      await doctorAPI.createPrescription(payload);
      Alert.alert(
        '✅ Prescription Created',
        `Prescription for ${patient?.name || 'patient'} has been saved successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write Prescription</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Patient Info Banner */}
          {patient && (
            <View style={styles.patientBanner}>
              <View style={styles.bannerAvatar}>
                <Text style={styles.bannerAvatarTxt}>{(patient.name || 'P').charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.bannerName}>{patient.name}</Text>
                <Text style={styles.bannerSub}>
                  {patient.age ? `${patient.age} yrs` : ''}
                  {patient.gender ? ` · ${patient.gender}` : ''}
                  {patient.email ? `  ${patient.email}` : ''}
                </Text>
              </View>
            </View>
          )}

          {/* Diagnosis */}
          <Text style={styles.label}>Diagnosis <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hypertension, Type 2 Diabetes…"
            placeholderTextColor={Colors.textFaint}
            value={diagnosis}
            onChangeText={setDiagnosis}
            multiline
            numberOfLines={2}
          />

          {/* Medicines */}
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Medicines <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity onPress={addMedicine} style={styles.addBtn}>
              <Ionicons name="add" size={16} color={Colors.primary} />
              <Text style={styles.addBtnTxt}>Add</Text>
            </TouchableOpacity>
          </View>

          {medicines.map((med, i) => (
            <Card key={i} style={styles.medCard}>
              <View style={styles.medHeader}>
                <Text style={styles.medIndex}>Medicine {i + 1}</Text>
                {medicines.length > 1 && (
                  <TouchableOpacity onPress={() => removeMedicine(i)}>
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Medicine name *"
                placeholderTextColor={Colors.textFaint}
                value={med.name}
                onChangeText={v => updateMedicine(i, 'name', v)}
              />
              <TextInput
                style={styles.input}
                placeholder="Dose (e.g. 500mg)"
                placeholderTextColor={Colors.textFaint}
                value={med.dose}
                onChangeText={v => updateMedicine(i, 'dose', v)}
              />

              {/* Frequency picker */}
              <Text style={styles.subLabel}>Frequency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
                <View style={{ flexDirection:'row', gap:8 }}>
                  {FREQUENCIES.map(f => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => updateMedicine(i, 'frequency', f)}
                      style={[styles.chip, med.frequency === f && styles.chipActive]}
                    >
                      <Text style={[styles.chipTxt, med.frequency === f && styles.chipTxtActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Duration picker */}
              <Text style={styles.subLabel}>Duration</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
                <View style={{ flexDirection:'row', gap:8 }}>
                  {DURATIONS.map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => updateMedicine(i, 'duration', d)}
                      style={[styles.chip, med.duration === d && styles.chipActive]}
                    >
                      <Text style={[styles.chipTxt, med.duration === d && styles.chipTxtActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                style={styles.input}
                placeholder="Special instructions (optional)"
                placeholderTextColor={Colors.textFaint}
                value={med.instructions}
                onChangeText={v => updateMedicine(i, 'instructions', v)}
              />
            </Card>
          ))}

          {/* Doctor Notes */}
          <Text style={styles.label}>Doctor's Notes</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Additional observations, lifestyle advice…"
            placeholderTextColor={Colors.textFaint}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Follow-up */}
          <Text style={styles.label}>Follow-up Date</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2026-12-01"
            placeholderTextColor={Colors.textFaint}
            value={followUp}
            onChangeText={setFollowUp}
          />

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitTxt}>Create Prescription</Text>
                </>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, backgroundColor:Colors.background },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:16, backgroundColor:Colors.card, borderBottomWidth:1, borderBottomColor:Colors.border },
  backBtn:        { width:40, height:40, alignItems:'center', justifyContent:'center' },
  headerTitle:    { fontSize:Fonts.size.lg, fontWeight:'700', color:Colors.text },
  body:           { padding:16, paddingBottom:40 },
  patientBanner:  { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:Colors.primary100, borderRadius:Radius.xl, padding:14, marginBottom:20, borderWidth:1, borderColor:Colors.primary+'40' },
  bannerAvatar:   { width:46, height:46, borderRadius:14, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  bannerAvatarTxt:{ color:'#fff', fontWeight:'800', fontSize:18 },
  bannerName:     { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.primary600 },
  bannerSub:      { fontSize:Fonts.size.xs, color:Colors.primary, marginTop:2 },
  label:          { fontSize:Fonts.size.sm, fontWeight:'700', color:Colors.text, marginBottom:8 },
  required:       { color:Colors.error },
  subLabel:       { fontSize:Fonts.size.xs, fontWeight:'600', color:Colors.textMuted, marginBottom:6 },
  input:          { backgroundColor:Colors.card, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border, paddingHorizontal:14, paddingVertical:12, fontSize:Fonts.size.sm, color:Colors.text, marginBottom:12 },
  sectionHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  addBtn:         { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:Colors.primary100, borderRadius:Radius.full, paddingHorizontal:12, paddingVertical:5 },
  addBtnTxt:      { fontSize:Fonts.size.xs, fontWeight:'700', color:Colors.primary },
  medCard:        { padding:14, marginBottom:12 },
  medHeader:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  medIndex:       { fontSize:Fonts.size.sm, fontWeight:'700', color:Colors.text },
  chip:           { paddingHorizontal:12, paddingVertical:6, borderRadius:Radius.full, backgroundColor:Colors.card, borderWidth:1, borderColor:Colors.border },
  chipActive:     { backgroundColor:Colors.primary, borderColor:Colors.primary },
  chipTxt:        { fontSize:11, fontWeight:'600', color:Colors.textMuted },
  chipTxtActive:  { color:'#fff' },
  submitBtn:      { backgroundColor:Colors.primary, borderRadius:Radius.xl, paddingVertical:16, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginTop:8 },
  submitTxt:      { color:'#fff', fontWeight:'700', fontSize:Fonts.size.md },
});
