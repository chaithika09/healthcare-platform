import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function VideoConsultationScreen({ navigation, route }) {
  const doctorName = route.params?.doctorName || 'Dr. Sarah Johnson';
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [seconds, setSeconds] = useState(272); // Starts at 04:32

  const [messages, setMessages] = useState([
    { id: '1', from: 'doctor', text: 'Hello! How are you feeling today?', time: '3:00 PM' },
    { id: '2', from: 'patient', text: "I've been experiencing mild chest tightness since yesterday.", time: '3:01 PM' },
    { id: '3', from: 'doctor', text: 'I see. Can you describe if the pain is sharp or dull?', time: '3:01 PM' },
  ]);
  const [newMsg, setNewMsg] = useState('');

  // Call timer effect
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  const handleSendMessage = () => {
    if (!newMsg.trim()) return;
    const msg = {
      id: String(Date.now()),
      from: 'patient',
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMsg('');
  };

  const handleEndCall = () => {
    Alert.alert('End Call', 'Are you sure you want to end this video consultation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Consultation', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.doctorHeaderInfo}>
          <View style={styles.liveDot} />
          <Text style={styles.headerDocName}>{doctorName}</Text>
          <Text style={styles.headerTimer}>· {formatTimer(seconds)}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={handleEndCall}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Video View Container */}
      <View style={styles.videoStage}>
        {/* Doctor Remote Tile */}
        <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.doctorVideoTile}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarTxt}>
              {doctorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={styles.doctorVideoLabel}>{doctorName}</Text>
          <Text style={styles.doctorStatusSub}>HD Video Connected · Encrypted</Text>
        </LinearGradient>

        {/* Self Camera Preview (Picture-in-Picture) */}
        <View style={styles.selfViewTile}>
          {camOn ? (
            <LinearGradient colors={['#0284C7', '#0369A1']} style={styles.selfVideoContent}>
              <View style={styles.selfAvatarMini}>
                <Text style={styles.selfAvatarTxt}>You</Text>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.selfCamOff}>
              <Ionicons name="videocam-off" size={20} color="#94A3B8" />
              <Text style={styles.camOffTxt}>Cam Off</Text>
            </View>
          )}
        </View>

        {/* Floating Chat Drawer Overlay */}
        {chatOpen && (
          <View style={styles.chatOverlay}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>In-Call Consultation Chat</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
              renderItem={({ item }) => (
                <View style={[styles.msgBubbleRow, item.from === 'patient' ? styles.msgRight : styles.msgLeft]}>
                  <View style={[styles.msgBubble, item.from === 'patient' ? styles.bubblePatient : styles.bubbleDoc]}>
                    <Text style={styles.msgText}>{item.text}</Text>
                    <Text style={styles.msgTime}>{item.time}</Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="#94A3B8"
                value={newMsg}
                onChangeText={setNewMsg}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Ionicons name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Control Buttons Toolbar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.ctrlBtn, !micOn && styles.ctrlBtnOff]}
          onPress={() => setMicOn(!micOn)}
        >
          <Ionicons name={micOn ? 'mic' : 'mic-off'} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, !camOn && styles.ctrlBtnOff]}
          onPress={() => setCamOn(!camOn)}
        >
          <Ionicons name={camOn ? 'videocam' : 'videocam-off'} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, chatOpen && styles.ctrlBtnActive]}
          onPress={() => setChatOpen(!chatOpen)}
        >
          <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0F172A' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(15, 23, 42, 0.9)' },
  doctorHeaderInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  headerDocName:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerTimer:      { color: '#94A3B8', fontSize: 13 },
  closeBtn:         { padding: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  videoStage:       { flex: 1, position: 'relative' },
  doctorVideoTile:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  avatarCircle:     { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarTxt:        { fontSize: 36, fontWeight: '800', color: '#fff' },
  doctorVideoLabel: { fontSize: 18, fontWeight: '700', color: '#fff' },
  doctorStatusSub:  { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  selfViewTile:     { position: 'absolute', bottom: 20, right: 20, width: 110, height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#334155', elevation: 5 },
  selfVideoContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  selfAvatarMini:   { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  selfAvatarTxt:    { color: '#fff', fontWeight: '700', fontSize: 12 },
  selfCamOff:       { flex: 1, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', gap: 4 },
  camOffTxt:        { color: '#94A3B8', fontSize: 10, fontWeight: '600' },
  chatOverlay:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 14 },
  chatHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 8, marginBottom: 8 },
  chatTitle:        { color: '#fff', fontWeight: '700', fontSize: 13 },
  chatList:         { gap: 8, paddingVertical: 8 },
  msgBubbleRow:     { flexDirection: 'row', marginVertical: 2 },
  msgLeft:          { justifyContent: 'flex-start' },
  msgRight:         { justifyContent: 'flex-end' },
  msgBubble:        { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  bubblePatient:    { backgroundColor: '#0284C7' },
  bubbleDoc:        { backgroundColor: '#334155' },
  msgText:          { color: '#fff', fontSize: 13 },
  msgTime:          { color: 'rgba(255,255,255,0.6)', fontSize: 9, alignSelf: 'flex-end', marginTop: 2 },
  chatInputRow:     { flexDirection: 'row', gap: 8, marginTop: 8 },
  chatInput:        { flex: 1, height: 40, backgroundColor: '#334155', borderRadius: 12, paddingHorizontal: 12, color: '#fff', fontSize: 13 },
  sendBtn:          { width: 40, height: 40, backgroundColor: '#0284C7', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  controlsBar:      { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 20, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: '#1E293B' },
  ctrlBtn:          { width: 52, height: 52, borderRadius: 26, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  ctrlBtnOff:       { backgroundColor: '#EF4444' },
  ctrlBtnActive:    { backgroundColor: '#0284C7' },
  endCallBtn:       { width: 62, height: 62, borderRadius: 31, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
});
