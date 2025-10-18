import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Page, Wird, WirdType, PRAYER_NAMES, DAYS_OF_WEEK, WirdLog, WirdReminder } from '../types';
import { CheckCircleIcon, PencilIcon, CalendarIcon, EllipsisHorizontalCircleIcon, BellAlertIcon } from '../components/Icons';
import { playSound } from '../utils/sounds';

const getWirdHistory = (wirdId: number): WirdLog[] => {
  try {
    const historyData = JSON.parse(localStorage.getItem('wirdHistory') || '{}');
    return historyData[wirdId] || [];
  } catch (e) {
    console.error("Failed to read wird history from localStorage", e);
    return [];
  }
};

const updateWirdHistory = (wirdId: number, count: number): WirdLog[] => {
  try {
    const historyData = JSON.parse(localStorage.getItem('wirdHistory') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    let wirdLog: WirdLog[] = historyData[wirdId] || [];
    const todayIndex = wirdLog.findIndex(log => log.date === today);

    if (todayIndex > -1) {
      // Update today's log if count is not zero, otherwise remove it
      if (count > 0) {
        wirdLog[todayIndex].completed = count;
      } else {
        wirdLog.splice(todayIndex, 1);
      }
    } else if (count > 0) {
      // Add new log for today only if count is positive
      wirdLog.push({ date: today, completed: count });
    }
    
    // Sort by date descending
    wirdLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    historyData[wirdId] = wirdLog;
    localStorage.setItem('wirdHistory', JSON.stringify(historyData));
    return wirdLog;

  } catch (e) {
    console.error("Failed to save wird history to localStorage", e);
    // On failure, return the old history to prevent UI inconsistency
    return getWirdHistory(wirdId);
  }
};


interface WirdDetailScreenProps {
  navigate: (page: Page, params?: any) => void;
  wird: Wird;
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


const WirdDetailScreen: React.FC<WirdDetailScreenProps> = ({ navigate, wird }) => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<WirdLog[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSettings, setReminderSettings] = useState<WirdReminder>({ enabled: false, time: '09:00' });


  useEffect(() => {
    const fullHistory = getWirdHistory(wird.id);
    setHistory(fullHistory);

    const today = new Date().toISOString().split('T')[0];
    const todayLog = fullHistory.find(log => log.date === today);
    setCount(todayLog ? todayLog.completed : 0);
    
    try {
        const allReminders = JSON.parse(localStorage.getItem('wirdReminders') || '{}');
        if (allReminders[wird.id]) {
            setReminderSettings(allReminders[wird.id]);
        } else {
            setReminderSettings({ enabled: false, time: '09:00' });
        }
    } catch (e) {
        console.error("Failed to load wird reminders", e);
    }

  }, [wird.id]);
  
  const updateProgress = (newCount: number) => {
    setCount(newCount);
    const updatedHistory = updateWirdHistory(wird.id, newCount);
    setHistory(updatedHistory);
  };

  const handleReset = () => {
    updateProgress(0);
  }

  const handleIncrement = () => {
    if (count < wird.target) {
        const newCount = count + 1;
        updateProgress(newCount);
        if (newCount === wird.target) {
            playSound('chime');
            if (navigator.vibrate) navigator.vibrate(100);
        } else {
            if (navigator.vibrate) navigator.vibrate(50);
        }
    }
  };

  const handleCompleteWird = () => {
    if (count < wird.target) {
      updateProgress(wird.target);
      playSound('chime');
      if (navigator.vibrate) navigator.vibrate(100);
    }
  };
  
  const getDayNames = (days: number[] | undefined) => {
      if (!days || days.length === 0) return '';
      if (days.length === 7) return 'كل يوم';
      return days.map(d => DAYS_OF_WEEK[d]).join('، ');
  }

  const getWirdDescription = () => {
    switch (wird.type) {
      case WirdType.PRAYER_LINKED:
        return `بعد صلاة ${PRAYER_NAMES[wird.linkedPrayer!]}`;
      case WirdType.DAY_SPECIFIC:
        const days = getDayNames(wird.specificDays);
        return days ? `أيام: ${days}` : 'أيام محددة';
      case WirdType.DAILY:
      default:
        return 'ورد يومي';
    }
  };

  const formatDate = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const logDate = new Date(dateString);
    logDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (logDate.getTime() === today.getTime()) {
      return 'اليوم';
    }
    if (logDate.getTime() === yesterday.getTime()) {
      return 'أمس';
    }
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'long',
    }).format(new Date(dateString));
  };
  
  const handleSaveReminder = () => {
    try {
        const allReminders = JSON.parse(localStorage.getItem('wirdReminders') || '{}');
        allReminders[wird.id] = reminderSettings;
        localStorage.setItem('wirdReminders', JSON.stringify(allReminders));
        setIsReminderModalOpen(false);
    } catch (e) {
        console.error("Failed to save wird reminders", e);
    }
  };

  const isTargetReached = count >= wird.target;

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
        <Header title="تفاصيل الورد" onBack={() => navigate('awrad')} />
        <div className="flex-grow flex flex-col items-center p-6 text-center pb-48">
          <div 
            onClick={handleIncrement}
            className={`w-full max-w-sm rounded-2xl p-8 shadow-lg transition-all duration-500 cursor-pointer select-none ${isTargetReached ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}
          >
            <h2 className="text-3xl font-bold">{wird.name}</h2>
            <p className={`mt-2 text-sm ${isTargetReached ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{getWirdDescription()}</p>
            
            <div className="my-8 flex flex-col items-center justify-center h-32">
                {isTargetReached ? (
                    <div className="animate-pop-in flex flex-col items-center">
                        <CheckCircleIcon className="w-20 h-20" />
                        <p className="font-bold mt-2">الهدف مكتمل!</p>
                    </div>
                ) : (
                    <>
                        <span className="text-7xl font-bold">{count}</span>
                        <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 mt-2">الهدف: {wird.target}</p>
                    </>
                )}
            </div>
            <p className={`text-xs ${isTargetReached ? 'text-white/70' : 'text-gray-400'}`}>
                {isTargetReached ? 'أحسنت!' : 'اضغط للزيادة'}
            </p>
          </div>
          
          <div className="flex items-center justify-center mt-6 space-i-4">
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('edit-wird', { wird }); }}
                className="flex items-center text-gray-500 dark:text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <PencilIcon className="w-5 h-5 me-2" />
                تعديل
              </button>
              {wird.type !== WirdType.PRAYER_LINKED && (
                <button 
                  onClick={() => setIsReminderModalOpen(true)}
                  className="flex items-center text-gray-500 dark:text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <BellAlertIcon className="w-5 h-5 me-2" />
                  تذكير
                </button>
              )}
          </div>

          <div className="w-full max-w-sm mt-6">
            <h3 className="font-bold text-lg mb-2 text-gray-600 dark:text-gray-400 text-right flex items-center justify-start">
              <CalendarIcon className="w-5 h-5 ms-2" />
              سجل الإنجاز
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm max-h-48 overflow-y-auto space-y-2">
              {history.length > 0 ? (
                history.map((log) => {
                  const isComplete = log.completed >= wird.target;
                  const progress = Math.min(100, (log.completed / wird.target) * 100);
                  return (
                    <div key={log.date} className="flex items-center p-2">
                      <div className="me-3">
                        {isComplete ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        ) : (
                          <EllipsisHorizontalCircleIcon className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{formatDate(log.date)}</span>
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{log.completed} / {wird.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 p-4">لا يوجد سجل بعد.</p>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 space-y-3">
          <button 
            onClick={handleCompleteWird}
            disabled={isTargetReached}
            className="w-full bg-green-500 text-white font-bold py-4 px-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors disabled:bg-green-300 dark:disabled:bg-green-700 disabled:cursor-not-allowed"
          >
            إتمام الورد
          </button>
          <button 
              onClick={handleReset}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
              إعادة تعيين
          </button>
        </div>
      </div>
      
      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl animate-pop-in">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">ضبط تذكير</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <label htmlFor="reminder-enabled" className="font-semibold text-gray-700 dark:text-gray-200">تفعيل التذكير</label>
                    <ToggleSwitch 
                        enabled={reminderSettings.enabled}
                        onChange={(isEnabled) => setReminderSettings(s => ({ ...s, enabled: isEnabled }))}
                    />
                </div>
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <label htmlFor="reminder-time" className="font-semibold text-gray-700 dark:text-gray-200">وقت التذكير</label>
                    <input
                        type="time"
                        id="reminder-time"
                        value={reminderSettings.time}
                        onChange={(e) => setReminderSettings(s => ({ ...s, time: e.target.value }))}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-1 text-lg"
                        disabled={!reminderSettings.enabled}
                    />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveReminder}
                className="bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WirdDetailScreen;