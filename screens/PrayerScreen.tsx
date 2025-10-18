import React, { useState, useEffect, useMemo } from 'react';
import usePrayerTimes from '../hooks/usePrayerTimes';
import { Page, PRAYER_NAMES, SelectedLocation } from '../types';
import { SunIcon, MoonIcon, BellIcon, ChartIcon, StreakIcon, SoundOnIcon, CheckCircleIcon, SettingsIcon, MapPinIcon } from '../components/Icons';

interface PrayerScreenProps {
  navigate: (page: Page, params?: any) => void;
}

const PrayerTimeItem: React.FC<{ prayer: any; isCurrent: boolean, isNext: boolean, onClick: () => void }> = ({ prayer, isCurrent, isNext, onClick }) => {
  const getIcon = () => {
    switch (prayer.name) {
      case 'Fajr':
      case 'Duha':
      case 'Dhuhr':
      case 'Asr':
        return <SunIcon className="w-6 h-6" />;
      case 'Maghrib':
        return <BellIcon className="w-6 h-6" />;
      case 'Isha':
        return <MoonIcon className="w-6 h-6" />;
      default:
        return <SunIcon className="w-6 h-6" />;
    }
  };

  const getStyleClasses = () => {
    if (isNext) {
        return 'bg-green-500 text-white shadow-lg';
    }
    if (isCurrent) {
        return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };
  
  const iconBgClass = isNext ? 'bg-white/20' : isCurrent ? 'bg-yellow-200 dark:bg-yellow-400/20' : 'bg-white dark:bg-gray-700';
  const timeTextClass = isNext ? 'text-white/80' : isCurrent ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400';


  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${getStyleClasses()}`}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${iconBgClass}`}>{getIcon()}</div>
        <div className="ms-4">
          <p className="font-bold text-lg">{PRAYER_NAMES[prayer.name]}</p>
          <p className={`text-sm ${timeTextClass}`}>{prayer.time}</p>
        </div>
      </div>
      {isNext && <SoundOnIcon className="w-6 h-6" />}
    </div>
  );
};

const LocationDisplay: React.FC = () => {
    const locationName = useMemo(() => {
      const savedLocationRaw = localStorage.getItem('selectedLocation');
      if (savedLocationRaw) {
        try {
          const savedLocation: SelectedLocation = JSON.parse(savedLocationRaw);
          return savedLocation.name;
        } catch (e) {
          return 'موقعي الحالي';
        }
      }
      return 'موقعي الحالي';
    }, []);

    return (
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm text-center text-gray-700 dark:text-gray-300">
            <p>مواقيت الصلاة لـ: <strong className="font-bold">{locationName}</strong></p>
        </div>
    );
};


const PrayerScreen: React.FC<PrayerScreenProps> = ({ navigate }) => {
  const { prayerTimes, nextPrayer, timeToNextPrayer, loading, error } = usePrayerTimes();
  const [duhaCompleted, setDuhaCompleted] = useState(false);
  
  // Load and save Duha completion status from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const naflLog = JSON.parse(localStorage.getItem('naflLog') || '{}');
    if (naflLog[today] && naflLog[today].Duha) {
      setDuhaCompleted(true);
    } else {
      setDuhaCompleted(false);
    }
  }, []);

  const handleToggleDuha = () => {
    const today = new Date().toISOString().split('T')[0];
    const naflLog = JSON.parse(localStorage.getItem('naflLog') || '{}');
    if (!naflLog[today]) {
      naflLog[today] = {};
    }
    const newStatus = !duhaCompleted;
    naflLog[today].Duha = newStatus;
    localStorage.setItem('naflLog', JSON.stringify(naflLog));
    setDuhaCompleted(newStatus);
  };

  const currentPrayer = prayerTimes.find(p => p.isCurrent);

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div className="w-8"></div>
        <h1 className="text-xl font-bold">الصلاة</h1>
        <button onClick={() => navigate('settings')} className="text-gray-500 dark:text-gray-400 p-2">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>
      
      <LocationDisplay />

      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-20">
          <p>جاري تحميل مواقيت الصلاة...</p>
        </div>
      )}

      {error === 'NO_LOCATION_SET' && !loading && (
        <div className="text-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl mt-6">
            <MapPinIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">اختر موقعك</h3>
            <p>الرجاء تحديد موقعك في شاشة الإعدادات لعرض أوقات الصلاة.</p>
        </div>
      )}

      {error && error !== 'NO_LOCATION_SET' && (
        <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-lg">
          <p className="font-bold">حدث خطأ</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && prayerTimes.length > 0 && (
        <>
          {nextPrayer ? (
            <div className="bg-green-50 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-6 rounded-2xl text-center shadow-md">
              <p className="text-sm">الصلاة القادمة</p>
              <h2 className="text-4xl font-bold dark:text-green-200">{PRAYER_NAMES[nextPrayer.name]}</h2>
              <p className="text-lg mt-1">{nextPrayer.time}</p>
              <div className="mt-4">
                <p className="text-sm">يتبقى حتى الأذان</p>
                <p className="text-2xl font-bold tracking-wider mt-1">
                  {String(timeToNextPrayer.hours).padStart(2, '0')}:
                  {String(timeToNextPrayer.minutes).padStart(2, '0')}:
                  {String(timeToNextPrayer.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          ) : currentPrayer && (
              <div className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 p-6 rounded-2xl text-center shadow-md">
                   <h2 className="text-4xl font-bold dark:text-yellow-200">{PRAYER_NAMES[currentPrayer.name]}</h2>
                   <p className="text-lg mt-1">{currentPrayer.time}</p>
                   <p className="mt-4 text-sm">وقت الصلاة الحالي</p>
              </div>
          )}

          <div className="space-y-3">
            {prayerTimes.map((prayer) => (
              <PrayerTimeItem 
                key={prayer.name} 
                prayer={prayer} 
                isCurrent={prayer.isCurrent}
                isNext={prayer.isNext}
                onClick={() => navigate('prayer-detail', { prayer: prayer.name })}
              />
            ))}
          </div>

          <div>
            <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-3">نوافل اليوم</h2>
            <div 
              onClick={handleToggleDuha}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between ${
                duhaCompleted 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900/70 dark:text-yellow-300 dark:border-yellow-500/30'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${duhaCompleted ? 'bg-white/20' : 'bg-white dark:bg-gray-700'}`}>
                  <SunIcon className={`w-6 h-6 ${duhaCompleted ? 'text-white' : 'text-yellow-600'}`} />
                </div>
                <div className="ms-4">
                  <p className="font-bold text-lg">صلاة الضحى</p>
                  <p className={`text-sm ${duhaCompleted ? 'text-white/80' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    صدقة عن كل مفصل
                  </p>
                </div>
              </div>
              {duhaCompleted && (
                <CheckCircleIcon className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl flex justify-around items-center">
              <div className="text-center">
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <StreakIcon className="w-6 h-6" />
                      <p className="ms-2 font-semibold">أيام متتالية</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">30</p>
              </div>
              <div className="border-r border-gray-300 dark:border-gray-600 h-12"></div>
              <div className="text-center">
                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <ChartIcon className="w-6 h-6" />
                      <p className="ms-2 font-semibold">معدل الإتمام</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">95%</p>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrayerScreen;