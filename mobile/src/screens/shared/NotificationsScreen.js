import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../components/Card';
import { notificationAPI } from '../../config/api';
import { Colors, Fonts, Radius } from '../../theme/colors';

const TYPE_ICONS = {
  appointment: { icon:'calendar', color:Colors.primary, bg:Colors.primary100 },
  record:      { icon:'document-text', color:Colors.secondary, bg:Colors.secondary100 },
  payment:     { icon:'card', color:'#8B5CF6', bg:'#EDE9FE' },
  message:     { icon:'chatbubble', color:'#F59E0B', bg:'#FEF3C7' },
  system:      { icon:'information-circle', color:'#6B7280', bg:'#F3F4F6' },
};

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifs(res.data.data.notifications || []);
    } catch { setNotifs([]); }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try { await notificationAPI.markAllRead(); await load(); } catch {}
  };

  const markRead = async (id) => {
    try { await notificationAPI.markRead(id); setNotifs(p => p.map(n => n._id===id ? {...n, isRead:true} : n)); } catch {}
  };

  const renderItem = ({ item }) => {
    const cfg = TYPE_ICONS[item.type] || TYPE_ICONS.system;
    return (
      <TouchableOpacity onPress={() => markRead(item._id)} activeOpacity={0.8}>
        <View style={[styles.item, !item.isRead && styles.itemUnread]}>
          <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={20} color={cfg.color} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
          <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
          <Text style={styles.markAllTxt}>Mark all as read ({unreadCount})</Text>
        </TouchableOpacity>
      )}
      <FlatList data={notifs} keyExtractor={(_,i)=>String(i)} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async()=>{setRefreshing(true);await load();setRefreshing(false);}} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={52} color={Colors.textFaint} />
            <Text style={styles.emptyTxt}>No notifications yet</Text>
            <Text style={styles.emptyDesc}>Notifications will appear here when you book appointments or get updates</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:Colors.background },
  markAllBtn:  { flexDirection:'row', alignItems:'center', gap:6, padding:14, backgroundColor:Colors.primary100, borderBottomWidth:1, borderBottomColor:Colors.border },
  markAllTxt:  { color:Colors.primary, fontWeight:'600', fontSize:Fonts.size.sm },
  item:        { flexDirection:'row', alignItems:'flex-start', padding:16, backgroundColor:Colors.card, gap:12 },
  itemUnread:  { borderLeftWidth:3, borderLeftColor:Colors.primary },
  iconBox:     { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0 },
  content:     { flex:1 },
  title:       { fontSize:Fonts.size.sm, fontWeight:'700', color:Colors.text },
  message:     { fontSize:Fonts.size.xs, color:Colors.textMuted, marginTop:3, lineHeight:18 },
  time:        { fontSize:10, color:Colors.textFaint, marginTop:4 },
  unreadDot:   { width:9, height:9, borderRadius:5, backgroundColor:Colors.primary, marginTop:5 },
  separator:   { height:1, backgroundColor:Colors.border },
  empty:       { alignItems:'center', paddingTop:80, paddingHorizontal:40, gap:10 },
  emptyTxt:    { fontSize:Fonts.size.md, fontWeight:'700', color:Colors.text },
  emptyDesc:   { fontSize:Fonts.size.sm, color:Colors.textMuted, textAlign:'center', lineHeight:20 },
});
