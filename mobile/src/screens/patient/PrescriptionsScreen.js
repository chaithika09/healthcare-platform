import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { Colors, Fonts, Radius } from '../../theme/colors';

const samplePrescriptions = [
  {
    id: '1',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    date: '2024-06-15',
    status: 'active',
    medicines: [
      { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take with food' },
      { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
    ],
    notes: 'Monitor blood pressure daily. Return for follow-up in 4 weeks.',
  },
  {
    id: '2',
    doctor: 'Dr. Emily Davis',
    specialty: 'Dermatologist',
    date: '2024-06-01',
    status: 'active',
    medicines: [
      { name: 'Clindamycin Gel', dose: '1%', frequency: 'Twice daily', duration: '60 days', instructions: 'Apply to affected area' },
    ],
    notes: 'Avoid direct sun exposure. Use sunscreen SPF 50+.',
  },
  {
    id: '3',
    doctor: 'Dr. James Wilson',
    specialty: 'Pediatrician',
    date: '2024-05-10',
    status: 'expired',
    medicines: [
      { name: 'Amoxicillin', dose: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Complete full course' },
    ],
    notes: 'Complete the full antibiotic course even if feeling better.',
  },
];

export default function PrescriptionsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = samplePrescriptions.filter((p) => {
    const matchSearch = p.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleExport = async (p) => {
    const summary = `
MEDIQ+ OFFICIAL PRESCRIPTION REPORT
-----------------------------------
Doctor: ${p.doctor} (${p.specialty})
Date Issued: ${p.date}
Status: ${p.status.toUpperCase()}

MEDICATIONS:
${p.medicines.map((m, i) => `${i + 1}. ${m.name} (${m.dose})\n   Dosage: ${m.frequency} | Duration: ${m.duration}\n   Instructions: ${m.instructions}`).join('\n\n')}

DOCTOR'S NOTES:
${p.notes || 'None'}
    `.trim();

    try {
      await Share.share({ title: `Prescription_${p.doctor}`, message: summary });
    } catch {
      Alert.alert('Prescription Export', summary);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => setSelected(item)}>
        <View style={styles.cardTop}>
          <View style={styles.rxIcon}>
            <Ionicons name="medical" size={20} color={Colors.primary} />
          </View>
          <View style={styles.rxInfo}>
            <Text style={styles.docName}>{item.doctor}</Text>
            <Text style={styles.specTxt}>{item.specialty} · {item.date}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'active' ? styles.activeBadge : styles.expiredBadge]}>
            <Text style={[styles.statusTxt, item.status === 'active' ? styles.activeTxt : styles.expiredTxt]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.medsSummary}>
          <Ionicons name="bandage-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.medsCountText}>
            {item.medicines.length} Medication(s): {item.medicines.map((m) => m.name).join(', ')}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailLink}>Tap to view prescription details →</Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header Search & Filter */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by doctor or medicine..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'active', 'expired'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medical-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No prescriptions found</Text>
          </View>
        }
      />

      {/* Prescription Detail Modal */}
      {selected && (
        <Modal transparent animationType="slide" visible={!!selected} onRequestClose={() => setSelected(null)}>
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <Ionicons name="medical-sharp" size={22} color={Colors.primary} />
                  <Text style={styles.modalHeaderTitle}>Prescription Details</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Ionicons name="close" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.docBanner}>
                <Text style={styles.docBannerName}>{selected.doctor}</Text>
                <Text style={styles.docBannerSpec}>{selected.specialty} · Issued on {selected.date}</Text>
              </View>

              <Text style={styles.subTitle}>Prescribed Medications</Text>
              <View style={styles.medsList}>
                {selected.medicines.map((m, i) => (
                  <View key={i} style={styles.medItem}>
                    <View style={styles.medHeader}>
                      <Text style={styles.medName}>{m.name}</Text>
                      <Text style={styles.medDose}>{m.dose}</Text>
                    </View>
                    <Text style={styles.medDetail}>Frequency: {m.frequency} · Duration: {m.duration}</Text>
                    <Text style={styles.medInstruct}>Instructions: {m.instructions}</Text>
                  </View>
                ))}
              </View>

              {selected.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Doctor's Instructions:</Text>
                  <Text style={styles.notesText}>{selected.notes}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport(selected)}>
                <Ionicons name="share-outline" size={18} color="#fff" />
                <Text style={styles.exportTxt}>Share / Export Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Colors.background },
  header:           { padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBox:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: Radius.lg, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchInput:      { flex: 1, height: 42, fontSize: Fonts.size.sm, color: Colors.text },
  filterRow:        { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: Colors.card },
  filterChip:       { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt:        { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  filterTxtActive:  { color: '#fff' },
  list:             { padding: 16, gap: 12 },
  card:             { padding: 16 },
  cardTop:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rxIcon:           { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primary100, alignItems: 'center', justifyContent: 'center' },
  rxInfo:           { flex: 1 },
  docName:          { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text },
  specTxt:          { fontSize: Fonts.size.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  activeBadge:      { backgroundColor: '#D1FAE5' },
  expiredBadge:     { backgroundColor: '#F3F4F6' },
  statusTxt:        { fontSize: 10, fontWeight: '800' },
  activeTxt:        { color: '#065F46' },
  expiredTxt:       { color: '#6B7280' },
  medsSummary:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  medsCountText:    { fontSize: Fonts.size.xs, color: Colors.textMuted, flex: 1 },
  cardFooter:       { marginTop: 8 },
  viewDetailLink:   { fontSize: Fonts.size.xs, color: Colors.primary, fontWeight: '700' },
  empty:            { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt:         { color: Colors.textMuted, fontSize: Fonts.size.sm },
  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:        { backgroundColor: Colors.card, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '85%' },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalHeaderTitle: { fontSize: Fonts.size.lg, fontWeight: '800', color: Colors.text },
  docBanner:        { backgroundColor: Colors.background, padding: 12, borderRadius: Radius.lg, marginBottom: 14 },
  docBannerName:    { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text },
  docBannerSpec:    { fontSize: Fonts.size.xs, color: Colors.textMuted, marginTop: 2 },
  subTitle:         { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  medsList:         { gap: 8, marginBottom: 14 },
  medItem:          { backgroundColor: Colors.primary100, padding: 12, borderRadius: Radius.lg },
  medHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  medName:          { fontSize: Fonts.size.sm, fontWeight: '800', color: Colors.text },
  medDose:          { fontSize: 11, fontWeight: '700', color: Colors.primary, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  medDetail:        { fontSize: Fonts.size.xs, color: Colors.text, fontWeight: '500' },
  medInstruct:      { fontSize: Fonts.size.xs, color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  notesBox:         { backgroundColor: '#FEF3C7', padding: 12, borderRadius: Radius.lg, marginBottom: 16 },
  notesTitle:       { fontSize: Fonts.size.xs, fontWeight: '700', color: '#92400E' },
  notesText:        { fontSize: Fonts.size.xs, color: '#78350F', marginTop: 2 },
  exportBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl },
  exportTxt:        { color: '#fff', fontWeight: '700', fontSize: Fonts.size.sm },
});
