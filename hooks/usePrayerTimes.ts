import { useState, useEffect, useRef } from 'react';
import useGeolocation from './useGeolocation';
import { Prayer, PrayerName, PRAYER_NAMES, PrayerStatus, Wird, SelectedLocation, PrayerAdjustments, AppSettings, WirdType, DAYS_OF_WEEK, WirdReminders } from '../types';
import { playSound } from '../utils/sounds';

const applyAdjustment = (time: string, minutes?: number): string => {
  if (!time || minutes === undefined || minutes === 0) {
    return time;
  }
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  
  const newHours = String(date.getHours()).padStart(2, '0');
  const newMins = String(date.getMinutes()).padStart(2, '0');
  
  return `${newHours}:${newMins}`;
};

const defaultSettings: Partial<AppSettings> = {
  wirdNotifications: true,
  duhaReminder: false,
  silentNotifications: false,
  prayerNotificationSound: 'default',
  duhaNotificationSound: 'default',
  wirdNotificationSound: 'default',
  prayerReminder: false,
  customPrayerReminders: {},
};

const getSettings = (): Partial<AppSettings> => {
  const savedSettingsRaw = localStorage.getItem('appSettings');
  if (savedSettingsRaw) {
    try {
      return { ...defaultSettings, ...JSON.parse(savedSettingsRaw) };
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }
  return defaultSettings;
};


const usePrayerTimes = () => {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const [prayerTimes, setPrayerTimes] = useState<PrayerStatus[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerStatus | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [currentPrayerName, setCurrentPrayerName] = useState<PrayerName | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [basePrayerTimes, setBasePrayerTimes] = useState<Prayer[]>([]);
  const [duhaNotificationTime, setDuhaNotificationTime] = useState<Date | null>(null);
  const timezoneOffset = useRef<string | null>(null);
  
  const settingsFromStorage = localStorage.getItem('appSettings');
  const locationFromStorage = localStorage.getItem('selectedLocation');


  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      setError(null);

      const locationData: SelectedLocation | null = locationFromStorage ? JSON.parse(locationFromStorage) : null;
      const lat = locationData?.lat ?? latitude;
      const lon = locationData?.lon ?? longitude;

      if (!lat || !lon) {
        if (geoLoading) {
            // Geolocation is still running, so we wait.
            return;
        }
        // If no location is set from storage or geolocation, prompt the user to set one.
        setError('NO_LOCATION_SET');
        setLoading(false);
        setPrayerTimes([]);
        setBasePrayerTimes([]);
        return;
      }

      const savedSettingsRaw = localStorage.getItem('appSettings');
      let settings = { 
        calculationMethod: 'Egyptian', 
        madhab: 'Shafi',
        prayerAdjustments: {} 
      };
      if (savedSettingsRaw) {
        try {
          settings = { ...settings, ...JSON.parse(savedSettingsRaw) };
        } catch (e) { console.error("Failed to parse settings", e); }
      }

      const methodMap: { [key: string]: number } = { 
          'MWL': 3, 
          'ISNA': 2, 
          'Egyptian': 5, 
          'Makkah': 4, 
          'Karachi': 1, 
          'Tehran': 7, 
          'Jafari': 0,
          'Gulf': 8,
          'Kuwait': 9,
          'Qatar': 10,
          'Singapore': 11,
          'France': 12,
          'Turkey': 13,
          'Russia': 14,
          'MoonsightingCommittee': 15,
      };
      const schoolMap: { [key: string]: number } = { 'Shafi': 0, 'Hanafi': 1 };
      const method = methodMap[settings.calculationMethod] || 5; // Default to Egyptian
      const school = schoolMap[settings.madhab] || 0;

      try {
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}&school=${school}`);
        if (!response.ok) throw new Error('فشل في جلب مواقيت الصلاة من الشبكة.');
        
        const data = await response.json();
        if (data.code !== 200) throw new Error(data.data || 'حدث خطأ أثناء جلب مواقيت الصلاة.');

        const timings = data.data.timings;
        const timezone = data.data.meta.timezone;

        if (timings.Sunrise) {
            const sunriseTime = timings.Sunrise.substring(0, 5);
            const [hours, mins] = sunriseTime.split(':').map(Number);
            const duhaReminderDate = new Date();
            duhaReminderDate.setHours(hours, mins, 0, 0);
            duhaReminderDate.setMinutes(duhaReminderDate.getMinutes() + 20);
            setDuhaNotificationTime(duhaReminderDate);
        }

        // More robust timezone offset calculation
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            timeZoneName: 'longOffset',
        });
        const parts = formatter.formatToParts(now);
        const gmtPart = parts.find(p => p.type === 'timeZoneName');
        let offsetString = '+00:00';
        if (gmtPart) {
            const match = gmtPart.value.match(/GMT([+-])(\d+):?(\d+)?/);
            if (match) {
                const [_, sign, hours, minutes] = match;
                offsetString = `${sign}${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
            }
        }
        timezoneOffset.current = offsetString;
        
        const adjustments: PrayerAdjustments = settings.prayerAdjustments || {};

        const fetchedPrayersRaw = [
          { name: 'Fajr', time: timings.Fajr.substring(0, 5) },
          { name: 'Dhuhr', time: timings.Dhuhr.substring(0, 5) },
          { name: 'Asr', time: timings.Asr.substring(0, 5) },
          { name: 'Maghrib', time: timings.Maghrib.substring(0, 5) },
          { name: 'Isha', time: timings.Isha.substring(0, 5) },
        ];
        
        const fetchedPrayers: Prayer[] = fetchedPrayersRaw.map(p => ({
            name: p.name as PrayerName,
            time: applyAdjustment(p.time, adjustments[p.name as Exclude<PrayerName, 'Duha'>])
        }));
        
        setBasePrayerTimes(fetchedPrayers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [latitude, longitude, geoError, geoLoading, settingsFromStorage, locationFromStorage]);

  useEffect(() => {
    if (basePrayerTimes.length === 0 || !timezoneOffset.current) return;

    const interval = setInterval(() => {
      const prayerLog = JSON.parse(localStorage.getItem('prayerLog') || '{}');
      const todayString = new Date().toISOString().split('T')[0];

      const getPrayerDateTime = (time: string, date: Date): Date => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const isoDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}:00${timezoneOffset.current}`;
        return new Date(isoDateString);
      };

      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const now = new Date();
      let nextPrayerFound: (PrayerStatus & { dateTime: Date }) | null = null;
      let currentPrayerFound: (PrayerStatus & { dateTime: Date }) | null = null;
      
      const datedPrayers = basePrayerTimes.map(p => ({ ...p, dateTime: getPrayerDateTime(p.time, now) }));
      
      for (const prayer of datedPrayers) {
        if (prayer.dateTime > now) {
          if (!nextPrayerFound) {
            nextPrayerFound = { 
              ...prayer, 
              isCurrent: false, 
              isNext: true, 
              completed: !!prayerLog[todayString]?.[prayer.name] 
            };
          }
        }
      }
      
      if (!nextPrayerFound) {
          const fajrToday = datedPrayers[0];
          const fajrTomorrowDateTime = getPrayerDateTime(fajrToday.time, addDays(now, 1));
          nextPrayerFound = { ...fajrToday, dateTime: fajrTomorrowDateTime, isCurrent: false, isNext: true, completed: false };
      }
      
      for (let i = datedPrayers.length - 1; i >= 0; i--) {
          if (datedPrayers[i].dateTime <= now) {
              currentPrayerFound = { 
                ...datedPrayers[i], 
                isCurrent: true, 
                isNext: false, 
                completed: !!prayerLog[todayString]?.[datedPrayers[i].name]
              };
              break;
          }
      }
      if (!currentPrayerFound) {
          const ishaPrayer = datedPrayers[datedPrayers.length - 1];
          const ishaYesterdayDateTime = getPrayerDateTime(ishaPrayer.time, addDays(now, -1));
          const yesterdayString = addDays(now, -1).toISOString().split('T')[0];
          currentPrayerFound = { 
              ...ishaPrayer, 
              dateTime: ishaYesterdayDateTime,
              isCurrent: true, 
              isNext: false, 
              completed: !!(prayerLog[yesterdayString] && prayerLog[yesterdayString][ishaPrayer.name])
          };
      }

      if (currentPrayerFound && currentPrayerName !== currentPrayerFound.name) {
        setCurrentPrayerName(currentPrayerFound.name);
      }

      if (nextPrayerFound) {
        setNextPrayer(nextPrayerFound);
        const diff = nextPrayerFound.dateTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeToNextPrayer({ hours, minutes, seconds });
      }

      const updatedPrayerTimes = basePrayerTimes.map(p => ({
        ...p,
        isCurrent: p.name === currentPrayerFound?.name,
        isNext: p.name === nextPrayerFound?.name,
        completed: !!prayerLog[todayString]?.[p.name]
      }));

      setPrayerTimes(updatedPrayerTimes);

    }, 1000);

    return () => clearInterval(interval);
  }, [basePrayerTimes]);

  useEffect(() => {
    if (!currentPrayerName) return;

    const handleNewCurrentPrayer = (prayerName: PrayerName) => {
        const settings = getSettings();
        if (!settings.wirdNotifications) return;

        const storedAwrad = localStorage.getItem('awradList');
        if (!storedAwrad) return;
        const awradList: Wird[] = JSON.parse(storedAwrad);
        const hasLinkedAwrad = awradList.some(w => w.linkedPrayer === prayerName);
        
        if (!hasLinkedAwrad) return;

        if (!('Notification' in window)) {
            return;
        }

        const showNotification = () => {
            const today = new Date().toISOString().split('T')[0];
            const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');
            if (sentNotifications[today]?.[prayerName]) {
                return; 
            }
            
            const silent = !!settings.silentNotifications;
            new Notification('حان وقت الأوراد', {
                body: `لا تنسى أوراد ما بعد صلاة ${PRAYER_NAMES[prayerName]}.`,
                icon: '/vite.svg',
                lang: 'ar',
                silent: silent,
            });
            if (!silent) {
                playSound(settings.wirdNotificationSound);
            }

            if (!sentNotifications[today]) {
                sentNotifications[today] = {};
            }
            sentNotifications[today][prayerName] = true;
            localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
        };

        if (Notification.permission === "granted") {
            showNotification();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    showNotification();
                }
            });
        }
    };

    const timerId = setTimeout(() => {
        handleNewCurrentPrayer(currentPrayerName);
    }, 60 * 1000);

    return () => clearTimeout(timerId);

  }, [currentPrayerName]);

  useEffect(() => {
    if (!duhaNotificationTime) return;

    const checkAndNotify = () => {
        const settings = getSettings();
        if (!settings.duhaReminder) return;

        const now = new Date();
        if (
            now.getHours() === duhaNotificationTime.getHours() &&
            now.getMinutes() === duhaNotificationTime.getMinutes()
        ) {
            const today = new Date().toISOString().split('T')[0];
            const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');
            if (sentNotifications[today]?.['Duha']) {
                return;
            }

            const showNotification = () => {
                 const silent = !!settings.silentNotifications;
                 new Notification('صلاة الضحى', {
                    body: 'حان الآن وقت صلاة الضحى، صلاة الأوابين.',
                    icon: '/vite.svg',
                    lang: 'ar',
                    silent: silent,
                });
                if (!silent) {
                    playSound(settings.duhaNotificationSound);
                }

                if (!sentNotifications[today]) {
                    sentNotifications[today] = {};
                }
                sentNotifications[today]['Duha'] = true;
                localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
            };

            if ('Notification' in window) {
                if (Notification.permission === "granted") {
                    showNotification();
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                            showNotification();
                        }
                    });
                }
            }
        }
    };
    
    const interval = setInterval(checkAndNotify, 60000); 

    return () => clearInterval(interval);
  }, [duhaNotificationTime]);

  // Daily wird reminders
  useEffect(() => {
    const checkDailyWirdReminders = () => {
        const settings = getSettings();
        if (!settings.wirdNotifications) return;

        const storedAwrad = localStorage.getItem('awradList');
        if (!storedAwrad) return;
        const awradList: Wird[] = JSON.parse(storedAwrad);
        const hasDailyAwrad = awradList.some(w => w.type === WirdType.DAILY);

        if (!hasDailyAwrad) return;

        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        const reminderTimes = [
            { hour: 7, minute: 0, key: 'daily_morning', title: 'أذكار الصباح', body: 'لا تنس أورادك الصباحية اليوم.' },
            { hour: 17, minute: 0, key: 'daily_evening', title: 'أذكار المساء', body: 'لا تنس أورادك المسائية اليوم.' }
        ];

        for (const reminder of reminderTimes) {
            if (hours === reminder.hour && minutes === reminder.minute) {
                const today = new Date().toISOString().split('T')[0];
                const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');
                
                if (sentNotifications[today]?.[reminder.key]) {
                    continue;
                }

                const showNotification = () => {
                    const silent = !!settings.silentNotifications;
                     new Notification(reminder.title, {
                        body: reminder.body,
                        icon: '/vite.svg',
                        lang: 'ar',
                        silent: silent,
                    });
                    if (!silent) {
                        playSound(settings.wirdNotificationSound);
                    }

                    if (!sentNotifications[today]) { sentNotifications[today] = {}; }
                    sentNotifications[today][reminder.key] = true;
                    localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
                };

                if ('Notification' in window) {
                    if (Notification.permission === "granted") {
                        showNotification();
                    } else if (Notification.permission !== "denied") {
                        Notification.requestPermission().then(p => p === "granted" && showNotification());
                    }
                }
            }
        }
    };

    const intervalId = setInterval(checkDailyWirdReminders, 60000); 

    return () => clearInterval(intervalId);
  }, []);

    // Day-specific wird reminders
  useEffect(() => {
    const checkDaySpecificWirdReminders = () => {
        const settings = getSettings();
        if (!settings.wirdNotifications) return;

        const storedAwrad = localStorage.getItem('awradList');
        if (!storedAwrad) return;
        const awradList: Wird[] = JSON.parse(storedAwrad);
        
        const now = new Date();
        const currentDay = now.getDay(); // Sunday is 0, Monday is 1, etc.
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours !== 9 || minutes !== 0) {
            return;
        }

        const todayString = now.toISOString().split('T')[0];
        const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');
        const notificationKey = `day_specific_${todayString}`;
        
        if (sentNotifications[notificationKey]) {
            return;
        }

        const daySpecificAwrad = awradList.filter(w => 
            w.type === WirdType.DAY_SPECIFIC && w.specificDays?.includes(currentDay)
        );

        if (daySpecificAwrad.length === 0) {
            return;
        }
        
        const showNotification = () => {
            const silent = !!settings.silentNotifications;
             new Notification(`أوراد اليوم`, {
                body: `لا تنسى الأوراد المخصصة ليوم ${DAYS_OF_WEEK[currentDay]}.`,
                icon: '/vite.svg',
                lang: 'ar',
                silent: silent,
            });
            if (!silent) {
                playSound(settings.wirdNotificationSound);
            }

            if (!sentNotifications[todayString]) { sentNotifications[todayString] = {}; }
            sentNotifications[todayString][notificationKey] = true;
            localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
        };

        if ('Notification' in window) {
            if (Notification.permission === "granted") {
                showNotification();
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => p === "granted" && showNotification());
            }
        }
    };

    const intervalId = setInterval(checkDaySpecificWirdReminders, 60000); 

    return () => clearInterval(intervalId);
  }, []);

  // Custom Prayer Reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const settings = getSettings();
      if (!settings.prayerReminder || !settings.customPrayerReminders || basePrayerTimes.length === 0) {
        return;
      }

      const now = new Date();
      
      const getPrayerDateTime = (time: string, date: Date): Date | null => {
        if (!timezoneOffset.current) return null;
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const isoDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}:00${timezoneOffset.current}`;
        return new Date(isoDateString);
      };

      for (const prayer of basePrayerTimes) {
        const prayerName = prayer.name as Exclude<PrayerName, 'Duha'>;
        const reminderMinutes = settings.customPrayerReminders[prayerName];
        if (!reminderMinutes || reminderMinutes <= 0) continue;

        const prayerDateTime = getPrayerDateTime(prayer.time, now);
        if (!prayerDateTime) continue;

        const reminderDateTime = new Date(prayerDateTime.getTime() - reminderMinutes * 60 * 1000);

        if (
          now.getFullYear() === reminderDateTime.getFullYear() &&
          now.getMonth() === reminderDateTime.getMonth() &&
          now.getDate() === reminderDateTime.getDate() &&
          now.getHours() === reminderDateTime.getHours() &&
          now.getMinutes() === reminderDateTime.getMinutes()
        ) {
          const today = now.toISOString().split('T')[0];
          const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');
          const notificationKey = `reminder_${prayer.name}`;

          if (sentNotifications[today]?.[notificationKey]) {
            continue;
          }

          const showNotification = () => {
            const silent = !!settings.silentNotifications;
            new Notification('تذكير بقرب الصلاة', {
              body: `صلاة ${PRAYER_NAMES[prayer.name]} بعد ${reminderMinutes} دقائق.`,
              icon: '/vite.svg',
              lang: 'ar',
              silent: silent,
            });
            if (!silent) {
              playSound(settings.prayerNotificationSound);
            }

            if (!sentNotifications[today]) {
              sentNotifications[today] = {};
            }
            sentNotifications[today][notificationKey] = true;
            localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
          };

          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              showNotification();
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(p => p === 'granted' && showNotification());
            }
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [basePrayerTimes]);
  
  // Custom Wird Reminders
  useEffect(() => {
    const checkWirdReminders = () => {
      const settings = getSettings();
      if (!settings.wirdNotifications) return;

      const storedRemindersRaw = localStorage.getItem('wirdReminders');
      const storedAwradRaw = localStorage.getItem('awradList');
      if (!storedRemindersRaw || !storedAwradRaw) return;

      try {
        const wirdReminders: WirdReminders = JSON.parse(storedRemindersRaw);
        const awradList: Wird[] = JSON.parse(storedAwradRaw);

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentDay = now.getDay(); // Sunday = 0
        const todayString = now.toISOString().split('T')[0];
        
        const sentNotifications = JSON.parse(localStorage.getItem('sentNotifications') || '{}');

        for (const wirdId in wirdReminders) {
          const reminder = wirdReminders[wirdId];
          if (!reminder.enabled || reminder.time !== currentTime) {
            continue;
          }

          const notificationKey = `wird_reminder_${wirdId}`;
          if (sentNotifications[todayString]?.[notificationKey]) {
            continue;
          }

          const wird = awradList.find(w => w.id === parseInt(wirdId, 10));
          if (!wird) continue;
          
          if (wird.type === WirdType.PRAYER_LINKED) continue;

          if (wird.type === WirdType.DAY_SPECIFIC) {
            if (!wird.specificDays || !wird.specificDays.includes(currentDay)) {
              continue;
            }
          }

          const showNotification = () => {
            const silent = !!settings.silentNotifications;
            new Notification('تذكير ورد', {
              body: `حان الآن وقت ورد "${wird.name}".`,
              icon: '/vite.svg',
              lang: 'ar',
              silent: silent,
            });
            if (!silent) {
              playSound(settings.wirdNotificationSound);
            }

            if (!sentNotifications[todayString]) { sentNotifications[todayString] = {}; }
            sentNotifications[todayString][notificationKey] = true;
            localStorage.setItem('sentNotifications', JSON.stringify(sentNotifications));
          };

          if ('Notification' in window) {
            if (Notification.permission === "granted") {
              showNotification();
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(p => p === "granted" && showNotification());
            }
          }
        }
      } catch (e) {
        console.error("Failed to process wird reminders", e);
      }
    };

    const intervalId = setInterval(checkWirdReminders, 60000);
    
    return () => clearInterval(intervalId);
  }, []);


  const togglePrayerCompletion = (prayerName: PrayerName) => {
    const today = new Date().toISOString().split('T')[0];
    const prayerLog = JSON.parse(localStorage.getItem('prayerLog') || '{}');
    if (!prayerLog[today]) {
        prayerLog[today] = {};
    }
    prayerLog[today][prayerName] = !prayerLog[today][prayerName];
    localStorage.setItem('prayerLog', JSON.stringify(prayerLog));

    setPrayerTimes(prev => prev.map(p => 
        p.name === prayerName ? { ...p, completed: prayerLog[today][prayerName] } : p
    ));
  };


  return { prayerTimes, nextPrayer, timeToNextPrayer, togglePrayerCompletion, loading, error };
};

export default usePrayerTimes;