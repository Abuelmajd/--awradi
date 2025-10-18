import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { Page, AppSettings, SelectedLocation } from '../types';
import { ArrowLeftIcon } from '../components/Icons';
import { SOUND_OPTIONS } from '../utils/sounds';

interface SettingsScreenProps {
  navigate: (page: Page, params?: any) => void;
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: any) => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`${
        enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
      } relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
      />
    </button>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigate, settings, onSettingChange }) => {
  // Location state is kept local as it's UI-specific
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationUpdateKey, setLocationUpdateKey] = useState(0);

  const currentLocationName = useMemo(() => {
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
  }, [locationUpdateKey]);

  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setLocationResults([]);
      return;
    }
    const debounce = setTimeout(async () => {
      setIsLocationLoading(true);
      setLocationError(null);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=5&accept-language=ar,en`);
        if (!response.ok) throw new Error('فشل البحث عن الموقع.');
        const data = await response.json();
        setLocationResults(data);
      } catch (err: any) {
        setLocationError(err.message);
      } finally {
        setIsLocationLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [locationQuery]);

  const handleSelectLocation = (location: any) => {
    const name = location.display_name.split(',')[0];
    const selectedLocation: SelectedLocation = {
      name: name,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon)
    };
    localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
    setIsSearchingLocation(false);
    setLocationQuery('');
    setLocationUpdateKey(k => k + 1);
  };

  const handleUseCurrentLocation = () => {
    localStorage.removeItem('selectedLocation');
    setIsSearchingLocation(false);
    setLocationQuery('');
    setLocationUpdateKey(k => k + 1);
  };

  const calculationMethods = [
    { key: 'MoonsightingCommittee', value: 'لجنة رؤية الهلال العالمية (موصى به)' },
    { key: 'Egyptian', value: 'الهيئة المصرية العامة للمساحة' },
    { key: 'Makkah', value: 'جامعة أم القرى بمكة المكرمة' },
    { key: 'Gulf', value: 'دول الخليج' },
    { key: 'MWL', value: 'رابطة العالم الإسلامي' },
    { key: 'ISNA', value: 'الجمعية الإسلامية لأمريكا الشمالية' },
    { key: 'Karachi', value: 'جامعة العلوم الإسلامية بكراتشي' },
    { key: 'Kuwait', value: 'الكويت' },
    { key: 'Qatar', value: 'قطر' },
    { key: 'Turkey', value: 'تركيا (ديانت)' },
    { key: 'Singapore', value: 'سنغافورة' },
    { key: 'France', value: 'فرنسا (UOIF)' },
    { key: 'Russia', value: 'روسيا' },
    { key: 'Tehran', value: 'معهد الجيوفيزياء بجامعة طهران' },
    { key: 'Jafari', value: 'الشيعة الاثني عشرية' },
  ];

  const madhabOptions = [
      { key: 'Shafi', value: 'شافعي، مالكي، حنبلي (قياسي)' },
      { key: 'Hanafi', value: 'حنفي' },
  ];

  const currentCalcMethodValue = calculationMethods.find(m => m.key === settings.calculationMethod)?.value || settings.calculationMethod;
  const currentMadhabValue = madhabOptions.find(m => m.key === settings.madhab)?.value || settings.madhab;
  const currentPrayerSoundValue = SOUND_OPTIONS.find(s => s.key === settings.prayerNotificationSound)?.value || 'افتراضي';
  const currentDuhaSoundValue = SOUND_OPTIONS.find(s => s.key === settings.duhaNotificationSound)?.value || 'افتراضي';
  const currentWirdSoundValue = SOUND_OPTIONS.find(s => s.key === settings.wirdNotificationSound)?.value || 'افتراضي';


  return (
    <div className="p-4">
      <Header title="الإعدادات" onBack={() => navigate('prayer')} />
      
      <div className="space-y-8 mt-4">
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">المظهر</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              {(['light', 'dark'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => onSettingChange('theme', themeOption)}
                  className={`w-1/2 p-2 rounded text-sm font-semibold transition-colors ${
                    settings.theme === themeOption
                      ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {themeOption === 'light' ? 'فاتح' : 'داكن'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">الموقع</h3>
           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">المدينة الحالية</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentLocationName}</p>
              </div>
              <button onClick={() => setIsSearchingLocation(!isSearchingLocation)} className="text-green-600 dark:text-green-400 font-semibold text-sm py-1 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10">
                {isSearchingLocation ? 'إلغاء' : 'تغيير'}
              </button>
            </div>
            {isSearchingLocation && (
              <div className="mt-4 border-t dark:border-gray-700 pt-4">
                <input
                  type="text"
                  placeholder="ابحث عن مدينة..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {isLocationLoading && <p className="p-2 text-gray-500 dark:text-gray-400 text-sm">جاري البحث...</p>}
                {locationError && <p className="p-2 text-red-500 text-sm">{locationError}</p>}
                <div className="mt-2 space-y-1">
                  {locationResults.map(res => (
                    <button key={res.place_id} onClick={() => handleSelectLocation(res)} className="w-full text-right p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                      {res.display_name}
                    </button>
                  ))}
                </div>
                {locationResults.length > 0 && <p className="text-xs text-gray-400 text-center mt-2">بيانات الموقع من © OpenStreetMap contributors</p>}
                <button onClick={handleUseCurrentLocation} className="w-full text-center p-2 mt-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                  العودة لاستخدام موقعي الحالي
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">الأذونات</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold">الوصول إلى الموقع</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">لأوقات صلاة دقيقة واتجاه القبلة.</p>
            </div>
            <ToggleSwitch 
              enabled={settings.locationAccess} 
              onChange={(value) => onSettingChange('locationAccess', value)} 
            />
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">الإشعارات</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">إشعارات وقت الصلاة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">تلقي إشعارات للصلوات.</p>
              </div>
              <ToggleSwitch 
                enabled={settings.prayerNotifications} 
                onChange={(value) => onSettingChange('prayerNotifications', value)} 
              />
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">تذكير الصلاة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">احصل على تذكير قبل كل صلاة.</p>
              </div>
              <ToggleSwitch 
                enabled={settings.prayerReminder} 
                onChange={(value) => onSettingChange('prayerReminder', value)} 
              />
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">تذكير صلاة الضحى</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">تلقي إشعار في وقت الضحى.</p>
              </div>
              <ToggleSwitch 
                enabled={settings.duhaReminder} 
                onChange={(value) => onSettingChange('duhaReminder', value)} 
              />
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">تذكيرات الأوراد</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">بعد الصلاة وللأوراد اليومية.</p>
              </div>
              <ToggleSwitch 
                enabled={settings.wirdNotifications} 
                onChange={(value) => onSettingChange('wirdNotifications', value)} 
              />
            </div>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">إشعارات صامتة</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">عرض الإشعارات بدون صوت أو اهتزاز.</p>
              </div>
              <ToggleSwitch 
                enabled={settings.silentNotifications} 
                onChange={(value) => onSettingChange('silentNotifications', value)} 
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">التفضيلات</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <button 
              onClick={() => navigate('selection', {
                  title: 'طريقة الحساب',
                  options: calculationMethods,
                  currentValue: settings.calculationMethod,
                  settingsKey: 'calculationMethod'
              })}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">طريقة الحساب</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span className="truncate max-w-xs">{currentCalcMethodValue}</span>
                <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
              </div>
            </button>
            <button
              onClick={() => navigate('selection', {
                  title: 'المذهب',
                  options: madhabOptions,
                  currentValue: settings.madhab,
                  settingsKey: 'madhab'
              })}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">المذهب</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>{currentMadhabValue}</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
            <button 
              onClick={() => navigate('prayer-adjustments')}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">تعديلات وقت الصلاة</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>تعديل</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
            <button 
              onClick={() => navigate('prayer-reminders')}
              className="w-full flex justify-between items-center p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">تذكيرات الصلاة المخصصة</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>تعديل</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400">الأصوات</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <button
              onClick={() => navigate('selection', {
                  title: 'صوت إشعار الصلاة',
                  options: SOUND_OPTIONS,
                  currentValue: settings.prayerNotificationSound,
                  settingsKey: 'prayerNotificationSound'
              })}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">صوت إشعار الصلاة</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>{currentPrayerSoundValue}</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
             <button
              onClick={() => navigate('selection', {
                  title: 'صوت تذكير صلاة الضحى',
                  options: SOUND_OPTIONS,
                  currentValue: settings.duhaNotificationSound,
                  settingsKey: 'duhaNotificationSound'
              })}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">صوت تذكير صلاة الضحى</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>{currentDuhaSoundValue}</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
            <button
              onClick={() => navigate('selection', {
                  title: 'صوت تذكير الأوراد',
                  options: SOUND_OPTIONS,
                  currentValue: settings.wirdNotificationSound,
                  settingsKey: 'wirdNotificationSound'
              })}
              className="w-full flex justify-between items-center p-4 text-right hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <p className="font-semibold">صوت تذكير الأوراد</p>
              <div className="flex items-center space-i-2 text-gray-500 dark:text-gray-400">
                <span>{currentWirdSoundValue}</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;