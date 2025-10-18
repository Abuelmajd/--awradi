import React, { useState } from 'react';
import Header from '../components/Header';
import { Page, WirdType, PrayerName, PRAYER_NAMES, Wird, DAYS_OF_WEEK } from '../types';
import { PersonLinkedIcon, BookOpenIcon, CalendarDaysIcon } from '../components/Icons';

interface AddWirdScreenProps {
  navigate: (page: Page) => void;
  onAddWird: (wird: Omit<Wird, 'id'>, targetGroupId?: number) => void;
  targetGroupId?: number;
}

const AddWirdScreen: React.FC<AddWirdScreenProps> = ({ navigate, onAddWird, targetGroupId }) => {
  const [wirdName, setWirdName] = useState('');
  const [wirdType, setWirdType] = useState<WirdType>(WirdType.DAILY);
  const [linkedPrayer, setLinkedPrayer] = useState<PrayerName>('Fajr');
  const [specificDays, setSpecificDays] = useState<Set<number>>(new Set());
  const [target, setTarget] = useState(33);

  const handleToggleDay = (dayIndex: number) => {
    setSpecificDays(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dayIndex)) {
            newSet.delete(dayIndex);
        } else {
            newSet.add(dayIndex);
        }
        return newSet;
    });
  };

  const handleSave = () => {
    if (!wirdName) {
      return;
    }

    const newWirdData: Omit<Wird, 'id'> = {
      name: wirdName,
      type: wirdType,
      linkedPrayer: wirdType === WirdType.PRAYER_LINKED ? linkedPrayer : undefined,
      specificDays: wirdType === WirdType.DAY_SPECIFIC ? Array.from(specificDays) : undefined,
      target: target,
    };
    
    onAddWird(newWirdData, targetGroupId);
    navigate('awrad');
  };

  const getWirdTypeDisplay = () => {
    switch(wirdType) {
        case WirdType.PRAYER_LINKED:
            return `مرتبط بصلاة ${PRAYER_NAMES[linkedPrayer]}`;
        case WirdType.DAY_SPECIFIC:
            // FIX: Explicitly type `d` as a number to avoid potential type inference issues.
            const dayNames = Array.from(specificDays).sort().map((d: number) => DAYS_OF_WEEK[d]).join('، ');
            return dayNames ? `أيام: ${dayNames}` : 'لم يتم تحديد أيام';
        default:
            return 'ورد يومي عام';
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Header title="إضافة ورد جديد" onBack={() => navigate('awrad')} />
      <div className="flex-grow p-4 space-y-6 overflow-y-auto">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">اسم الورد</label>
          <input
            type="text"
            value={wirdName}
            onChange={(e) => setWirdName(e.target.value)}
            placeholder="مثال: استغفار"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">نوع الورد</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setWirdType(WirdType.PRAYER_LINKED)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${wirdType === WirdType.PRAYER_LINKED ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            >
              <PersonLinkedIcon className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400 mb-1" />
              <p className="font-semibold text-sm">بعد الصلاة</p>
            </button>
             <button
              onClick={() => setWirdType(WirdType.DAY_SPECIFIC)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${wirdType === WirdType.DAY_SPECIFIC ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            >
              <CalendarDaysIcon className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400 mb-1" />
              <p className="font-semibold text-sm">يوم معين</p>
            </button>
            <button
              onClick={() => setWirdType(WirdType.DAILY)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${wirdType === WirdType.DAILY ? 'border-green-500 bg-green-50 dark:bg-green-500/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
            >
              <BookOpenIcon className="w-6 h-6 mx-auto text-gray-500 dark:text-gray-400 mb-1" />
              <p className="font-semibold text-sm">يومي عام</p>
            </button>
          </div>
        </div>

        {wirdType === WirdType.PRAYER_LINKED && (
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">ربط بالصلاة</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PRAYER_NAMES) as PrayerName[]).map((prayer) => (
                <button
                  key={prayer}
                  onClick={() => setLinkedPrayer(prayer)}
                  className={`p-3 rounded-lg text-sm font-semibold transition-colors ${linkedPrayer === prayer ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                >
                  {PRAYER_NAMES[prayer]}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {wirdType === WirdType.DAY_SPECIFIC && (
            <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">تحديد الأيام</label>
                <div className="grid grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                         <button
                            key={index}
                            onClick={() => handleToggleDay(index)}
                            className={`p-3 rounded-lg text-sm font-semibold transition-colors ${specificDays.has(index) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 mb-2 block">العدد المستهدف</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseInt(e.target.value, 10) || 0)}
            placeholder="مثال: 100"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <button 
          onClick={handleSave}
          className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
          disabled={!wirdName || (wirdType === WirdType.DAY_SPECIFIC && specificDays.size === 0)}
        >
          حفظ الورد
        </button>
      </div>
    </div>
  );
};

export default AddWirdScreen;