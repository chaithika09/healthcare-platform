import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import { doctorAPI, appointmentAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const SLOT_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:00 PM'];

export default function DoctorProfileScreen({ route, navigation }) {
  const { doctorId, doctor: passedDoctor } = route.params || {};

  const [doctor,       setDoctor]       = useState(passedDoctor || null);
  const [loading,      setLoading]      = useState(!passedDoctor);
  const [activeTab,    setActiveTab]    = useState('about');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availSlots,   setAvailSlots]   = useState(SLOT_TIMES);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Build next 5 dates
  const buildDates = () => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        label: i === 0 ? 'Today'
          : i === 1 ? 'Tomorrow'
          : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: d.toISOString().split('T')[0],
      });
    }
    return result;
  };
  const dates = buildDates();

  useEffect(() => {
    if (selectedDate === '') setSelectedDate(dates[0].value);
  }, []);

  useEffect(() => {
    if (!passedDoctor && doctorId) {
      doctorAPI.getById(doctorId)
        .then(res => setDoctor(res.data?.data?.doctor || null))
        .catch(() => Alert.alert('Error', 'Could not load doctor profile'))
        .finally(() => setLoading(false));
    }
  }, [doctorId]);

  useEffect(() => {
    if (activeTab !== 'slots' || !selectedDate) return;
    setSlotsLoading(true);
    appointmentAPI.getSlots(doctorId || doctor?.user?._id, selectedDate)
      .then(res => setAvailSlots(res.data?.data?.available || SLOT_TIMES))
      .catch(() => setAvailSlots(SLOT_TIMES))
      .finally(() => setSlotsLoading(false));
  }, [activeTab, selectedDate]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textMuted }}>Doctor not found</Text>
      </View>
    );
  }

  const name       = doctor.user?.name || doctor.name || 'Doctor';
  const initials   = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const fee        = doctor.consultationFee?.video || doctor.consultationFee?.inPerson || doctor.fee || 500;
  const rating     = (doctor.averageRating || 0).toFixed(1);
  const experience = doctor.experience || 0;
  const hospital   = doctor.hospital || null;
  const bio        = doctor.bio || 'No biography provided.';
  const languages  = doctor.languages?.length ? doctor.languages.join(', ') : 'English';
  const education  = doctor.education || [];
  const specializations = [doctor.specialty, ...(doctor.subSpecialties || [])].filter(Boolean);

  const handleBook = () => {
    if (activeTab === 'slots' && (!selectedDate || !selectedSlot)) {
      Alert.alert('Select Slot', 'Please select a date and time slot first.');
      return;
    }
    navigation.navigate('BookAppointment', {
      doctorId: doctorId || doctor.user?._id,
      doctor,
      preselectedDate: selectedDate,
      preselectedSlot: selectedSlot,
    });
  };

  const TABS = ['about', 'slots', 'reviews'];

  return (
    <View style={styles.container}>
      {/* Header banner */}
      <LinearGradient colors={['#0066CC', '#00A86B']} style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>

          <View style={styles.bannerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#FCD34D" />
              <Text style={styles.metaTxt}>{rating}</Text>
            </View>
            <Text style={styles.metaDivider}>·</Text>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaTxt}>{experience}y exp</Text>
            </View>
            {hospital && (
              <>
                <Text style={styles.metaDivider}>·</Text>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metaTxt} numberOfLines={1}>{hospital}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Patients',    value: doctor.totalPatients || '—' },
          { label: 'Reviews',     value: doctor.totalReviews  || 0   },
          { label: 'Fee/session', value: `₹${fee}`                   },
        ].map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabTxt, activeTab === tab && styles.tabTxtActive]}>
              {tab === 'slots' ? 'Book Slot' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* ── ABOUT ── */}
        {activeTab === 'about' && (
          <>
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{bio}</Text>
            </Card>

            {education.length > 0 && (
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {education.map((e, i) => (
                  <View key={i} style={styles.eduRow}>
                    <Ionicons name="school-outline" size={16} color={Colors.primary} />
                    <Text style={styles.eduText}>{e.degree} — {e.institution}{e.year ? ` (${e.year})` : ''}</Text>
                  </View>
                ))}
              </Card>
            )}

            {specializations.length > 0 && (
              <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Specializations</Text>
                <View style={styles.tags}>
                  {specializations.map(s => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagTxt}>{s}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Consultation Info</Text>
              <InfoRow icon="cash-outline"    label="Fee per session" value={`₹${fee}`} />
              <InfoRow icon="language-outline" label="Languages"       value={languages} />
              {hospital && <InfoRow icon="business-outline" label="Hospital / Clinic" value={hospital} />}
              <View style={styles.typeRow}>
                {doctor.consultationTypes?.video    && <TypeBadge label="Video"     color={Colors.primary} bg={Colors.primary100} icon="videocam" />}
                {doctor.consultationTypes?.inPerson && <TypeBadge label="In-Person" color={Colors.secondary} bg={Colors.secondary100} icon="person" />}
              </View>
            </Card>
          </>
        )}

        {/* ── BOOK SLOT ── */}
        {activeTab === 'slots' && (
          <>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {dates.map(d => (
                  <TouchableOpacity
                    key={d.value}
                    onPress={() => { setSelectedDate(d.value); setSelectedSlot(''); }}
                    style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
                  >
                    <Text style={[styles.dateChipTxt, selectedDate === d.value && styles.dateChipTxtActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.sectionTitle}>Available Slots</Text>
            {slotsLoading ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={styles.slotsGrid}>
                {availSlots.map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSlot(s)}
                    style={[styles.slotChip, selectedSlot === s && styles.slotChipActive]}
                  >
                    <Ionicons name="time-outline" size={13} color={selectedSlot === s ? '#fff' : Colors.textMuted} />
                    <Text style={[styles.slotTxt, selectedSlot === s && styles.slotTxtActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <View style={styles.ratingSummary}>
            <Text style={styles.ratingBig}>{rating}</Text>
            <View style={styles.stars}>
              {[1,2,3,4,5].map(s => (
                <Ionicons key={s} name="star" size={18} color={s <= Math.round(parseFloat(rating)) ? '#FCD34D' : Colors.border} />
              ))}
            </View>
            <Text style={styles.reviewCount}>{doctor.totalReviews || 0} reviews</Text>
            <Text style={styles.reviewsHint}>Patient reviews will appear here</Text>
          </View>
        )}

      </ScrollView>

      {/* Book CTA */}
      <View style={styles.bookBar}>
        <View>
          <Text style={styles.bookFee}>₹{fee}</Text>
          <Text style={styles.bookFeeLabel}>per session</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.bookBtnTxt}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color={Colors.primary} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const TypeBadge = ({ label, color, bg, icon }) => (
  <View style={[styles.typeBadge, { backgroundColor: bg }]}>
    <Ionicons name={icon} size={12} color={color} />
    <Text style={[styles.typeBadgeTxt, { color }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner:          { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  bannerContent:   { alignItems: 'center', gap: 6 },
  avatar:          { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarTxt:       { color: '#fff', fontSize: 28, fontWeight: '900' },
  name:            { color: '#fff', fontSize: Fonts.size.xl, fontWeight: '800' },
  specialty:       { color: 'rgba(255,255,255,0.8)', fontSize: Fonts.size.sm, fontWeight: '600' },
  bannerMeta:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaItem:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt:         { color: 'rgba(255,255,255,0.9)', fontSize: Fonts.size.xs, fontWeight: '600' },
  metaDivider:     { color: 'rgba(255,255,255,0.4)', fontSize: Fonts.size.sm },
  statsRow:        { flexDirection: 'row', backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statItem:        { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  statValue:       { fontSize: Fonts.size.lg, fontWeight: '800', color: Colors.text },
  statLabel:       { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  tabs:            { flexDirection: 'row', backgroundColor: Colors.card, paddingHorizontal: 16, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:             { flex: 1, paddingVertical: 8, borderRadius: Radius.full, alignItems: 'center', backgroundColor: Colors.background },
  tabActive:       { backgroundColor: Colors.primary },
  tabTxt:          { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  tabTxtActive:    { color: '#fff' },
  body:            { flex: 1 },
  section:         { padding: 16, marginBottom: 12 },
  sectionTitle:    { fontSize: Fonts.size.sm, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  bioText:         { fontSize: Fonts.size.sm, color: Colors.textMuted, lineHeight: 20 },
  eduRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  eduText:         { fontSize: Fonts.size.sm, color: Colors.text, flex: 1 },
  tags:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:             { backgroundColor: Colors.primary100, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  tagTxt:          { color: Colors.primary, fontSize: Fonts.size.xs, fontWeight: '700' },
  infoRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel:       { fontSize: Fonts.size.xs, color: Colors.textMuted, width: 110 },
  infoValue:       { fontSize: Fonts.size.sm, color: Colors.text, fontWeight: '600', flex: 1 },
  typeRow:         { flexDirection: 'row', gap: 8, paddingTop: 10 },
  typeBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  typeBadgeTxt:    { fontSize: 12, fontWeight: '700' },
  dateChip:        { paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
  dateChipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateChipTxt:     { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  dateChipTxtActive:{ color: '#fff' },
  slotsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.lg, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, width: '31%', justifyContent: 'center' },
  slotChipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTxt:         { fontSize: 11, fontWeight: '600', color: Colors.text },
  slotTxtActive:   { color: '#fff' },
  ratingSummary:   { alignItems: 'center', paddingTop: 32, gap: 8 },
  ratingBig:       { fontSize: 56, fontWeight: '900', color: Colors.text },
  stars:           { flexDirection: 'row', gap: 4 },
  reviewCount:     { fontSize: Fonts.size.sm, color: Colors.textMuted },
  reviewsHint:     { fontSize: Fonts.size.xs, color: Colors.textFaint, marginTop: 8 },
  bookBar:         { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  bookFee:         { fontSize: Fonts.size.xl, fontWeight: '900', color: Colors.text },
  bookFeeLabel:    { fontSize: 11, color: Colors.textMuted },
  bookBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 13, paddingHorizontal: 24, borderRadius: Radius.xl },
  bookBtnTxt:      { color: '#fff', fontWeight: '800', fontSize: Fonts.size.sm },
});
