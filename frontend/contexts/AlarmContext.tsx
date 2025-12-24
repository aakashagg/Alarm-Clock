import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alarm, Settings } from '../types/alarm';
import { loadAlarms, saveAlarms, loadSettings, saveSettings } from '../utils/alarmStorage';
import { scheduleAlarmNotification, cancelAlarmNotification } from '../utils/alarmScheduler';

interface AlarmContextType {
  alarms: Alarm[];
  settings: Settings;
  addAlarm: (alarm: Omit<Alarm, 'id'>) => Promise<void>;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshAlarms: () => Promise<void>;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [settings, setSettings] = useState<Settings>({
    use24Hour: false,
    emergencyStopMinutes: 10,
    vibrateEnabled: true,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const loadedAlarms = await loadAlarms();
    const loadedSettings = await loadSettings();
    setAlarms(loadedAlarms);
    setSettings(loadedSettings);
  };

  const refreshAlarms = async () => {
    const loadedAlarms = await loadAlarms();
    setAlarms(loadedAlarms);
  };

  const addAlarm = async (alarmData: Omit<Alarm, 'id'>) => {
    const newAlarm: Alarm = {
      ...alarmData,
      id: Date.now().toString(),
    };
    
    const updatedAlarms = [...alarms, newAlarm];
    await saveAlarms(updatedAlarms);
    setAlarms(updatedAlarms);

    // Schedule notification if alarm is enabled
    if (newAlarm.enabled) {
      await scheduleAlarmNotification(newAlarm);
    }
  };

  const updateAlarm = async (id: string, updates: Partial<Alarm>) => {
    const updatedAlarms = alarms.map(alarm => 
      alarm.id === id ? { ...alarm, ...updates } : alarm
    );
    await saveAlarms(updatedAlarms);
    setAlarms(updatedAlarms);

    // Reschedule notification
    const updatedAlarm = updatedAlarms.find(a => a.id === id);
    if (updatedAlarm) {
      await cancelAlarmNotification(id);
      if (updatedAlarm.enabled) {
        await scheduleAlarmNotification(updatedAlarm);
      }
    }
  };

  const deleteAlarm = async (id: string) => {
    const updatedAlarms = alarms.filter(alarm => alarm.id !== id);
    await saveAlarms(updatedAlarms);
    setAlarms(updatedAlarms);
    await cancelAlarmNotification(id);
  };

  const toggleAlarm = async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
      await updateAlarm(id, { enabled: !alarm.enabled });
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    await saveSettings(updated);
    setSettings(updated);
  };

  return (
    <AlarmContext.Provider value={{
      alarms,
      settings,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      updateSettings,
      refreshAlarms,
    }}>
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarms = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarms must be used within AlarmProvider');
  }
  return context;
};