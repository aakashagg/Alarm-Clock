import * as Notifications from 'expo-notifications';
import { Alarm } from '../types/alarm';
import { format, addDays, setHours, setMinutes, setSeconds, isAfter } from 'date-fns';

// Get next trigger time for alarm in IST
const getNextTriggerTime = (alarm: Alarm): Date => {
  const now = new Date();
  
  // Create a date object for today with the alarm time
  let triggerDate = setSeconds(setMinutes(setHours(now, alarm.hour), alarm.minute), 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (!isAfter(triggerDate, now)) {
    triggerDate = addDays(triggerDate, 1);
  }
  
  return triggerDate;
};

export const scheduleAlarmNotification = async (alarm: Alarm): Promise<string | undefined> => {
  try {
    const triggerDate = getNextTriggerTime(alarm);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.label || 'Alarm',
        body: 'Time to wake up! Type "yes i am awake" to stop.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        data: {
          alarmId: alarm.id,
          type: 'alarm',
        },
      },
      trigger: {
        date: triggerDate,
        channelId: 'alarm',
      },
    });
    
    console.log(`Alarm ${alarm.id} scheduled for ${format(triggerDate, 'PPpp')}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling alarm:', error);
    return undefined;
  }
};

export const cancelAlarmNotification = async (alarmId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.alarmId === alarmId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        console.log(`Cancelled notification for alarm ${alarmId}`);
      }
    }
  } catch (error) {
    console.error('Error cancelling alarm:', error);
  }
};

export const cancelAllAlarms = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All alarms cancelled');
  } catch (error) {
    console.error('Error cancelling all alarms:', error);
  }
};