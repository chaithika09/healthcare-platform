import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { recordAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const TYPE_CONFIG = {
  'lab-report':        { icon:'flask', color:'#3B82F6', bg:'#DBEAFE', label:'Lab Report' },
  imaging:             { icon:'scan', color:'#8B5CF6', bg:'#EDE9FE', label:'Imaging' },
  prescription:        { icon:'medical', color:Colors.secondary, bg:Colors.secondary100, label:'Prescription' },
  'discharge-summary': { icon:'document-text', color:'#F59E0B', bg:'#FEF3C7', label:'Discharge' },
  other:               { icon:'attach', color:'#6B7280', bg:'#F3F4F6', label:'Other' },
};

export default function MedicalRecordsScreen({ navigation }) {
  const [records, setRecords] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const res = await recordAPI.getAll();
      setRecords(res.data.data.records || []);
    } catch { setRecords([]); }
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => filter === 'all' || r.type === filter);

  const deleteRecord = (id) => {
    Alert.alert('Delete Record', 'This will permanently delete this record.', [
      { text:'Cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try { await recordAPI.delete(id); await load(); } catch {}
      }}
    ]);
  };

  const renderItem = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor:cfg.bg }]}>
            <Ionicons name={cfg.icon} size={22} color={cfg.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor:cfg.bg }]}>
              <Text style={[styles.typeText, { color:cfg.color }]}>{cfg.label}</Text>
            </View>
            <Text style={styles.meta}>{item.doctor || 'N/A'} · {new Date(item.reportDate || item.createdAt).toLocaleDateString()}</Text>
            {item.files?.[0] && <Text style={styles.size}>{item.files[0].size ? (item.files[0].size/1024/1024).toFixed(1)+' MB' : ''} · {item.files[0].mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}</Text>}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="eye-outline" size={15} color={Colors.primary} />
            <Text style={styles.actionTxt}> View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="download-outline" size={15} color={Colors.secondary} />
            <Text style={[styles.actionTxt,{color:Colors.secondary}]}> Download</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteRecord(item._id)} style={[styles.actionBtn,{borderColor:'#FEE2E2'}]}>
            <Ionicons name="trash-outline" size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Upload FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Upload', 'Document picker coming soon')}>
        <Ionicons name="cloud-upload" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Filters */}
      <FlatList horizontal showsHorizontalScrollIndicator={false}
        data={[{k:'all',l:'All'},{ k:'lab-report',l:'Lab'},{k:'imaging',l:'Imaging'},{k:'prescription',l:'Prescription'}]}
        keyExtractor={i=>i.k} contentContainerStyle={styles.filters}
        renderItem={({item}) => (
          <TouchableOpacity onPress={()=>setFilter(item.k)} style={[styles.chip, filter===item.k && styles.chipActive]}>
            <Text style={[styles.chipTxt, filter===item.k && styles.chipTxtActive]}>{item.l}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList data={filtered} keyExtractor={(_,i)=>String(i)} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async()=>{setRefreshing(true);await load();setRefreshing(false);}} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:Colors.background },
  fab:       { position:'absolute', bottom:24, right:20, zIndex:10, width:56, height:56, borderRadius:16, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center', shadowColor:Colors.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:8, elevation:8 },
  filters:   { paddingHorizontal:16, paddingVertical:12, gap:8 },
  chip:      { paddingHorizontal:14, paddingVertical:7, borderRadius:Radius.full, backgroundColor:Colors.card, borderWidth:1.5, borderColor:Colors.border },
  chipActive:{ backgroundColor:Colors.primary, borderColor:Colors.primary },
  chipTxt:   { fontSize:Fonts.size.sm, fontWeight:'600', color:Colors.textMuted },
  chipTxtActive:{color:'#fff'},
  list:      { padding:16, paddingTop:0, gap:12, paddingBottom:80 },
  card:      { padding:14 },
  row:       { flexDirection:'row', gap:12 },
  iconBox:   { width:52, height:52, borderRadius:14, alignItems:'center', justifyContent:'center', flexShrink:0 },
  info:      { flex:1, gap:4 },
  title:     { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  typeBadge: { alignSelf:'flex-start', paddingHorizontal:8, paddingVertical:2, borderRadius:Radius.full },
  typeText:  { fontSize:10, fontWeight:'700' },
  meta:      { fontSize:Fonts.size.xs, color:Colors.textMuted },
  size:      { fontSize:10, color:Colors.textFaint },
  actions:   { flexDirection:'row', gap:8, marginTop:12, paddingTop:10, borderTopWidth:1, borderTopColor:Colors.border },
  actionBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:6, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border },
  actionTxt: { color:Colors.primary, fontWeight:'600', fontSize:12 },
  empty:     { alignItems:'center', paddingTop:60, gap:10 },
  emptyTxt:  { color:Colors.textMuted, fontSize:Fonts.size.sm },
});
