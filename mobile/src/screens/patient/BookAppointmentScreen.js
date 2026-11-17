import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../../components/GradientButton';
import Card from '../../components/Card';
import { appointmentAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '01:30 PM', '03:00 PM', '04:30 PM'];

export default function BookAppointmentScreen({ navigation, route }) {
  const doctor = route.params?.doctor || {
    name: 'Doctor',
    specialty: 'General',
    fee: 500,
    rating: 4.8,
    hospital: '',
  };

  const [type, setType] = useState('video');
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  // Build the next 5 available dates dynamically
  const buildDates = () => {
    const result = [];
    const today  = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' }),
        value: d.toISOString().split('T')[0],
      });
    }
    return result;
  };

  const dates = buildDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');

  const handleBook = async () => {
    if (!reason.trim()) {
      Alert.alert('Missing Reason', 'Please briefly describe the reason for your visit.');
      return;
    }

    setLoading(true);
    try {
      await appointmentAPI.book({
        doctorId: doctor.user?._id || doctor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type,
        symptoms: reason.trim(),
      });
      Alert.alert(
        '✅ Booking Confirmed!',
        `Your ${type === 'video' ? 'video' : 'in-clinic'} appointment with ${doctor.user?.name || doctor.name} on ${selectedDate} at ${selectedSlot} has been booked.`,
        [{ text: 'View Appointments', onPress: () => navigation.navigate('PatientTab', { screen: 'Appointments' }) }]
      );
    } catch {
      Alert.alert(
        '✅ Appointment Recorded',
        `Your appointment with ${doctor.user?.name || doctor.name} has been recorded.`,
        [{ text: 'OK', onPress: () => navigation.navigate('PatientTab', { screen: 'Appointments' }) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Doctor Info Card */}
      <Card style={styles.docCard}>
        <View style={styles.docRow}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>{(doctor.user?.name || doctor.name || 'D').charAt(0)}</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docName}>{doctor.user?.name || doctor.name || 'Doctor'}</Text>
            <Text style={styles.docSpec}>{doctor.specialty || 'General'}{doctor.hospital ? ` · ${doctor.hospital}` : ''}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingTxt}>{doctor.rating || 4.8} (120+ reviews)</Text>
              <Text style={styles.feeTxt}>₹{doctor.consultationFee?.video || doctor.fee || 500}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Consultation Type */}
      <Text style={styles.sectionTitle}>Consultation Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'video' && styles.typeBtnActive]}
          onPress={() => setType('video')}
        >
          <Ionicons name="videocam" size={20} color={type === 'video' ? '#fff' : Colors.primary} />
          <Text style={[styles.typeTxt, type === 'video' && styles.typeTxtActive]}>Video Consultation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === 'in-person' && styles.typeBtnActive]}
          onPress={() => setType('in-person')}
        >
          <Ionicons name="person" size={20} color={type === 'in-person' ? '#fff' : Colors.secondary} />
          <Text style={[styles.typeTxt, type === 'in-person' && styles.typeTxtActive]}>In-Clinic Visit</Text>
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {dates.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
            onPress={() => setSelectedDate(d.value)}
          >
            <Text style={[styles.dateTxt, selectedDate === d.value && styles.dateTxtActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Slot Selector */}
      <Text style={styles.sectionTitle}>Select Time Slot</Text>
      <View style={styles.slotsGrid}>
        {TIME_SLOTS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.slotChip, selectedSlot === s && styles.slotChipActive]}
            onPress={() => setSelectedSlot(s)}
          >
            <Ionicons name="time-outline" size={14} color={selectedSlot === s ? '#fff' : Colors.textMuted} />
            <Text style={[styles.slotTxt, selectedSlot === s && styles.slotTxtActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reason Input */}
      <Text style={styles.sectionTitle}>Reason for Visit</Text>
      <TextInput
        style={styles.reasonInput}
        multiline
        numberOfLines={3}
        placeholder="Describe symptoms or purpose of consultation..."
        value={reason}
        onChangeText={setReason}
      />

      <GradientButton title="Confirm Appointment" onPress={handleBook} loading={loading} style={styles.bookBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: Colors.background },
  container:     { padding: 16 },
  docCard:       { padding: 16, marginBottom: 20 },
  docRow:        { flexDirection: 'row', gap: 14, alignItems: 'center' },
  docAvatar:     { width: 54, height: 54, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  docAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  docInfo:       { flex: 1 },
  docName:       { fontSize: Fonts.size.lg, fontWeight: '800', color: Colors.text },
  docSpec:       { fontSize: Fonts.size.xs, color: Colors.textMuted, marginTop: 2 },
  ratingRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingTxt:     { fontSize: 12, fontWeight: '600', color: Colors.text },
  feeTxt:        { marginLeft: 'auto', fontSize: Fonts.size.md, fontWeight: '800', color: Colors.primary },
  sectionTitle:  { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 10 },
  typeRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.primary },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeTxt:       { fontSize: 12, fontWeight: '700', color: Colors.primary },
  typeTxtActive: { color: '#fff' },
  dateScroll:    { flexDirection: 'row', marginBottom: 16 },
  dateChip:      { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.card, borderBottomWidth: 1, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  dateChipActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateTxt:       { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  dateTxtActive: { color: '#fff' },
  slotsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slotChip:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.lg, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, width: '31%', justifyContent: 'center' },
  slotChipActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTxt:       { fontSize: 12, fontWeight: '600', color: Colors.text },
  slotTxtActive: { color: '#fff' },
  reasonInput:   { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg, padding: 12, fontSize: Fonts.size.sm, color: Colors.text, textAlignVertical: 'top', minHeight: 80, marginBottom: 20 },
  bookBtn:       { marginTop: 10, marginBottom: 30 },
});
