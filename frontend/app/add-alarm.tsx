import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAlarms } from '../contexts/AlarmContext';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../utils/timeFormatter';
import { CircularTimePicker } from '../components/CircularTimePicker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AddAlarm() {
  const router = useRouter();
  const { addAlarm, settings } = useAlarms();
  
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [label, setLabel] = useState('');
  const [isPM, setIsPM] = useState(false);

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
  };

  const handleSave = async () => {
    let finalHour = hour;
    
    // Convert 12-hour format to 24-hour format
    if (!settings.use24Hour) {
      if (isPM && hour !== 12) {
        finalHour = hour + 12;
      } else if (!isPM && hour === 12) {
        finalHour = 0;
      }
    }

    await addAlarm({
      hour: finalHour,
      minute,
      enabled: true,
      label: label.trim() || undefined,
    });

    Alert.alert(
      'Alarm Set!',
      `Your alarm is set for ${formatTime(finalHour, minute, settings.use24Hour)}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const displayHour = settings.use24Hour ? hour : hour;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.timePickerContainer}>
          <Text style={styles.sectionTitle}>Set Time</Text>
          
          {/* Circular Time Pickers */}
          <View style={styles.circularPickers}>
            <CircularTimePicker
              value={hour}
              maxValue={settings.use24Hour ? 23 : 12}
              minValue={settings.use24Hour ? 0 : 1}
              onChange={handleHourChange}
              label="Hours"
              color="#4CAF50"
            />
            
            <CircularTimePicker
              value={minute}
              maxValue={59}
              minValue={0}
              onChange={handleMinuteChange}
              label="Minutes"
              color="#4CAF50"
            />
          </View>

          {/* AM/PM Toggle (only for 12-hour format) */}
          {!settings.use24Hour && (
            <View style={styles.ampmToggle}>
              <TouchableOpacity
                style={[styles.ampmButton, !isPM && styles.ampmButtonActive]}
                onPress={() => setIsPM(false)}
              >
                <Text style={[styles.ampmText, !isPM && styles.ampmTextActive]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmButton, isPM && styles.ampmButtonActive]}
                onPress={() => setIsPM(true)}
              >
                <Text style={[styles.ampmText, isPM && styles.ampmTextActive]}>PM</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.currentTimePreview}>
            <Ionicons name="time-outline" size={20} color="#999" />
            <Text style={styles.previewText}>
              Alarm will ring at {formatTime(
                settings.use24Hour ? hour : (isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour)),
                minute,
                settings.use24Hour
              )}
            </Text>
          </View>
        </View>

        <View style={styles.labelContainer}>
          <Text style={styles.sectionTitle}>Label (Optional)</Text>
          <TextInput
            style={styles.labelInput}
            placeholder="e.g., Wake up, Gym, Meeting"
            placeholderTextColor="#666"
            value={label}
            onChangeText={setLabel}
            maxLength={50}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            To stop the alarm, you'll need to type "yes i am awake" exactly.
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Alarm</Text>
        </TouchableOpacity>
      </ScrollView>
    </GestureHandlerRootView>
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
  timePickerContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 32,
    gap: 16,
  },
  timeColumn: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 12,
  },
  timeDisplay: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
    marginVertical: 8,
  },
  timeText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  timeSeparator: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 40,
  },
  ampmContainer: {
    gap: 8,
    marginTop: 40,
  },
  ampmButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  ampmButtonActive: {
    backgroundColor: '#4CAF50',
  },
  ampmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  ampmTextActive: {
    color: '#fff',
  },
  currentTimePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  previewText: {
    fontSize: 16,
    color: '#999',
  },
  labelContainer: {
    marginBottom: 32,
  },
  labelInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a3a1a',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});