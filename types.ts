export type PrayerName = 'Fajr' | 'Duha' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_NAMES: { [key in PrayerName]: string } = {
  Fajr: 'الفجر',
  Duha: 'الضحى',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const RAKAT_COUNT: { [key in PrayerName]: { count: number; text: string } } = {
  Fajr: { count: 2, text: 'ركعتان' },
  Duha: { count: 2, text: 'ركعتان' },
  Dhuhr: { count: 4, text: '٤ ركعات' },
  Asr: { count: 4, text: '٤ ركعات' },
  Maghrib: { count: 3, text: '٣ ركعات' },
  Isha: { count: 4, text: '٤ ركعات' },
};

export const DAYS_OF_WEEK: string[] = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export interface Prayer {
  name: PrayerName;
  time: string;
}

export interface PrayerStatus extends Prayer {
  isCurrent: boolean;
  isNext: boolean;
  completed: boolean;
}

export enum WirdType {
  DAILY = 'DAILY',
  PRAYER_LINKED = 'PRAYER_LINKED',
  DAY_SPECIFIC = 'DAY_SPECIFIC',
}

export interface Wird {
  id: number;
  name: string;
  type: WirdType;
  linkedPrayer?: PrayerName;
  specificDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
  target: number;
}

export interface WirdGroup {
  id: number;
  name: string;
  wirdIds: number[];
}

export interface WirdProgress extends Wird {
  current: number;
  history: WirdLog[];
}

export interface WirdLog {
  date: string; // YYYY-MM-DD
  completed: number;
}

export interface WirdReminder {
  enabled: boolean;
  time: string; // HH:mm
}

export type WirdReminders = {
  [wirdId: number]: WirdReminder;
};

export interface SelectedLocation {
  name: string;
  lat: number;
  lon: number;
}

export type PrayerAdjustments = {
  [key in Exclude<PrayerName, 'Duha'>]?: number;
};

export type CustomPrayerReminders = {
  [key in Exclude<PrayerName, 'Duha'>]?: number;
};

export interface AppSettings {
  locationAccess: boolean;
  prayerNotifications: boolean;
  prayerReminder: boolean;
  duhaReminder: boolean;
  wirdNotifications: boolean;
  silentNotifications: boolean;
  prayerNotificationSound: string;
  duhaNotificationSound: string;
  wirdNotificationSound: string;
  calculationMethod: string;
  madhab: string;
  prayerAdjustments: PrayerAdjustments;
  customPrayerReminders: CustomPrayerReminders;
  theme: 'light' | 'dark';
}

export interface AdhkarItem {
  text: string;
  count: number | string;
  note?: string;
}

export type AdhkarCategoryIcon = 'sun' | 'moon' | 'shield' | 'mosque_enter' | 'mosque_leave' | 'home_enter' | 'home_leave' | 'sleep' | 'toilet_enter' | 'toilet_leave' | 'wakeup' | 'misc';


export interface AdhkarCategory {
  slug: string;
  title: string;
  icon: AdhkarCategoryIcon;
  items: AdhkarItem[];
}


export type Page = 'prayer' | 'qibla' | 'settings' | 'awrad' | 'add-wird' | 'wird-detail' | 'prayer-detail' | 'selection' | 'prayer-adjustments' | 'edit-wird' | 'add-wird-group' | 'edit-wird-group' | 'prayer-reminders' | 'add-wirds-to-group' | 'adhkar' | 'adhkar-details';