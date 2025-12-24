export interface Alarm {
  id: string;
  hour: number; // 0-23
  minute: number; // 0-59
  enabled: boolean;
  label?: string;
  days?: number[]; // 0 = Sunday, 1 = Monday, etc. Empty array = one-time alarm
}

export interface Settings {
  use24Hour: boolean;
  emergencyStopMinutes: number;
  vibrateEnabled: boolean;
}