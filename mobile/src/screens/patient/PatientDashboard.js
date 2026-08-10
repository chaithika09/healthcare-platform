import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { patientAPI, appointmentAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const StatCard = ({ icon, label, value, color }) => (
  <Card style={styles.stat}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const quickActions = [
  { icon:'search', label:'Find Doctor', color:'#0066CC', route:'Doctors' },
  { icon:'flask',  label:'Lab Tests',   color:'#8B5CF6', route:'LabTests' },
  { icon:'document-text', label:'Records', color:'#00A86B', route:'Records' },
  { icon:'alert-circle', label:'Emergency', color:'#EF4444', route:'Emergency' },
];

export default function PatientDashboard({ navigation }) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalAppointments:0, totalRecords:0, activePrescriptions:0 });
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [dashRes, aptRes] = await Promise.all([
        patientAPI.getDashboard(),
        appointmentAPI.getAll({ status:'confirmed' }),
      ]);
      setStats(dashRes.data.data.stats || {});
      setAppointments((aptRes.data.data.appointments || []).slice(0, 3));
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <LinearGradient colors={['#0066CC','#004d99']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Patient'} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Here's your health overview for today</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="calendar" label="Appointments" value={stats.totalAppointments || 0} color={Colors.primary} />
          <StatCard icon="document-text" label="Records" value={stats.totalRecords || 0} color={Colors.secondary} />
          <StatCard icon="medical" label="Prescriptions" value={stats.activePrescriptions || 0} color="#8B5CF6" />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(a => (
            <TouchableOpacity key={a.label} onPress={() => navigation.navigate(a.route)} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                <Ionicons name={a.icon} size={24} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {appointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textFaint} />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Doctors')} style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>Book an Appointment</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          appointments.map((apt, i) => (
            <Card key={i} style={styles.aptCard}>
              <View style={styles.aptRow}>
                <View style={styles.aptAvatar}>
                  <Text style={styles.aptAvatarText}>{apt.doctor?.name?.charAt(0) || 'D'}</Text>
                </View>
                <View style={styles.aptInfo}>
                  <Text style={styles.aptDoctor}>{apt.doctor?.name || 'Doctor'}</Text>
                  <Text style={styles.aptTime}>{new Date(apt.date).toLocaleDateString()} · {apt.timeSlot}</Text>
                  <View style={[styles.aptBadge, apt.type === 'video' ? styles.badgeVideo : styles.badgeIn]}>
                    <Ionicons name={apt.type === 'video' ? 'videocam' : 'person'} size={10} color={apt.type === 'video' ? Colors.primary : Colors.secondary} />
                    <Text style={[styles.aptBadgeText, apt.type === 'video' ? {color:Colors.primary} : {color:Colors.secondary}]}>
                      {apt.type === 'video' ? 'Video' : 'In-Person'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex:1, backgroundColor:Colors.background },
  header:        { paddingTop:56, paddingBottom:28, paddingHorizontal:20 },
  headerTop:     { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  greeting:      { fontSize:Fonts.size.sm, color:'rgba(255,255,255,0.7)' },
  userName:      { fontSize:Fonts.size.xxl, fontWeight:'800', color:'#fff', marginTop:2 },
  headerSub:     { fontSize:Fonts.size.sm, color:'rgba(255,255,255,0.6)' },
  notifBtn:      { width:40, height:40, backgroundColor:'rgba(255,255,255,0.2)', borderRadius:12, alignItems:'center', justifyContent:'center' },
  notifDot:      { position:'absolute', top:8, right:8, width:8, height:8, backgroundColor:'#EF4444', borderRadius:4 },
  body:          { padding:16 },
  statsRow:      { flexDirection:'row', gap:10, marginBottom:20 },
  stat:          { flex:1, alignItems:'center', padding:12 },
  statIcon:      { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', marginBottom:8 },
  statValue:     { fontSize:Fonts.size.xl, fontWeight:'800', color:Colors.text },
  statLabel:     { fontSize:10, color:Colors.textMuted, textAlign:'center', marginTop:2 },
  sectionTitle:  { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text, marginBottom:12 },
  sectionHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  seeAll:        { fontSize:Fonts.size.sm, color:Colors.primary, fontWeight:'600' },
  actionsGrid:   { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:20 },
  actionBtn:     { width:'47%', backgroundColor:Colors.card, borderRadius:Radius.xl, padding:16, alignItems:'center', borderWidth:1, borderColor:Colors.border },
  actionIcon:    { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center', marginBottom:8 },
  actionLabel:   { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.text },
  emptyCard:     { alignItems:'center', padding:32, gap:12 },
  emptyText:     { color:Colors.textMuted, fontSize:Fonts.size.sm },
  bookBtn:       { backgroundColor:Colors.primary100, borderRadius:Radius.xl, paddingVertical:10, paddingHorizontal:20 },
  bookBtnText:   { color:Colors.primary, fontWeight:'700', fontSize:Fonts.size.sm },
  aptCard:       { marginBottom:10, padding:14 },
  aptRow:        { flexDirection:'row', alignItems:'center', gap:12 },
  aptAvatar:     { width:48, height:48, borderRadius:14, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  aptAvatarText: { color:'#fff', fontWeight:'800', fontSize:Fonts.size.lg },
  aptInfo:       { flex:1 },
  aptDoctor:     { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  aptTime:       { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:2 },
  aptBadge:      { flexDirection:'row', alignItems:'center', gap:4, marginTop:5, alignSelf:'flex-start', paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  badgeVideo:    { backgroundColor:'#E6F0FA' },
  badgeIn:       { backgroundColor:'#E6F7F2' },
  aptBadgeText:  { fontSize:10, fontWeight:'600' },
  joinBtn:       { backgroundColor:Colors.primary100, borderRadius:Radius.lg, paddingVertical:8, paddingHorizontal:14 },
  joinBtnText:   { color:Colors.primary, fontWeight:'700', fontSize:Fonts.size.xs },
});
