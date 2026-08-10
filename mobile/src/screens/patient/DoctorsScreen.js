import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { doctorAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const specialties = ['All','Cardiologist','Neurologist','Dermatologist','Pediatrician','Orthopedic'];

export default function DoctorsScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');

  useEffect(() => {
    doctorAPI.getAll().then(r => setDoctors(r.data.data.doctors || [])).catch(() => setDoctors([])).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d => {
    const matchSearch = d.user?.name?.toLowerCase().includes(search.toLowerCase()) || d.specialty?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === 'All' || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  const renderDoctor = ({ item: d }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { doctorId: d.user?._id, doctor: d })}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{d.user?.name?.slice(0,2)?.toUpperCase() || 'DR'}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{d.user?.name || 'Doctor'}</Text>
              <View style={[styles.dot, d.isAvailableNow ? styles.dotGreen : styles.dotGray]} />
            </View>
            <Text style={styles.specialty}>{d.specialty}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.rating}>{d.averageRating?.toFixed(1) || '4.9'}</Text>
              <Text style={styles.reviews}>({d.totalReviews || 0})</Text>
              <Text style={styles.dot2}>·</Text>
              <Text style={styles.exp}>{d.experience}y exp</Text>
            </View>
          </View>
          <View style={styles.right}>
            <Text style={styles.fee}>${d.consultationFee?.video || 150}</Text>
            <Text style={styles.feeLabel}>/session</Text>
            <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('BookAppointment', { doctorId: d.user?._id, doctor: d })}>
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tags}>
          {d.consultationTypes?.video && <View style={styles.tag}><Ionicons name="videocam" size={10} color={Colors.primary}/><Text style={[styles.tagText,{color:Colors.primary}]}>{" Video"}</Text></View>}
          {d.consultationTypes?.inPerson && <View style={[styles.tag,{backgroundColor:Colors.secondary100}]}><Ionicons name="person" size={10} color={Colors.secondary}/><Text style={[styles.tagText,{color:Colors.secondary}]}>{" In-person"}</Text></View>}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textFaint} />
        <TextInput style={styles.searchInput} placeholder="Search doctors or specialty..." value={search} onChangeText={setSearch} placeholderTextColor={Colors.textFaint} />
      </View>
      {/* Specialty filter */}
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={specialties} keyExtractor={i=>i}
        contentContainerStyle={styles.chips}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => setSpecialty(item)} style={[styles.chip, specialty===item && styles.chipActive]}>
            <Text style={[styles.chipText, specialty===item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {loading ? (
        <ActivityIndicator style={{marginTop:40}} color={Colors.primary} size="large" />
      ) : (
        <FlatList data={filtered} keyExtractor={(_,i)=>String(i)} renderItem={renderDoctor}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No doctors found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:Colors.background },
  searchBox:    { flexDirection:'row', alignItems:'center', backgroundColor:Colors.card, margin:16, marginBottom:8, borderRadius:Radius.xl, paddingHorizontal:14, height:46, borderWidth:1, borderColor:Colors.border, gap:8 },
  searchInput:  { flex:1, fontSize:Fonts.size.sm, color:Colors.text },
  chips:        { paddingHorizontal:16, paddingBottom:8, gap:8 },
  chip:         { paddingHorizontal:14, paddingVertical:7, borderRadius:Radius.full, backgroundColor:Colors.card, borderWidth:1.5, borderColor:Colors.border },
  chipActive:   { backgroundColor:Colors.primary, borderColor:Colors.primary },
  chipText:     { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.textMuted },
  chipTextActive:{ color:'#fff' },
  list:         { padding:16, paddingTop:0, gap:12 },
  empty:        { textAlign:'center', marginTop:40, color:Colors.textMuted },
  card:         { padding:14 },
  row:          { flexDirection:'row', gap:12, alignItems:'flex-start' },
  avatar:       { width:56, height:56, borderRadius:16, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  avatarText:   { color:'#fff', fontWeight:'800', fontSize:Fonts.size.md },
  info:         { flex:1 },
  nameRow:      { flexDirection:'row', alignItems:'center', gap:6 },
  name:         { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text, flex:1 },
  dot:          { width:8, height:8, borderRadius:4 },
  dotGreen:     { backgroundColor:Colors.secondary },
  dotGray:      { backgroundColor:'#D1D5DB' },
  specialty:    { fontSize:Fonts.size.sm, color:Colors.primary, fontWeight:'600', marginTop:2 },
  metaRow:      { flexDirection:'row', alignItems:'center', gap:3, marginTop:4 },
  rating:       { fontSize:Fonts.size.xs, fontWeight:'700', color:Colors.text },
  reviews:      { fontSize:Fonts.size.xs, color:Colors.textFaint },
  dot2:         { color:Colors.textFaint },
  exp:          { fontSize:Fonts.size.xs, color:Colors.textMuted },
  right:        { alignItems:'flex-end' },
  fee:          { fontSize:Fonts.size.lg, fontWeight:'800', color:Colors.text },
  feeLabel:     { fontSize:10, color:Colors.textFaint },
  bookBtn:      { backgroundColor:Colors.primary, borderRadius:Radius.lg, paddingVertical:7, paddingHorizontal:14, marginTop:6 },
  bookBtnText:  { color:'#fff', fontWeight:'700', fontSize:Fonts.size.xs },
  tags:         { flexDirection:'row', gap:8, marginTop:10 },
  tag:          { flexDirection:'row', alignItems:'center', backgroundColor:Colors.primary100, borderRadius:Radius.full, paddingHorizontal:8, paddingVertical:3 },
  tagText:      { fontSize:10, fontWeight:'600' },
});
