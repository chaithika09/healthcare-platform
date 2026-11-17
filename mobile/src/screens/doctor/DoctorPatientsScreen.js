import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { doctorAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function DoctorPatientsScreen({ navigation }) {
  const [patients, setPatients]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [search, setSearch]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selected, setSelected]           = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const buildPatients = (appointments) => {
    const map = {};
    appointments.forEach(apt => {
      const p = apt.patient;
      if (!p?._id) return;
      if (!map[p._id]) {
        map[p._id] = {
          _id:          p._id,
          name:         p.name,
          email:        p.email,
          phone:        p.phone,
          age:          p.age,
          gender:       p.gender,
          visits:       [],
          totalVisits:  0,
          lastVisit:    null,
          lastCondition: null,
        };
      }
      map[p._id].visits.push({
        date:    apt.date,
        reason:  apt.symptoms || apt.reason || 'General consultation',
        status:  apt.status,
        timeSlot: apt.timeSlot,
      });
      map[p._id].totalVisits++;
      if (!map[p._id].lastVisit || new Date(apt.date) > new Date(map[p._id].lastVisit)) {
        map[p._id].lastVisit      = apt.date;
        map[p._id].lastCondition  = apt.symptoms || apt.reason || 'General consultation';
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
  };

  const load = useCallback(async () => {
    try {
      const res  = await doctorAPI.getAppointments();
      const apts = res.data?.data?.appointments || [];
      const list = buildPatients(apts);
      setPatients(list);
      setFiltered(list);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (q) => {
    setSearch(q);
    if (!q.trim()) { setFiltered(patients); return; }
    const lower = q.toLowerCase();
    setFiltered(patients.filter(p =>
      p.name?.toLowerCase().includes(lower) ||
      p.lastCondition?.toLowerCase().includes(lower) ||
      p.email?.toLowerCase().includes(lower)
    ));
  };

  const openDetail = (p) => {
    setSelected(p);
    setDetailVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openDetail(item)} activeOpacity={0.85}>
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(item.name || 'P').charAt(0)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.patientName}>{item.name}</Text>
            <Text style={styles.patientMeta}>
              {item.age ? `${item.age}y` : '—'}{item.gender ? ` · ${item.gender}` : ''}
            </Text>
            {item.lastCondition ? (
              <Text style={styles.condition} numberOfLines={1}>💬 {item.lastCondition}</Text>
            ) : null}
          </View>
          <View style={styles.cardRight}>
            <View style={styles.visitBadge}>
              <Text style={styles.visitCount}>{item.totalVisits}</Text>
              <Text style={styles.visitLabel}>visit{item.totalVisits !== 1 ? 's' : ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients…"
          placeholderTextColor={Colors.textFaint}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <Text style={styles.countTxt}>{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>
              {search ? 'No patients match your search' : 'No patients yet'}
            </Text>
            {!search && (
              <Text style={styles.emptyHint}>Patients appear here after they book an appointment</Text>
            )}
          </View>
        )}
      />

      {/* Patient Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modal}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.closeBtn}>
              <Ionicons name="chevron-down" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Patient Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selected && (
            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Avatar + Name */}
              <View style={styles.profileSection}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarTxt}>{(selected.name || 'P').charAt(0)}</Text>
                </View>
                <Text style={styles.profileName}>{selected.name}</Text>
                <Text style={styles.profileSub}>{selected.age ? `${selected.age} years` : ''}{selected.gender ? ` · ${selected.gender}` : ''}</Text>
              </View>

              {/* Info Cards */}
              <View style={styles.infoGrid}>
                <InfoItem icon="call-outline" label="Phone" value={selected.phone || 'N/A'} />
                <InfoItem icon="mail-outline" label="Email" value={selected.email || 'N/A'} />
                <InfoItem icon="calendar-outline" label="Last Visit" value={selected.lastVisit ? new Date(selected.lastVisit).toLocaleDateString() : 'N/A'} />
                <InfoItem icon="medical-outline" label="Total Visits" value={String(selected.totalVisits)} />
              </View>

              {/* Last Condition */}
              {selected.lastCondition && (
                <Card style={styles.conditionCard}>
                  <Text style={styles.conditionLabel}>Last Condition</Text>
                  <Text style={styles.conditionValue}>{selected.lastCondition}</Text>
                </Card>
              )}

              {/* Visit History */}
              <Text style={styles.historyTitle}>Recent Visit History</Text>
              {selected.visits
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((v, i) => (
                  <Card key={i} style={styles.visitCard}>
                    <View style={styles.visitRow}>
                      <View style={styles.visitDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.visitDate}>{new Date(v.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</Text>
                        <Text style={styles.visitReason} numberOfLines={2}>{v.reason}</Text>
                      </View>
                      <View style={[styles.visitStatus, { backgroundColor: v.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }]}>
                        <Text style={[styles.visitStatusTxt, { color: v.status === 'completed' ? '#059669' : '#D97706' }]}>
                          {v.status}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.prescribeBtn}
                  onPress={() => {
                    setDetailVisible(false);
                    navigation.navigate('WritePrescription', { patient: selected });
                  }}
                >
                  <Ionicons name="document-text" size={18} color="#fff" />
                  <Text style={styles.prescribeTxt}>Write Prescription</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={18} color={Colors.primary} />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container:       { flex:1, backgroundColor:Colors.background },
  center:          { flex:1, justifyContent:'center', alignItems:'center' },
  searchRow:       { flexDirection:'row', alignItems:'center', backgroundColor:Colors.card, margin:16, marginBottom:8, borderRadius:Radius.xl, borderWidth:1, borderColor:Colors.border, paddingHorizontal:14, height:46 },
  searchInput:     { flex:1, fontSize:Fonts.size.sm, color:Colors.text },
  countTxt:        { fontSize:Fonts.size.xs, color:Colors.textMuted, paddingHorizontal:16, marginBottom:4 },
  card:            { padding:14 },
  cardRow:         { flexDirection:'row', alignItems:'center', gap:12 },
  avatar:          { width:48, height:48, borderRadius:14, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  avatarTxt:       { color:'#fff', fontWeight:'800', fontSize:18 },
  cardInfo:        { flex:1 },
  patientName:     { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  patientMeta:     { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:2 },
  condition:       { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:4 },
  cardRight:       { alignItems:'center', gap:4 },
  visitBadge:      { backgroundColor:Colors.primary100, borderRadius:Radius.md, paddingVertical:4, paddingHorizontal:8, alignItems:'center' },
  visitCount:      { fontSize:Fonts.size.md, fontWeight:'800', color:Colors.primary },
  visitLabel:      { fontSize:9, color:Colors.primary, fontWeight:'600' },
  empty:           { alignItems:'center', paddingTop:60, gap:12 },
  emptyTxt:        { color:Colors.textMuted, fontSize:Fonts.size.sm },
  emptyHint:       { color:Colors.textFaint, fontSize:Fonts.size.xs, textAlign:'center', paddingHorizontal:30 },
  // Modal
  modal:           { flex:1, backgroundColor:Colors.background },
  modalHeader:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:16, borderBottomWidth:1, borderBottomColor:Colors.border },
  closeBtn:        { width:40, height:40, alignItems:'center', justifyContent:'center' },
  modalTitle:      { fontSize:Fonts.size.lg, fontWeight:'700', color:Colors.text },
  modalBody:       { padding:16, paddingBottom:40 },
  profileSection:  { alignItems:'center', paddingVertical:20, gap:8 },
  profileAvatar:   { width:80, height:80, borderRadius:24, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  profileAvatarTxt:{ color:'#fff', fontWeight:'900', fontSize:32 },
  profileName:     { fontSize:Fonts.size.xl, fontWeight:'800', color:Colors.text },
  profileSub:      { fontSize:Fonts.size.sm, color:Colors.textMuted },
  infoGrid:        { gap:10, marginBottom:16 },
  infoItem:        { flexDirection:'row', alignItems:'center', backgroundColor:Colors.card, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border, padding:14 },
  infoLabel:       { fontSize:Fonts.size.xs, color:Colors.textMuted },
  infoValue:       { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.text, marginTop:2 },
  conditionCard:   { padding:14, marginBottom:16 },
  conditionLabel:  { fontSize:Fonts.size.xs, color:Colors.textMuted, marginBottom:4 },
  conditionValue:  { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.text },
  historyTitle:    { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text, marginBottom:10 },
  visitCard:       { padding:12, marginBottom:8 },
  visitRow:        { flexDirection:'row', alignItems:'center', gap:12 },
  visitDot:        { width:8, height:8, borderRadius:4, backgroundColor:Colors.primary },
  visitDate:       { fontSize:Fonts.size.xs, fontWeight:'700', color:Colors.text },
  visitReason:     { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:2 },
  visitStatus:     { paddingHorizontal:8, paddingVertical:3, borderRadius:Radius.full },
  visitStatusTxt:  { fontSize:9, fontWeight:'700', textTransform:'capitalize' },
  modalActions:    { gap:10, marginTop:16 },
  prescribeBtn:    { backgroundColor:Colors.primary, borderRadius:Radius.xl, paddingVertical:14, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  prescribeTxt:    { color:'#fff', fontWeight:'700', fontSize:Fonts.size.md },
});
