import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, Settings } from '../types/alarm';

const ALARMS_KEY = '@alarms';
const SETTINGS_KEY = '@settings';

const DEFAULT_SETTINGS: Settings = {
  use24Hour: false,
  emergencyStopMinutes: 10,
  vibrateEnabled: true,
};

export const loadAlarms = async (): Promise<Alarm[]> => {
  try {
    const data = await AsyncStorage.getItem(ALARMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading alarms:', error);
    return [];
  }
};

export const saveAlarms = async (alarms: Alarm[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
  } catch (error) {
    console.error('Error saving alarms:', error);
  }
};

export const loadSettings = async (): Promise<Settings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};