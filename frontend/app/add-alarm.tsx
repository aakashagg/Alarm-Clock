import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAlarms } from '../contexts/AlarmContext';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../utils/timeFormatter';

export default function AddAlarm() {
  const router = useRouter();
  const { addAlarm, settings } = useAlarms();
  
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [label, setLabel] = useState('');
  const [isPM, setIsPM] = useState(false);

  const handleHourChange = (increment: boolean) => {
    if (settings.use24Hour) {
      let newHour = increment ? hour + 1 : hour - 1;
      if (newHour > 23) newHour = 0;
      if (newHour < 0) newHour = 23;
      setHour(newHour);
    } else {
      let newHour = increment ? hour + 1 : hour - 1;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      setHour(newHour);
    }
  };

  const handleMinuteChange = (increment: boolean) => {
    let newMinute = increment ? minute + 1 : minute - 1;
    if (newMinute > 59) newMinute = 0;
    if (newMinute < 0) newMinute = 59;
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.timePickerContainer}>
        <Text style={styles.sectionTitle}>Set Time</Text>
        
        <View style={styles.timePicker}>
          {/* Hour Picker */}
          <View style={styles.timeColumn}>
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => handleHourChange(true)}
            >
              <Ionicons name="chevron-up" size={32} color="#4CAF50" />
            </TouchableOpacity>
            
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {displayHour.toString().padStart(2, '0')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => handleHourChange(false)}
            >
              <Ionicons name="chevron-down" size={32} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          {/* Minute Picker */}
          <View style={styles.timeColumn}>
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => handleMinuteChange(true)}
            >
              <Ionicons name="chevron-up" size={32} color="#4CAF50" />
            </TouchableOpacity>
            
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {minute.toString().padStart(2, '0')}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.arrowButton}
              onPress={() => handleMinuteChange(false)}
            >
              <Ionicons name="chevron-down" size={32} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {/* AM/PM Toggle (only for 12-hour format) */}
          {!settings.use24Hour && (
            <View style={styles.timeColumn}>
              <View style={styles.ampmContainer}>
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
            </View>
          )}
        </View>

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