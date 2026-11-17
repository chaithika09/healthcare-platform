import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { doctorAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#D1FAE5', text: '#059669' },
  completed: { bg: '#DBEAFE', text: '#2563EB' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function DoctorAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [activeTab, setActiveTab]       = useState('All');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [updating, setUpdating]         = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await doctorAPI.getAppointments();
      const apts = res.data?.data?.appointments || [];
      setAppointments(apts);
      applyFilter(apts, activeTab, search);
    } catch {
      Alert.alert('Error', 'Could not load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilter = (data, tab, q) => {
    let list = data;
    if (tab !== 'All') list = list.filter(a => a.status?.toLowerCase() === tab.toLowerCase());
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(a =>
        a.patient?.name?.toLowerCase().includes(lower) ||
        a.symptoms?.toLowerCase().includes(lower)
      );
    }
    setFiltered(list);
  };

  useEffect(() => { load(); }, [load]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    applyFilter(appointments, tab, search);
  };

  const handleSearch = (q) => {
    setSearch(q);
    applyFilter(appointments, activeTab, q);
  };

  const updateStatus = async (id, newStatus) => {
    Alert.alert(
      'Update Status',
      `Mark this appointment as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(id);
            try {
              await doctorAPI.updateAppointmentStatus(id, newStatus);
              const updated = appointments.map(a =>
                a._id === id ? { ...a, status: newStatus } : a
              );
              setAppointments(updated);
              applyFilter(updated, activeTab, search);
            } catch {
              Alert.alert('Error', 'Could not update status.');
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const sc = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    return (
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(item.patient?.name || 'P').charAt(0)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.patientName}>{item.patient?.name || 'Patient'}</Text>
            <Text style={styles.cardMeta}>
              {new Date(item.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
              {' · '}{item.timeSlot}
            </Text>
            {item.symptoms ? (
              <Text style={styles.symptoms} numberOfLines={1}>💬 {item.symptoms}</Text>
            ) : null}
          </View>
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeTxt, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>

        {item.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.confirmBtn]}
              onPress={() => updateStatus(item._id, 'confirmed')}
              disabled={updating === item._id}
            >
              {updating === item._id
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.confirmTxt}>✓ Confirm</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => updateStatus(item._id, 'cancelled')}
              disabled={updating === item._id}
            >
              <Text style={styles.cancelTxt}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'confirmed' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => updateStatus(item._id, 'completed')}
              disabled={updating === item._id}
            >
              {updating === item._id
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.completeTxt}>✓ Mark Complete</Text>}
            </TouchableOpacity>
          </View>
        )}
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
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient or symptoms…"
          placeholderTextColor={Colors.textFaint}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Status Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          data={STATUS_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleTabChange(item)}
              style={[styles.tab, activeTab === item && styles.tabActive]}
            >
              <Text style={[styles.tabTxt, activeTab === item && styles.tabTxtActive]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        />
      </View>

      {/* Count */}
      <Text style={styles.countTxt}>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No appointments found</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:Colors.background },
  center:       { flex:1, justifyContent:'center', alignItems:'center' },
  searchRow:    { flexDirection:'row', alignItems:'center', backgroundColor:Colors.card, margin:16, marginBottom:8, borderRadius:Radius.xl, borderWidth:1, borderColor:Colors.border, paddingHorizontal:14, height:46 },
  searchIcon:   { marginRight:8 },
  searchInput:  { flex:1, fontSize:Fonts.size.sm, color:Colors.text },
  tabsWrapper:  { paddingVertical:8 },
  tab:          { paddingHorizontal:16, paddingVertical:7, borderRadius:Radius.full, backgroundColor:Colors.card, borderWidth:1, borderColor:Colors.border },
  tabActive:    { backgroundColor:Colors.primary, borderColor:Colors.primary },
  tabTxt:       { fontSize:Fonts.size.xs, fontWeight:'600', color:Colors.textMuted },
  tabTxtActive: { color:'#fff' },
  countTxt:     { fontSize:Fonts.size.xs, color:Colors.textMuted, paddingHorizontal:16, marginBottom:4 },
  card:         { padding:14 },
  cardTop:      { flexDirection:'row', alignItems:'flex-start', gap:12 },
  avatar:       { width:46, height:46, borderRadius:14, backgroundColor:Colors.secondary, alignItems:'center', justifyContent:'center' },
  avatarTxt:    { color:'#fff', fontWeight:'800', fontSize:16 },
  cardInfo:     { flex:1 },
  patientName:  { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  cardMeta:     { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:2 },
  symptoms:     { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:4 },
  badge:        { paddingHorizontal:9, paddingVertical:4, borderRadius:Radius.full },
  badgeTxt:     { fontSize:10, fontWeight:'700', textTransform:'capitalize' },
  actions:      { flexDirection:'row', gap:8, marginTop:12 },
  actionBtn:    { flex:1, paddingVertical:9, borderRadius:Radius.lg, alignItems:'center' },
  confirmBtn:   { backgroundColor:Colors.secondary },
  confirmTxt:   { color:'#fff', fontWeight:'700', fontSize:Fonts.size.xs },
  cancelBtn:    { backgroundColor:'#FEE2E2' },
  cancelTxt:    { color:'#DC2626', fontWeight:'700', fontSize:Fonts.size.xs },
  completeBtn:  { backgroundColor:Colors.primary },
  completeTxt:  { color:'#fff', fontWeight:'700', fontSize:Fonts.size.xs },
  empty:        { alignItems:'center', paddingTop:60, gap:12 },
  emptyTxt:     { color:Colors.textMuted, fontSize:Fonts.size.sm },
});
