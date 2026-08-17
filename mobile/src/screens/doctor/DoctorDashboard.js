import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { doctorAPI, appointmentAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function DoctorDashboard({ navigation }) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ todayAppointments:0, totalPatients:0, averageRating:4.9 });
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [dashRes, aptRes] = await Promise.all([
        doctorAPI.getDashboard(),
        appointmentAPI.getAll(),
      ]);
      setStats(dashRes.data.data.stats || {});
      setAppointments((aptRes.data.data.appointments || []).slice(0,5));
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <LinearGradient colors={['#005a3c','#00A86B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.name || 'Doctor'} 👨‍⚕️</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          {[
            { label:"Today's Patients", value: stats.todayAppointments || 0, icon:'calendar' },
            { label:'Total Patients', value: stats.totalPatients || 0, icon:'people' },
            { label:'Rating', value: (stats.averageRating||4.9).toFixed(1)+'★', icon:'star' },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Quick actions */}
        <View style={styles.actionsRow}>
          {[
            { icon:'calendar', label:'Schedule', color:Colors.primary, route:'DoctorAppointments' },
            { icon:'people', label:'Patients', color:'#8B5CF6', route:'Profile' },
            { icon:'document-text', label:'Prescriptions', color:Colors.secondary, route:'Profile' },
            { icon:'chatbubbles', label:'Chat', color:'#F59E0B', route:'Chat' },
          ].map(a => (
            <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.route)} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor:a.color+'15' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorAppointments')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {appointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No appointments today</Text>
          </Card>
        ) : (
          appointments.map((apt, i) => (
            <Card key={i} style={styles.aptCard}>
              <View style={styles.aptRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{(apt.patient?.name||'P').charAt(0)}</Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.aptName}>{apt.patient?.name || 'Patient'}</Text>
                  <Text style={styles.aptMeta}>{apt.timeSlot} · {apt.reason || 'Consultation'}</Text>
                </View>
                <View style={styles.aptActions}>
                  <View style={[styles.aptBadge, apt.type==='video' ? styles.badgeVideo : styles.badgeIn]}>
                    <Text style={[styles.aptBadgeTxt, apt.type==='video' ? {color:Colors.primary} : {color:Colors.secondary}]}>
                      {apt.type==='video' ? 'Video' : 'In-Person'}
                    </Text>
                  </View>
                  {apt.type === 'video' && apt.status === 'confirmed' && (
                    <TouchableOpacity style={styles.joinBtn}>
                      <Text style={styles.joinTxt}>Join</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flex:1, backgroundColor:Colors.background },
  header:       { paddingTop:56, paddingBottom:24, paddingHorizontal:20 },
  headerTop:    { flexDirection:'row', justifyContent:'space-between', marginBottom:20 },
  greeting:     { color:'rgba(255,255,255,0.7)', fontSize:Fonts.size.sm },
  name:         { color:'#fff', fontSize:Fonts.size.xxl, fontWeight:'800' },
  notifBtn:     { width:40, height:40, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:12, alignItems:'center', justifyContent:'center' },
  statsRow:     { flexDirection:'row', gap:8 },
  statBox:      { flex:1, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:14, padding:12, alignItems:'center' },
  statValue:    { color:'#fff', fontSize:Fonts.size.xl, fontWeight:'800' },
  statLabel:    { color:'rgba(255,255,255,0.7)', fontSize:10, textAlign:'center', marginTop:2 },
  body:         { padding:16 },
  actionsRow:   { flexDirection:'row', gap:10, marginBottom:20 },
  actionBtn:    { flex:1, backgroundColor:Colors.card, borderRadius:Radius.xl, padding:14, alignItems:'center', borderWidth:1, borderColor:Colors.border },
  actionIcon:   { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', marginBottom:8 },
  actionLabel:  { fontSize:11, fontWeight:'600', color:Colors.text },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  sectionTitle: { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  seeAll:       { color:Colors.primary, fontWeight:'600', fontSize:Fonts.size.sm },
  emptyCard:    { alignItems:'center', padding:28, gap:10 },
  emptyTxt:     { color:Colors.textMuted },
  aptCard:      { marginBottom:10, padding:14 },
  aptRow:       { flexDirection:'row', alignItems:'center', gap:12 },
  avatar:       { width:46, height:46, borderRadius:13, backgroundColor:Colors.secondary, alignItems:'center', justifyContent:'center' },
  avatarTxt:    { color:'#fff', fontWeight:'800', fontSize:16 },
  aptInfo:      { flex:1 },
  aptName:      { fontSize:Fonts.size.sm, fontWeight:'700', color:Colors.text },
  aptMeta:      { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:2 },
  aptActions:   { alignItems:'flex-end', gap:6 },
  aptBadge:     { paddingHorizontal:8, paddingVertical:3, borderRadius:Radius.full },
  badgeVideo:   { backgroundColor:Colors.primary100 },
  badgeIn:      { backgroundColor:Colors.secondary100 },
  aptBadgeTxt:  { fontSize:10, fontWeight:'600' },
  joinBtn:      { backgroundColor:Colors.secondary, paddingHorizontal:14, paddingVertical:6, borderRadius:Radius.lg },
  joinTxt:      { color:'#fff', fontWeight:'700', fontSize:11 },
});
