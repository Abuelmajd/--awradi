import React from 'react';
import Header from '../components/Header';
import { Page, PrayerName, PRAYER_NAMES, PrayerAdjustments, AppSettings } from '../types';
import { PlusIcon, MinusIcon } from '../components/Icons';

interface PrayerAdjustmentsScreenProps {
  navigate: (page: Page) => void;
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: any) => void;
}

const PrayerAdjustmentsScreen: React.FC<PrayerAdjustmentsScreenProps> = ({ navigate, settings, onSettingChange }) => {

  const handleAdjustmentChange = (prayer: Exclude<PrayerName, 'Duha'>, change: number) => {
    const adjustments = settings.prayerAdjustments || {};
    const currentAdjustment = adjustments[prayer] || 0;
    const newAdjustment = currentAdjustment + change;
    const newAdjustments = { ...adjustments, [prayer]: newAdjustment };
    onSettingChange('prayerAdjustments', newAdjustments);
  };

  const prayersToAdjust: Exclude<PrayerName, 'Duha'>[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <div>
      <Header title="تعديلات وقت الصلاة" onBack={() => navigate('settings')} />
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm">
            <p>يمكنك تعديل أوقات الصلاة بالدقائق (إضافة أو إنقاص). استخدم هذا بحذر وعند الحاجة فقط.</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {prayersToAdjust.map(prayerName => {
                const adjustment = settings.prayerAdjustments[prayerName] || 0;
                return (
                    <div key={prayerName} className="flex justify-between items-center p-4 border-b dark:border-gray-700 last:border-b-0">
                        <p className="font-semibold text-lg">{PRAYER_NAMES[prayerName]}</p>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => handleAdjustmentChange(prayerName, 1)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 hover:bg-green-200 dark:hover:bg-green-700 active:bg-green-300"
                                aria-label={`زيادة دقيقة لوقت صلاة ${PRAYER_NAMES[prayerName]}`}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-lg w-12 text-center" dir="ltr">
                                {adjustment > 0 ? `+${adjustment}` : adjustment}
                            </span>
                             <button 
                                onClick={() => handleAdjustmentChange(prayerName, -1)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-200 hover:bg-red-200 dark:hover:bg-red-700 active:bg-red-300"
                                aria-label={`إنقاص دقيقة من وقت صلاة ${PRAYER_NAMES[prayerName]}`}

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

export default PrayerAdjustmentsScreen;