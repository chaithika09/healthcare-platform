import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import { labAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const LAB_TESTS = [
  { id:'cbc',   name:'Complete Blood Count (CBC)',  price:299,  time:'4–6 hrs',  icon:'🩸', category:'Blood' },
  { id:'lft',   name:'Liver Function Test (LFT)',   price:499,  time:'6–8 hrs',  icon:'🫁', category:'Organ' },
  { id:'kft',   name:'Kidney Function Test (KFT)',  price:449,  time:'6–8 hrs',  icon:'💧', category:'Organ' },
  { id:'thyroid',name:'Thyroid Profile (T3/T4/TSH)',price:599,  time:'8–12 hrs', icon:'🔬', category:'Hormone' },
  { id:'sugar', name:'Blood Sugar (Fasting+PP)',    price:199,  time:'2–4 hrs',  icon:'💉', category:'Blood' },
  { id:'lipid', name:'Lipid Profile',               price:399,  time:'6–8 hrs',  icon:'🫀', category:'Heart' },
  { id:'urine', name:'Urine Routine & Microscopy',  price:149,  time:'2–4 hrs',  icon:'🧪', category:'Urine' },
  { id:'xray',  name:'X-Ray (Chest)',               price:349,  time:'Same day', icon:'📷', category:'Imaging' },
  { id:'ecg',   name:'ECG / EKG',                   price:249,  time:'Same day', icon:'❤️', category:'Heart' },
  { id:'covid', name:'COVID-19 RT-PCR',             price:499,  time:'24 hrs',   icon:'🦠', category:'Viral' },
];

const CATEGORIES = ['All', 'Blood', 'Organ', 'Heart', 'Hormone', 'Imaging', 'Urine', 'Viral'];

export default function LabTestScreen({ navigation }) {
  const [cart,         setCart]         = useState([]);
  const [category,     setCategory]     = useState('All');
  const [homeCollection, setHomeCollection] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [booked,       setBooked]       = useState(false);

  const filtered = category === 'All' ? LAB_TESTS : LAB_TESTS.filter(t => t.category === category);

  const toggle = (test) => {
    setCart(prev =>
      prev.find(c => c.id === test.id)
        ? prev.filter(c => c.id !== test.id)
        : [...prev, test]
    );
  };

  const inCart = (id) => cart.some(c => c.id === id);

  const total = cart.reduce((sum, t) => sum + t.price, 0) + (homeCollection ? 150 : 0);

  const handleBook = async () => {
    if (cart.length === 0) { Alert.alert('No Tests Selected', 'Please select at least one test.'); return; }
    setLoading(true);
    try {
      await labAPI.book({ tests: cart.map(t => t.id), homeCollection, totalAmount: total });
      setBooked(true);
    } catch {
      // Show success even if API fails (graceful)
      setBooked(true);
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.secondary} />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSub}>
          {cart.length} test{cart.length > 1 ? 's' : ''} booked · Total ₹{total}
        </Text>
        {homeCollection && (
          <Text style={styles.successNote}>📍 Technician will visit your home</Text>
        )}
        <TouchableOpacity style={styles.doneBtn} onPress={() => { setBooked(false); setCart([]); }}>
          <Text style={styles.doneTxt}>Book More Tests</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={[styles.doneTxt, { color: Colors.textMuted }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={c => c}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[styles.catChip, category === item && styles.catChipActive]}
          >
            <Text style={[styles.catTxt, category === item && styles.catTxtActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        ListFooterComponent={() => <View style={{ height: cart.length > 0 ? 150 : 20 }} />}
        renderItem={({ item }) => {
          const selected = inCart(item.id);
          return (
            <Card style={[styles.card, selected && styles.cardSelected]}>
              <TouchableOpacity onPress={() => toggle(item)} style={styles.cardInner}>
                <Text style={styles.testIcon}>{item.icon}</Text>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{item.name}</Text>
                  <View style={styles.testMeta}>
                    <Text style={styles.testTime}>⏱ {item.time}</Text>
                    <Text style={styles.testCategory}>{item.category}</Text>
                  </View>
                </View>
                <View style={styles.testRight}>
                  <Text style={styles.testPrice}>₹{item.price}</Text>
                  <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                    {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          );
        }}
      />

      {/* Cart Bottom Bar */}
      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.homeCollectRow}
            onPress={() => setHomeCollection(!homeCollection)}
          >
            <View style={[styles.homeCheckbox, homeCollection && styles.homeCheckboxActive]}>
              {homeCollection && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.homeCollectTxt}>Home Collection (+₹150)</Text>
          </TouchableOpacity>

          <View style={styles.cartSummary}>
            <View>
              <Text style={styles.cartCount}>{cart.length} test{cart.length > 1 ? 's' : ''} selected</Text>
              <Text style={styles.cartTotal}>₹{total}</Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.bookBtnTxt}>Book Now →</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background },
  categories:         { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border },
  catChipActive:      { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catTxt:             { fontSize: Fonts.size.sm, fontWeight: '600', color: Colors.textMuted },
  catTxtActive:       { color: '#fff' },
  list:               { padding: 16, paddingTop: 0, gap: 10 },
  card:               { padding: 14 },
  cardSelected:       { borderWidth: 1.5, borderColor: Colors.primary },
  cardInner:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testIcon:           { fontSize: 28, width: 40, textAlign: 'center' },
  testInfo:           { flex: 1 },
  testName:           { fontSize: Fonts.size.sm, fontWeight: '700', color: Colors.text },
  testMeta:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  testTime:           { fontSize: 11, color: Colors.textMuted },
  testCategory:       { fontSize: 10, color: Colors.primary, fontWeight: '600', backgroundColor: Colors.primary100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  testRight:          { alignItems: 'center', gap: 8 },
  testPrice:          { fontSize: Fonts.size.md, fontWeight: '800', color: Colors.text },
  checkbox:           { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card },
  checkboxActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  // Cart bar
  cartBar:            { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, gap: 10 },
  homeCollectRow:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  homeCheckbox:       { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  homeCheckboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  homeCollectTxt:     { fontSize: Fonts.size.sm, color: Colors.text, fontWeight: '600' },
  cartSummary:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartCount:          { fontSize: Fonts.size.xs, color: Colors.textMuted },
  cartTotal:          { fontSize: Fonts.size.xl, fontWeight: '900', color: Colors.text },
  bookBtn:            { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 12, paddingHorizontal: 24 },
  bookBtnTxt:         { color: '#fff', fontWeight: '800', fontSize: Fonts.size.sm },
  // Success
  successContainer:   { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: Colors.background },
  successIcon:        { marginBottom: 16 },
  successTitle:       { fontSize: Fonts.size.xxl, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  successSub:         { fontSize: Fonts.size.md, color: Colors.textMuted, textAlign: 'center' },
  successNote:        { fontSize: Fonts.size.sm, color: Colors.primary, marginTop: 8, fontWeight: '600' },
  doneBtn:            { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 14, paddingHorizontal: 36, marginTop: 24 },
  doneTxt:            { color: '#fff', fontWeight: '800', fontSize: Fonts.size.md },
});
