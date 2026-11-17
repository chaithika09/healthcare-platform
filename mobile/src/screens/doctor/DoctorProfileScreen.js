import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { useAuthStore } from '../../store/authStore';
import { doctorAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

export default function DoctorProfileScreen() {
  const { user, logout, setUser } = useAuthStore();
  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const [form, setForm] = useState({
    name:         user?.name  || '',
    phone:        user?.phone || '',
    specialty:    user?.specialty || '',
    experience:   user?.experience ? String(user.experience) : '',
    fee:          user?.fee ? String(user.fee) : '',
    bio:          user?.bio   || '',
  });

  const handleUpdate = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Name is required.'); return; }
    setLoading(true);
    try {
      const res = await doctorAPI.updateProfile(form);
      setUser(res.data?.data?.doctor || { ...user, ...form });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(user?.name || 'D').charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Doctor'}</Text>
          <View style={styles.specialtyBadge}>
            <Ionicons name="medical" size={12} color={Colors.secondary} />
            <Text style={styles.specialtyTxt}>{user?.specialty || 'General Physician'}</Text>
          </View>
          <View style={styles.approvedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
            <Text style={styles.approvedTxt}>Verified Doctor</Text>
          </View>
        </View>

        {/* View Mode */}
        {!editing ? (
          <>
            <Card style={styles.card}>
              <InfoRow icon="person-outline"    label="Full Name"   value={user?.name} />
              <InfoRow icon="mail-outline"       label="Email"       value={user?.email} />
              <InfoRow icon="call-outline"       label="Phone"       value={user?.phone} />
              <InfoRow icon="briefcase-outline"  label="Specialty"   value={user?.specialty} />
              <InfoRow icon="time-outline"       label="Experience"  value={user?.experience ? `${user.experience} years` : null} />
              <InfoRow icon="cash-outline"       label="Consultation Fee" value={user?.fee ? `₹${user.fee}` : null} />
            </Card>

            {user?.bio ? (
              <Card style={[styles.card, { marginTop:12 }]}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bioTxt}>{user.bio}</Text>
              </Card>
            ) : null}

            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editBtnTxt}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Edit Mode */
          <Card style={styles.card}>
            <Text style={styles.editTitle}>Edit Profile</Text>

            {[
              { label:'Full Name', field:'name', placeholder:'Dr. Your Name', required:true },
              { label:'Phone',     field:'phone', placeholder:'+91 9876543210' },
              { label:'Specialty', field:'specialty', placeholder:'Cardiologist, Dermatologist…' },
              { label:'Experience (years)', field:'experience', placeholder:'10', keyboard:'numeric' },
              { label:'Consultation Fee (₹)', field:'fee', placeholder:'500', keyboard:'numeric' },
            ].map(({ label, field, placeholder, required, keyboard }) => (
              <View key={field} style={{ marginBottom:12 }}>
                <Text style={styles.inputLabel}>{label}{required && <Text style={styles.req}> *</Text>}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={Colors.textFaint}
                  value={form[field]}
                  onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
                  keyboardType={keyboard || 'default'}
                />
              </View>
            ))}

            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, { height:80 }]}
              placeholder="Brief introduction about yourself…"
              placeholderTextColor={Colors.textFaint}
              value={form.bio}
              onChangeText={v => setForm(f => ({ ...f, bio:v }))}
              multiline
            />

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveTxt}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutTxt}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, backgroundColor:Colors.background },
  avatarSection:  { alignItems:'center', paddingTop:32, paddingBottom:20, gap:6 },
  avatar:         { width:88, height:88, borderRadius:28, backgroundColor:Colors.secondary, alignItems:'center', justifyContent:'center', marginBottom:4 },
  avatarTxt:      { color:'#fff', fontWeight:'900', fontSize:36 },
  name:           { fontSize:Fonts.size.xl, fontWeight:'800', color:Colors.text },
  specialtyBadge: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:Colors.secondary100, paddingHorizontal:12, paddingVertical:5, borderRadius:Radius.full },
  specialtyTxt:   { fontSize:Fonts.size.xs, color:Colors.secondary, fontWeight:'600' },
  approvedBadge:  { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#D1FAE5', paddingHorizontal:12, paddingVertical:5, borderRadius:Radius.full },
  approvedTxt:    { fontSize:Fonts.size.xs, color:Colors.success, fontWeight:'600' },
  card:           { marginHorizontal:16, padding:16 },
  infoRow:        { flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, borderBottomWidth:1, borderBottomColor:Colors.border },
  infoIcon:       { width:38, height:38, borderRadius:11, backgroundColor:Colors.primary100, alignItems:'center', justifyContent:'center' },
  infoLabel:      { fontSize:Fonts.size.xs, color:Colors.textMuted },
  infoValue:      { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.text, marginTop:2 },
  bioLabel:       { fontSize:Fonts.size.sm, fontWeight:'700', color:Colors.text, marginBottom:8 },
  bioTxt:         { fontSize:Fonts.size.sm, color:Colors.textMuted, lineHeight:20 },
  editBtn:        { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, backgroundColor:Colors.primary, borderRadius:Radius.xl, marginHorizontal:16, marginTop:16, paddingVertical:14 },
  editBtnTxt:     { color:'#fff', fontWeight:'700', fontSize:Fonts.size.md },
  editTitle:      { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text, marginBottom:16 },
  inputLabel:     { fontSize:Fonts.size.xs, fontWeight:'700', color:Colors.text, marginBottom:6 },
  req:            { color:Colors.error },
  input:          { backgroundColor:Colors.background, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border, paddingHorizontal:14, paddingVertical:12, fontSize:Fonts.size.sm, color:Colors.text },
  editActions:    { flexDirection:'row', gap:10, marginTop:8 },
  cancelBtn:      { flex:1, borderRadius:Radius.xl, paddingVertical:12, alignItems:'center', backgroundColor:Colors.background, borderWidth:1, borderColor:Colors.border },
  cancelTxt:      { fontWeight:'700', color:Colors.textMuted },
  saveBtn:        { flex:2, borderRadius:Radius.xl, paddingVertical:12, alignItems:'center', backgroundColor:Colors.primary },
  saveTxt:        { color:'#fff', fontWeight:'700' },
  logoutBtn:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginHorizontal:16, marginTop:16, borderRadius:Radius.xl, paddingVertical:14, backgroundColor:'#FEE2E2', borderWidth:1, borderColor:'#FCA5A5' },
  logoutTxt:      { color:Colors.error, fontWeight:'700', fontSize:Fonts.size.md },
});
