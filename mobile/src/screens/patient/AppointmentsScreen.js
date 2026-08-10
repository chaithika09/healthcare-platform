import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { appointmentAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const STATUS_COLORS = {
  confirmed: { bg: '#E6F0FA', text: Colors.primary },
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.data.appointments || []);
    } catch {
      // Fallback sample data if backend API is offline
      setAppointments([
        {
          _id: '1',
          doctor: { name: 'Dr. Sarah Johnson', specialty: 'Cardiologist' },
          date: '2024-06-20',
          timeSlot: '10:00 AM',
          type: 'video',
          status: 'confirmed',
          fee: 80,
        },
        {
          _id: '2',
          doctor: { name: 'Dr. Michael Chen', specialty: 'General Physician' },
          date: '2024-06-25',
          timeSlot: '02:30 PM',
          type: 'in-person',
          status: 'confirmed',
          fee: 50,
        },
        {
          _id: '3',
          doctor: { name: 'Dr. Emily Davis', specialty: 'Dermatologist' },
          date: '2024-05-15',
          timeSlot: '11:15 AM',
          type: 'video',
          status: 'completed',
          fee: 75,
        },
      ]);
    }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = appointments.filter(a => filter === 'all' || a.status === filter);

  const cancelApt = (id) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await appointmentAPI.cancel(id, { reason: 'Patient cancelled' });
          await load();
        } catch {
          setAppointments((prev) => prev.map((item) => item._id === id ? { ...item, status: 'cancelled' } : item));
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(item.doctor?.name || 'D').charAt(0)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.docName}>{item.doctor?.name || 'Doctor'}</Text>
            <View style={styles.timeRow}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.time}>{item.date} · {item.timeSlot}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: item.type === 'video' ? Colors.primary100 : Colors.secondary100 }]}>
                <Ionicons name={item.type === 'video' ? 'videocam' : 'person'} size={10} color={item.type === 'video' ? Colors.primary : Colors.secondary} />
                <Text style={[styles.badgeTxt, { color: item.type === 'video' ? Colors.primary : Colors.secondary }]}>
                  {item.type === 'video' ? ' Video' : ' In-Person'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.badgeTxt, { color: sc.text }]}>
                  {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {item.status === 'confirmed' && item.type === 'video' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('VideoConsultation', { doctorName: item.doctor?.name })}
              style={styles.joinBtn}
            >
              <Ionicons name="videocam" size={14} color="#fff" />
              <Text style={styles.joinTxt}>{" Join Call"}</Text>
            </TouchableOpacity>
          )}

          {item.status === 'confirmed' && (
            <TouchableOpacity onPress={() => cancelApt(item._id)} style={styles.cancelBtn}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.fee}>${item.fee}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter tabs */}
      <View style={styles.tabs}>
        {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.tab, filter === f && styles.tabActive]}>
            <Text style={[styles.tabTxt, filter === f && styles.tabTxtActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No appointments found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  tabs:        { flexDirection: 'row', backgroundColor: Colors.card, paddingHorizontal: 12, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab:         { flex: 1, paddingVertical: 7, borderRadius: Radius.full, alignItems: 'center', backgroundColor: Colors.background },
  tabActive:   { backgroundColor: Colors.primary },
  tabTxt:      { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  tabTxtActive:{ color: '#fff' },
  list:        { padding: 16, gap: 12 },
  card:        { padding: 14 },
  row:         { flexDirection: 'row', gap: 12 },
  avatar:      { width: 50, height: 50, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:   { color: '#fff', fontWeight: '800', fontSize: 18 },
  info:        { flex: 1 },
  docName:     { fontSize: Fonts.size.md, fontWeight: '700', color: Colors.text },
  timeRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  time:        { fontSize: Fonts.size.xs, color: Colors.textMuted },
  metaRow:     { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeTxt:    { fontSize: 10, fontWeight: '600' },
  actions:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  joinBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.lg },
  joinTxt:     { color: '#fff', fontWeight: '700', fontSize: 12 },
  cancelBtn:   { borderWidth: 1, borderColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.lg },
  cancelTxt:   { color: '#EF4444', fontWeight: '600', fontSize: 12 },
  fee:         { marginLeft: 'auto', fontSize: Fonts.size.md, fontWeight: '800', color: Colors.text },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt:    { color: Colors.textMuted, fontSize: Fonts.size.sm },
});
