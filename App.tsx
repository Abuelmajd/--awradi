import React, { useState, useCallback, useEffect } from 'react';
import PrayerScreen from './screens/PrayerScreen';
import QiblaScreen from './screens/QiblaScreen';
import SettingsScreen from './screens/SettingsScreen';
import AwradListScreen from './screens/AwradListScreen';
import AddWirdScreen from './screens/AddWirdScreen';
import WirdDetailScreen from './screens/WirdDetailScreen';
import PrayerDetailScreen from './screens/PrayerDetailScreen';
import SelectionScreen from './screens/SelectionScreen';
import BottomNavBar from './components/BottomNavBar';
import { Page, Wird, WirdGroup, AppSettings, AdhkarCategory } from './types';
import PrayerAdjustmentsScreen from './screens/PrayerAdjustmentsScreen';
import EditWirdScreen from './screens/EditWirdScreen';
import AddWirdGroupScreen from './screens/AddWirdGroupScreen';
import EditWirdGroupScreen from './screens/EditWirdGroupScreen';
import PrayerRemindersScreen from './screens/PrayerRemindersScreen';
import AddWirdsToGroupScreen from './screens/AddWirdsToGroupScreen';
import AdhkarListScreen from './screens/AdhkarListScreen';
import AdhkarDetailScreen from './screens/AdhkarDetailScreen';

// Default settings moved here for centralized management
const defaultSettings: AppSettings = {
  locationAccess: true,
  prayerNotifications: true,
  prayerReminder: false,
  duhaReminder: false,
  wirdNotifications: true,
  silentNotifications: false,
  prayerNotificationSound: 'default',
  duhaNotificationSound: 'default',
  wirdNotificationSound: 'default',
  calculationMethod: 'Egyptian',
  madhab: 'Shafi',
  prayerAdjustments: {},
  customPrayerReminders: {},
  theme: 'light',
};


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('awrad');
  const [activeWird, setActiveWird] = useState<Wird | null>(null);
  const [activePrayer, setActivePrayer] = useState<string | null>(null);
  const [activeWirdGroup, setActiveWirdGroup] = useState<WirdGroup | null>(null);
  const [activeAdhkarCategory, setActiveAdhkarCategory] = useState<AdhkarCategory | null>(null);
  const [awrad, setAwrad] = useState<Wird[]>([]);
  const [wirdGroups, setWirdGroups] = useState<WirdGroup[]>([]);
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    // Load Awrad
    const storedAwrad = localStorage.getItem('awradList');
    if (storedAwrad) {
      setAwrad(JSON.parse(storedAwrad));
    } else {
        localStorage.setItem('awradList', JSON.stringify([]));
    }
    // Load Wird Groups
    const storedWirdGroups = localStorage.getItem('wirdGroups');
    if (storedWirdGroups) {
      setWirdGroups(JSON.parse(storedWirdGroups));
    } else {
        localStorage.setItem('wirdGroups', JSON.stringify([]));
    }
    // Load Settings
    const savedSettingsRaw = localStorage.getItem('appSettings');
    if (savedSettingsRaw) {
      try {
        const savedSettings = JSON.parse(savedSettingsRaw);
        setSettings({ ...defaultSettings, ...savedSettings });
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
      }
    }
  }, []);
  
  // This useEffect hook manages the theme of the application.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);


  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };


  const navigate = useCallback((targetPage: Page, params?: any) => {
    setPage(targetPage);
    // Reset active items to avoid showing wrong details screen
    if (targetPage !== 'wird-detail' && targetPage !== 'edit-wird') setActiveWird(null);
    if (targetPage !== 'prayer-detail') setActivePrayer(null);
    if (targetPage !== 'edit-wird-group' && targetPage !== 'add-wirds-to-group') setActiveWirdGroup(null);
    if (targetPage !== 'adhkar-details') setActiveAdhkarCategory(null);
    
    // Set active items for detail pages
    if ((targetPage === 'wird-detail' || targetPage === 'edit-wird') && params?.wird) {
      setActiveWird(params.wird);
    }
    if (targetPage === 'prayer-detail' && params?.prayer) {
      setActivePrayer(params.prayer);
    }
    if((targetPage === 'edit-wird-group' || targetPage === 'add-wirds-to-group') && params?.group) {
      setActiveWirdGroup(params.group);
    }
     if (targetPage === 'adhkar-details' && params?.category) {
      setActiveAdhkarCategory(params.category);
    }
    
    // Handle generic params for other screens
    setNavigationParams(params || null);
  }, []);

  const handleAddWird = (newWirdData: Omit<Wird, 'id'>, targetGroupId?: number) => {
    setAwrad(prevAwrad => {
      const maxId = prevAwrad.reduce((max, wird) => (wird.id > max ? wird.id : max), 0);
      const newWird: Wird = {
        id: maxId + 1,
        ...newWirdData,
      };
      const updatedAwrad = [...prevAwrad, newWird];
      localStorage.setItem('awradList', JSON.stringify(updatedAwrad));

      if (targetGroupId !== undefined) {
        setWirdGroups(prevGroups => {
            const updatedGroups = prevGroups.map(group => {
                if (group.id === targetGroupId) {
                    return {
                        ...group,
                        wirdIds: [...group.wirdIds, newWird.id],
                    };
                }
                return group;
            });
            localStorage.setItem('wirdGroups', JSON.stringify(updatedGroups));
            return updatedGroups;
        });
      }

      return updatedAwrad;
    });
  };

  const handleUpdateWird = (updatedWird: Wird) => {
    setAwrad(prevAwrad => {
      const updatedAwradList = prevAwrad.map(w => w.id === updatedWird.id ? updatedWird : w);
      localStorage.setItem('awradList', JSON.stringify(updatedAwradList));
      return updatedAwradList;
    });
  };

  const handleDeleteWird = (wirdId: number) => {
    setAwrad(prevAwrad => {
      const updatedAwrad = prevAwrad.filter(w => w.id !== wirdId);
      localStorage.setItem('awradList', JSON.stringify(updatedAwrad));
      return updatedAwrad;
    });
    setWirdGroups(prevGroups => {
        const updatedGroups = prevGroups.map(g => ({
            ...g,
            wirdIds: g.wirdIds.filter(id => id !== wirdId)
        }));
        localStorage.setItem('wirdGroups', JSON.stringify(updatedGroups));
        return updatedGroups;
    });
  };
  
  const handleAddWirdGroup = (newGroupData: Omit<WirdGroup, 'id'>) => {
    setWirdGroups(prev => {
        const maxId = prev.reduce((max, group) => (group.id > max ? group.id : max), 0);
        const newGroup: WirdGroup = { id: maxId + 1, ...newGroupData };
        const updatedGroups = [...prev, newGroup];
        localStorage.setItem('wirdGroups', JSON.stringify(updatedGroups));
        return updatedGroups;
    });
  };

  const handleUpdateWirdGroup = (updatedGroup: WirdGroup) => {
    setWirdGroups(prev => {
        const updatedGroups = prev.map(g => g.id === updatedGroup.id ? updatedGroup : g);
        localStorage.setItem('wirdGroups', JSON.stringify(updatedGroups));
        return updatedGroups;
    });
  };

  const handleDeleteWirdGroup = (groupId: number) => {
    setWirdGroups(prev => {
        const updatedGroups = prev.filter(g => g.id !== groupId);
        localStorage.setItem('wirdGroups', JSON.stringify(updatedGroups));
        return updatedGroups;
    });
  };


  const renderContent = () => {
    switch (page) {
      case 'prayer':
        return <PrayerScreen navigate={navigate} />;
      case 'qibla':
        return <QiblaScreen />;
      case 'settings':
        return <SettingsScreen navigate={navigate} settings={settings} onSettingChange={handleSettingChange} />;
      case 'awrad':
        return <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
      case 'add-wird':
        return <AddWirdScreen navigate={navigate} onAddWird={handleAddWird} targetGroupId={navigationParams?.targetGroupId} />;
      case 'wird-detail':
        return activeWird ? <WirdDetailScreen navigate={navigate} wird={activeWird} /> : <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
      case 'edit-wird':
        return activeWird ? <EditWirdScreen navigate={navigate} wird={activeWird} onUpdateWird={handleUpdateWird} onDeleteWird={handleDeleteWird} /> : <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
      case 'prayer-detail':
        return activePrayer ? <PrayerDetailScreen navigate={navigate} prayerName={activePrayer} awrad={awrad} /> : <PrayerScreen navigate={navigate} />;
      case 'selection':
        return navigationParams ? <SelectionScreen {...navigationParams} navigate={navigate} onSelect={handleSettingChange} /> : <SettingsScreen navigate={navigate} settings={settings} onSettingChange={handleSettingChange} />;
      case 'prayer-adjustments':
        return <PrayerAdjustmentsScreen navigate={navigate} settings={settings} onSettingChange={handleSettingChange} />;
      case 'prayer-reminders':
        return <PrayerRemindersScreen navigate={navigate} settings={settings} onSettingChange={handleSettingChange} />;
      case 'add-wird-group':
        return <AddWirdGroupScreen navigate={navigate} allAwrad={awrad} onAddGroup={handleAddWirdGroup} />;
      case 'edit-wird-group':
        return activeWirdGroup ? <EditWirdGroupScreen navigate={navigate} group={activeWirdGroup} allAwrad={awrad} onUpdateGroup={handleUpdateWirdGroup} onDeleteGroup={handleDeleteWirdGroup} /> : <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
      case 'add-wirds-to-group':
        return activeWirdGroup ? <AddWirdsToGroupScreen navigate={navigate} group={activeWirdGroup} allAwrad={awrad} wirdGroups={wirdGroups} onUpdateGroup={handleUpdateWirdGroup} /> : <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
      case 'adhkar':
        return <AdhkarListScreen navigate={navigate} />;
      case 'adhkar-details':
        return activeAdhkarCategory ? <AdhkarDetailScreen navigate={navigate} category={activeAdhkarCategory} /> : <AdhkarListScreen navigate={navigate} />;
      default:
        return <AwradListScreen navigate={navigate} awrad={awrad} wirdGroups={wirdGroups} />;
    }
  };

  const showNavBar = ['prayer', 'qibla', 'settings', 'awrad', 'adhkar'].includes(page);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-200 font-sans">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        <main className="flex-grow pb-24">
          {renderContent()}
        </main>
        {showNavBar && <BottomNavBar activePage={page} setPage={navigate} />}
      </div>
    </div>
  );
};

export default App;