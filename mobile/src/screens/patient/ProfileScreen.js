import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { Colors, Fonts, Radius } from '../../theme/colors';

const MenuItem = ({ icon, label, value, onPress, danger }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={18} color={danger ? '#EF4444' : Colors.primary} />
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text:'Cancel' },
      { text:'Logout', style:'destructive', onPress: async () => { await logout(); navigation.replace('Auth'); } }
    ]);
  };

  return (
    <ScrollView style={styles.scroll}>
      {/* Header */}
      <LinearGradient colors={['#0066CC','#004d99']} style={styles.header}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <View style={[styles.roleBadge, user?.role==='doctor' && styles.roleBadgeDoctor]}>
          <Text style={styles.roleText}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Patient'}</Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Account */}
        <Text style={styles.section}>Account</Text>
        <Card style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuItem icon="call-outline" label="Phone" value={user?.phone || 'Not set'} onPress={() => {}} />
          <MenuItem icon="mail-outline" label="Email" value={user?.email} onPress={() => {}} />
        </Card>

        {/* Health */}
        {user?.role === 'patient' && (
          <>
            <Text style={styles.section}>Health</Text>
            <Card style={styles.menuCard}>
              <MenuItem icon="document-text-outline" label="Medical Records" onPress={() => navigation.navigate('Records')} />
              <MenuItem icon="medical-outline" label="Prescriptions" onPress={() => navigation.navigate('Prescriptions')} />
              <MenuItem icon="flask-outline" label="Lab Tests" onPress={() => navigation.navigate('LabTests')} />
              <MenuItem icon="fitness-outline" label="Medicine Reminders" onPress={() => {}} />
            </Card>
          </>
        )}

        {/* App */}
        <Text style={styles.section}>App</Text>
        <Card style={styles.menuCard}>
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
          <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
          <MenuItem icon="document-outline" label="Terms of Service" onPress={() => {}} />
        </Card>

        {/* Logout */}
        <Card style={[styles.menuCard, { marginBottom: 40 }]}>
          <MenuItem icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
        </Card>

        <Text style={styles.version}>MedIQ+ v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:          { flex:1, backgroundColor:Colors.background },
  header:          { paddingTop:60, paddingBottom:32, alignItems:'center', gap:8 },
  avatarBox:       { width:88, height:88, borderRadius:24, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', marginBottom:4 },
  avatarText:      { fontSize:36, fontWeight:'800', color:'#fff' },
  name:            { fontSize:Fonts.size.xxl, fontWeight:'800', color:'#fff' },
  roleBadge:       { backgroundColor:'rgba(0,168,107,0.3)', paddingHorizontal:14, paddingVertical:4, borderRadius:Radius.full },
  roleBadgeDoctor: { backgroundColor:'rgba(255,255,255,0.2)' },
  roleText:        { color:'#fff', fontWeight:'700', fontSize:12 },
  email:           { color:'rgba(255,255,255,0.65)', fontSize:Fonts.size.sm },
  body:            { padding:16 },
  section:         { fontSize:12, fontWeight:'700', color:Colors.textFaint, textTransform:'uppercase', letterSpacing:1, marginBottom:8, marginTop:8 },
  menuCard:        { padding:4, marginBottom:4 },
  menuItem:        { flexDirection:'row', alignItems:'center', padding:12, gap:12 },
  menuIcon:        { width:36, height:36, backgroundColor:Colors.primary100, borderRadius:10, alignItems:'center', justifyContent:'center' },
  menuIconDanger:  { backgroundColor:'#FEE2E2' },
  menuText:        { flex:1 },
  menuLabel:       { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.text },
  menuLabelDanger: { color:'#EF4444' },
  menuValue:       { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:1 },
  version:         { textAlign:'center', color:Colors.textFaint, fontSize:11, marginBottom:24 },
});
