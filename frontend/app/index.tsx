import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAlarms } from '../contexts/AlarmContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatTime, getTimeUntilAlarm } from '../utils/timeFormatter';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function Index() {
  const { alarms, toggleAlarm, deleteAlarm, settings, refreshAlarms } = useAlarms();
  const router = useRouter();

  useEffect(() => {
    // Listen for notification responses (when user taps notification)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const alarmId = response.notification.request.content.data?.alarmId;
      if (alarmId) {
        // Navigate to ringing screen
        router.push({
          pathname: '/ringing',
          params: { alarmId }
        });
      }
    });

    // Refresh alarms when screen comes into focus
    refreshAlarms();

    return () => subscription.remove();
  }, []);

  const handleDeleteAlarm = (id: string) => {
    Alert.alert(
      'Delete Alarm',
      'Are you sure you want to delete this alarm?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAlarm(id)
        }
      ]
    );
  };

  const sortedAlarms = [...alarms].sort((a, b) => {
    const aTime = a.hour * 60 + a.minute;
    const bTime = b.hour * 60 + b.minute;
    return aTime - bTime;
  });

  const renderAlarmItem = ({ item }: { item: typeof alarms[0] }) => (
    <View style={styles.alarmCard}>
      <View style={styles.alarmContent}>
        <View style={styles.alarmInfo}>
          <Text style={styles.timeText}>
            {formatTime(item.hour, item.minute, settings.use24Hour)}
          </Text>
          {item.label && (
            <Text style={styles.labelText}>{item.label}</Text>
          )}
          {item.enabled && (
            <Text style={styles.nextAlarmText}>
              {getTimeUntilAlarm(item.hour, item.minute)}
            </Text>
          )}
        </View>
        <View style={styles.alarmActions}>
          <TouchableOpacity
            style={[styles.toggleButton, item.enabled && styles.toggleButtonActive]}
            onPress={() => toggleAlarm(item.id)}
          >
            <Ionicons 
              name={item.enabled ? 'alarm' : 'alarm-outline'} 
              size={28} 
              color={item.enabled ? '#4CAF50' : '#666'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAlarm(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Alarms</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alarm-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>No alarms set</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first alarm</Text>
        </View>
      ) : (
        <FlatList
          data={sortedAlarms}
          renderItem={renderAlarmItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-alarm')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.footerText}>India Standard Time (IST)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  alarmCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  alarmContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  labelText: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  nextAlarmText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
  },
  alarmActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  toggleButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  toggleButtonActive: {
    backgroundColor: '#1b3a1b',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});