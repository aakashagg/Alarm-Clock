import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlarmProvider } from '../contexts/AlarmContext';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request notification permissions on mount
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Notification permissions are required for alarms to work!');
    }
  };

  return (
    <SafeAreaProvider>
      <AlarmProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Alarms',
              headerRight: () => null,
            }} 
          />
          <Stack.Screen 
            name="add-alarm" 
            options={{ 
              title: 'Add Alarm',
              presentation: 'modal',
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: 'Settings',
            }} 
          />
          <Stack.Screen 
            name="ringing" 
            options={{ 
              title: 'Alarm',
              headerShown: false,
              presentation: 'fullScreenModal',
              gestureEnabled: false,
            }} 
          />
        </Stack>
      </AlarmProvider>
    </SafeAreaProvider>
  );
}