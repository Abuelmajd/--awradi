import React from 'react';
import Header from '../components/Header';
import { Page, PrayerName, PRAYER_NAMES, AppSettings } from '../types';
import { PlusIcon, MinusIcon } from '../components/Icons';

interface PrayerRemindersScreenProps {
  navigate: (page: Page) => void;
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: any) => void;
}

const PrayerRemindersScreen: React.FC<PrayerRemindersScreenProps> = ({ navigate, settings, onSettingChange }) => {

  const handleReminderChange = (prayer: Exclude<PrayerName, 'Duha'>, change: number) => {
    const reminders = settings.customPrayerReminders || {};
    const currentReminder = reminders[prayer] || 0;
    const newReminder = Math.max(0, Math.min(60, currentReminder + change)); // Cap between 0 and 60
    
    const newReminders = { ...reminders, [prayer]: newReminder };
    onSettingChange('customPrayerReminders', newReminders);
  };

  const prayersToAdjust: Exclude<PrayerName, 'Duha'>[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div>
      <Header title="تذكيرات الصلاة المخصصة" onBack={() => navigate('settings')} />
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
            <p>حدد عدد الدقائق قبل كل صلاة لتلقي تذكير. اضبط القيمة على 0 لإلغاء التذكير لهذه الصلاة.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {prayersToAdjust.map(prayerName => {
                const reminder = settings.customPrayerReminders?.[prayerName] || 0;
                return (
                    <div key={prayerName} className="flex justify-between items-center p-4 border-b dark:border-gray-700 last:border-b-0">
                        <p className="font-semibold text-lg">{PRAYER_NAMES[prayerName]}</p>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleReminderChange(prayerName, 1)}
                                disabled={reminder >= 60}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 hover:bg-green-200 dark:hover:bg-green-700 active:bg-green-300 disabled:opacity-50"
                                aria-label={`زيادة وقت التذكير لصلاة ${PRAYER_NAMES[prayerName]}`}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-lg w-20 text-center" dir="ltr">
                                {reminder > 0 ? `${reminder} دقيقة` : 'إيقاف'}
                            </span>
                             <button 
                                onClick={() => handleReminderChange(prayerName, -1)}
                                disabled={reminder === 0}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 hover:bg-red-200 dark:hover:bg-red-700 active:bg-red-300 disabled:opacity-50"
                                aria-label={`إنقاص وقت التذكير لصلاة ${PRAYER_NAMES[prayerName]}`}
                            >
                                <MinusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default PrayerRemindersScreen;
