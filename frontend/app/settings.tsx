import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useAlarms } from '../contexts/AlarmContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Settings() {
  const { settings, updateSettings } = useAlarms();
  const [emergencyMinutes, setEmergencyMinutes] = useState(settings.emergencyStopMinutes);

  const handleEmergencyTimeChange = (minutes: number) => {
    setEmergencyMinutes(minutes);
    updateSettings({ emergencyStopMinutes: minutes });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="time-outline" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>24-Hour Format</Text>
              <Text style={styles.settingDescription}>
                {settings.use24Hour ? 'Show time as 23:00' : 'Show time as 11:00 PM'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.use24Hour}
            onValueChange={(value) => updateSettings({ use24Hour: value })}
            trackColor={{ false: '#2a2a2a', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Behavior</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait-outline" size={24} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Vibrate</Text>
              <Text style={styles.settingDescription}>
                Vibrate when alarm rings
              </Text>
            </View>
          </View>
          <Switch
            value={settings.vibrateEnabled}
            onValueChange={(value) => updateSettings({ vibrateEnabled: value })}
            trackColor={{ false: '#2a2a2a', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Stop</Text>
        <Text style={styles.sectionDescription}>
          Alarm will automatically stop after the selected duration if you don't dismiss it.
        </Text>
        
        <View style={styles.timeOptions}>
          {[5, 10, 15, 20].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timeOption,
                emergencyMinutes === minutes && styles.timeOptionActive
              ]}
              onPress={() => handleEmergencyTimeChange(minutes)}
            >
              <Text style={[
                styles.timeOptionText,
                emergencyMinutes === minutes && styles.timeOptionTextActive
              ]}>
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={48} color="#4CAF50" />
        <Text style={styles.infoTitle}>About This App</Text>
        <Text style={styles.infoText}>
          This alarm clock ensures you're truly awake by requiring you to type "yes i am awake" to stop the alarm.
        </Text>
        <View style={styles.infoBox}>
          <Ionicons name="location-outline" size={20} color="#999" />
          <Text style={styles.infoBoxText}>Time Zone: India (IST, UTC+5:30)</Text>
        </View>
      </View>

      <View style={styles.warningSection}>
        <Ionicons name="battery-charging-outline" size={24} color="#ff9800" />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Battery Optimization</Text>
          <Text style={styles.warningText}>
            For reliable alarms, disable battery optimization for this app in your device settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#999',
  },
  timeOptions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  timeOption: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  timeOptionActive: {
    backgroundColor: '#1a3a1a',
    borderColor: '#4CAF50',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  timeOptionTextActive: {
    color: '#4CAF50',
  },
  infoSection: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#999',
  },
  warningSection: {
    flexDirection: 'row',
    backgroundColor: '#2a1a0a',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#ffb84d',
    lineHeight: 20,
  },
});