import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, BackHandler, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useAlarms } from '../contexts/AlarmContext';
import { formatTime } from '../utils/timeFormatter';

const REQUIRED_PHRASE = 'yes i am awake';

export default function RingingScreen() {
  const router = useRouter();
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const { alarms, settings, updateAlarm } = useAlarms();
  
  const [inputText, setInputText] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const emergencyTimerRef = useRef<NodeJS.Timeout | null>(null);

  const alarm = alarms.find(a => a.id === alarmId);

  useEffect(() => {
    // Prevent back button from dismissing alarm on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent default back behavior
    });

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Track elapsed time
    const elapsedInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Start playing alarm sound
    playAlarmSound();

    // Vibrate
    if (settings.vibrateEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Emergency stop timer
    const emergencyMs = settings.emergencyStopMinutes * 60 * 1000;
    emergencyTimerRef.current = setTimeout(() => {
      handleEmergencyStop();
    }, emergencyMs);

    return () => {
      backHandler.remove();
      clearInterval(timeInterval);
      clearInterval(elapsedInterval);
      if (emergencyTimerRef.current) {
        clearTimeout(emergencyTimerRef.current);
      }
      stopAlarmSound();
    };
  }, []);

  const playAlarmSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });

      // Load alarm sound from environment variable
      const alarmSoundUrl = process.env.EXPO_PUBLIC_ALARM_SOUND_URL;
      
      if (!alarmSoundUrl) {
        console.error('EXPO_PUBLIC_ALARM_SOUND_URL is not configured');
        // Fallback to vibration if sound URL not configured
        if (settings.vibrateEnabled) {
          const vibrateInterval = setInterval(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 1000);
          // @ts-ignore
          soundRef.current = { stopAsync: () => clearInterval(vibrateInterval) };
        }
        return;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: alarmSoundUrl },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback to vibration if sound fails
      if (settings.vibrateEnabled) {
        const vibrateInterval = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 1000);
        // @ts-ignore
        soundRef.current = { stopAsync: () => clearInterval(vibrateInterval) };
      }
    }
  };

  const stopAlarmSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };

  const handleEmergencyStop = async () => {
    await stopAlarmSound();
    Alert.alert(
      'Alarm Auto-Stopped',
      `Alarm automatically stopped after ${settings.emergencyStopMinutes} minutes.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleSubmit = async () => {
    const trimmedInput = inputText.trim().toLowerCase();
    
    if (trimmedInput === REQUIRED_PHRASE) {
      // Correct phrase entered
      await stopAlarmSound();
      
      // Disable the alarm (one-time alarm)
      if (alarm) {
        await updateAlarm(alarm.id, { enabled: false });
      }

      Alert.alert(
        'Good Morning!',
        'You\'re awake! Have a great day!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      // Incorrect phrase
      setAttempts(prev => prev + 1);
      setInputText('');
      
      // Provide haptic feedback for error
      if (settings.vibrateEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      Alert.alert(
        'Incorrect!',
        `Please type exactly: "${REQUIRED_PHRASE}"`,
        [{ text: 'Try Again' }]
      );
    }
  };

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with time */}
      <View style={styles.header}>
        <Ionicons name="alarm" size={48} color="#f44336" />
        <Text style={styles.currentTime}>
          {formatTime(currentTime.getHours(), currentTime.getMinutes(), settings.use24Hour)}
        </Text>
        <Text style={styles.currentDate}>
          {currentTime.toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Alarm Info */}
      <View style={styles.alarmInfo}>
        <Text style={styles.alarmLabel}>
          {alarm?.label || 'Alarm'}
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="time-outline" size={20} color="#999" />
            <Text style={styles.statusText}>Ringing for {formatElapsedTime(elapsedSeconds)}</Text>
          </View>
          {attempts > 0 && (
            <View style={styles.statusItem}>
              <Ionicons name="close-circle-outline" size={20} color="#f44336" />
              <Text style={styles.statusText}>{attempts} wrong attempts</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main instruction */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionTitle}>To Stop This Alarm</Text>
        <Text style={styles.instructionText}>
          Type the following phrase exactly:
        </Text>
        <View style={styles.phraseBox}>
          <Text style={styles.phraseText}>{REQUIRED_PHRASE}</Text>
        </View>
        <Text style={styles.warningText}>
          ⚠️ Copy-paste is disabled. You must type it manually.
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type here..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
          contextMenuHidden={true} // Disable copy-paste menu
          selectTextOnFocus={false}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[styles.submitButton, !inputText.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!inputText.trim()}
        >
          <Text style={styles.submitButtonText}>Stop Alarm</Text>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Emergency info */}
      <View style={styles.emergencyInfo}>
        <Ionicons name="information-circle-outline" size={16} color="#ff9800" />
        <Text style={styles.emergencyText}>
          Alarm will auto-stop in {settings.emergencyStopMinutes - Math.floor(elapsedSeconds / 60)} minutes
        </Text>
      </View>

      {/* Audio indicator */}
      {isPlaying && (
        <View style={styles.audioIndicator}>
          <View style={[styles.audioWave, styles.audioWave1]} />
          <View style={[styles.audioWave, styles.audioWave2]} />
          <View style={[styles.audioWave, styles.audioWave3]} />
          <View style={[styles.audioWave, styles.audioWave4]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
  },
  currentTime: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    fontVariant: ['tabular-nums'],
  },
  currentDate: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  alarmInfo: {
    alignItems: 'center',
  },
  alarmLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#999',
  },
  instructionBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  phraseBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  phraseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  warningText: {
    fontSize: 12,
    color: '#ff9800',
    textAlign: 'center',
  },
  inputSection: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#2a2a2a',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emergencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 24,
  },
  emergencyText: {
    fontSize: 12,
    color: '#ff9800',
  },
  audioIndicator: {
    position: 'absolute',
    top: 16,
    right: 24,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  audioWave: {
    width: 4,
    backgroundColor: '#f44336',
    borderRadius: 2,
  },
  audioWave1: {
    height: 12,
  },
  audioWave2: {
    height: 20,
  },
  audioWave3: {
    height: 16,
  },
  audioWave4: {
    height: 12,
  },
});
