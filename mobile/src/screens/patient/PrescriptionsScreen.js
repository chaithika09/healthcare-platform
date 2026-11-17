import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Share, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { prescriptionAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filter, setFilter]               = useState('all');
  const [selected, setSelected]           = useState(null);

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(res => setPrescriptions(res.data?.data?.prescriptions || []))
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = prescriptions.filter((p) => {
    const docName = p.doctor?.user?.name || p.doctor?.name || p.doctorName || '';
    const matchSearch = docName.toLowerCase().includes(search.toLowerCase()) ||
      p.medicines?.some(m => m.name?.toLowerCase().includes(search.toLowerCase()));
    const isActive   = !p.expiryDate || new Date(p.expiryDate) >= new Date();
    const matchFilter = filter === 'all' || (filter === 'active' ? isActive : !isActive);
    return matchSearch && matchFilter;
  });

  const handleExport = async (p) => {
    const docName = p.doctor?.user?.name || p.doctor?.name || p.doctorName || 'Doctor';
    const summary = `
MEDIQ OFFICIAL PRESCRIPTION
----------------------------
Doctor: ${docName}
Date Issued: ${new Date(p.createdAt).toLocaleDateString()}
Diagnosis: ${p.diagnosis || 'N/A'}

MEDICATIONS:
${(p.medicines || []).map((m, i) =>
  `${i + 1}. ${m.name} (${m.dose || ''})\n   ${m.frequency || ''} | ${m.duration || ''}\n   ${m.instructions || ''}`
).join('\n\n')}

DOCTOR'S NOTES:
${p.notes || 'None'}
    `.trim();

    try {
      await Share.share({ title: `Prescription_${docName}`, message: summary });
    } catch {
      Alert.alert('Prescription', summary);
    }
  };

  const renderItem = ({ item }) => {
    const docName  = item.doctor?.user?.name || item.doctor?.name || item.doctorName || 'Doctor';
    const isActive = !item.expiryDate || new Date(item.expiryDate) >= new Date();
    return (
      <Card style={styles.card}>
        <TouchableOpacity onPress={() => setSelected(item)}>
          <View style={styles.cardTop}>
            <View style={styles.rxIcon}>
              <Ionicons name="medical" size={20} color={Colors.primary} />
            </View>
            <View style={styles.rxInfo}>
              <Text style={styles.docName}>{docName}</Text>
              <Text style={styles.specTxt}>
                {item.diagnosis || 'General'} · {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.activeBadge : styles.expiredBadge]}>
              <Text style={[styles.statusTxt, isActive ? styles.activeTxt : styles.expiredTxt]}>
                {isActive ? 'ACTIVE' : 'EXPIRED'}
              </Text>
            </View>
          </View>

          <View style={styles.medsSummary}>
            <Ionicons name="bandage-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.medsCountText} numberOfLines={1}>
              {item.medicines?.length || 0} Medication(s):{' '}
              {(item.medicines || []).map(m => m.name).join(', ')}
            </Text>
          </View>

          <Text style={styles.viewDetailLink}>Tap to view details →</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by doctor or medicine..."
            placeholderTextColor={Colors.textFaint}
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
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medical-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No prescriptions found</Text>
            <Text style={styles.emptyHint}>Prescriptions will appear here after a doctor consultation</Text>
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

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.docBanner}>
                  <Text style={styles.docBannerName}>
                    {selected.doctor?.user?.name || selected.doctor?.name || selected.doctorName || 'Doctor'}
                  </Text>
                  <Text style={styles.docBannerSpec}>
                    {selected.diagnosis || 'General'} · {new Date(selected.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.subTitle}>Prescribed Medications</Text>
                <View style={styles.medsList}>
                  {(selected.medicines || []).map((m, i) => (
                    <View key={i} style={styles.medItem}>
                      <View style={styles.medHeader}>
                        <Text style={styles.medName}>{m.name}</Text>
                        {m.dose ? <Text style={styles.medDose}>{m.dose}</Text> : null}
                      </View>
                      {m.frequency || m.duration ? (
                        <Text style={styles.medDetail}>
                          {m.frequency ? `${m.frequency}` : ''}{m.duration ? ` · ${m.duration}` : ''}
                        </Text>
                      ) : null}
                      {m.instructions ? (
                        <Text style={styles.medInstruct}>{m.instructions}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>

                {selected.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Doctor's Notes:</Text>
                    <Text style={styles.notesText}>{selected.notes}</Text>
                  </View>
                ) : null}

                {selected.followUpDate ? (
                  <View style={styles.followUp}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                    <Text style={styles.followUpTxt}>
                      Follow-up: {new Date(selected.followUpDate).toLocaleDateString()}
                    </Text>
                  </View>
                ) : null}
              </ScrollView>

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
  container:           { flex: 1, backgroundColor: Colors.background },
  center:              { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:              { padding: 16, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchBox:           { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background, borderRadius: Radius.lg, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchInput:         { flex: 1, height: 42, fontSize: Fonts.size.sm, color: Colors.text },
  filterRow:           { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: Colors.card },
  filterChip:          { paddingHorizontal: 16, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  filterChipActive:    { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt:           { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  filterTxtActive:     { color: '#fff' },
  list:                { padding: 16, gap: 12, paddingBottom: 40 },
  card:                { padding: 16 },
  cardTop:             { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rxIcon:              { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primary100, alignItems: 'center', justifyContent: 'center' },
  rxInfo:              { flex: 1 },
  docName:             { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text },
  specTxt:             { fontSize: Fonts.size.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge:         { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  activeBadge:         { backgroundColor: '#D1FAE5' },
  expiredBadge:        { backgroundColor: '#F3F4F6' },
  statusTxt:           { fontSize: 10, fontWeight: '800' },
  activeTxt:           { color: '#065F46' },
  expiredTxt:          { color: '#6B7280' },
  medsSummary:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  medsCountText:       { fontSize: Fonts.size.xs, color: Colors.textMuted, flex: 1 },
  viewDetailLink:      { fontSize: Fonts.size.xs, color: Colors.primary, fontWeight: '700', marginTop: 8 },
  empty:               { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt:            { color: Colors.text, fontSize: Fonts.size.md, fontWeight: '700' },
  emptyHint:           { color: Colors.textMuted, fontSize: Fonts.size.xs, textAlign: 'center', paddingHorizontal: 30 },
  // Modal
  modalBg:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:           { backgroundColor: Colors.card, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '88%' },
  modalHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalHeaderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalHeaderTitle:    { fontSize: Fonts.size.lg, fontWeight: '800', color: Colors.text },
  docBanner:           { backgroundColor: Colors.primary100, padding: 12, borderRadius: Radius.lg, marginBottom: 14 },
  docBannerName:       { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.primary600 },
  docBannerSpec:       { fontSize: Fonts.size.xs, color: Colors.primary, marginTop: 2 },
  subTitle:            { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  medsList:            { gap: 8, marginBottom: 14 },
  medItem:             { backgroundColor: Colors.primary100, padding: 12, borderRadius: Radius.lg },
  medHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  medName:             { fontSize: Fonts.size.sm, fontWeight: '800', color: Colors.text },
  medDose:             { fontSize: 11, fontWeight: '700', color: Colors.primary, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  medDetail:           { fontSize: Fonts.size.xs, color: Colors.text, fontWeight: '500' },
  medInstruct:         { fontSize: Fonts.size.xs, color: Colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  notesBox:            { backgroundColor: '#FEF3C7', padding: 12, borderRadius: Radius.lg, marginBottom: 12 },
  notesTitle:          { fontSize: Fonts.size.xs, fontWeight: '700', color: '#92400E' },
  notesText:           { fontSize: Fonts.size.xs, color: '#78350F', marginTop: 2 },
  followUp:            { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary100, padding: 10, borderRadius: Radius.lg, marginBottom: 16 },
  followUpTxt:         { fontSize: Fonts.size.sm, color: Colors.primary, fontWeight: '600' },
  exportBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl, marginTop: 8 },
  exportTxt:           { color: '#fff', fontWeight: '700', fontSize: Fonts.size.sm },
});
