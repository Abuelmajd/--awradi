import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { Page, PRAYER_NAMES, RAKAT_COUNT, PrayerName, Wird } from '../types';
import usePrayerTimes from '../hooks/usePrayerTimes';
import { SunIcon, CheckCircleIcon } from '../components/Icons';
import PrayerCompletionModal from '../components/PrayerCompletionModal';

interface PrayerDetailScreenProps {
  navigate: (page: Page, params?: any) => void;
  prayerName: string;
  awrad: Wird[];
}

const PrayerDetailScreen: React.FC<PrayerDetailScreenProps> = ({ navigate, prayerName, awrad }) => {
  const { prayerTimes, togglePrayerCompletion } = usePrayerTimes();
  const prayer = prayerTimes.find(p => p.name === prayerName);
  const [duhaCompleted, setDuhaCompleted] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  useEffect(() => {
    if (prayerName === 'Dhuhr') {
        const today = new Date().toISOString().split('T')[0];
        const naflLog = JSON.parse(localStorage.getItem('naflLog') || '{}');
        setDuhaCompleted(!!(naflLog[today] && naflLog[today].Duha));
    }
  }, [prayerName]);

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

  const handleCompletePrayer = () => {
    if (!prayer) return;
    if (!prayer.completed) {
      togglePrayerCompletion(prayer.name as PrayerName);
      setIsCompletionModalOpen(true);
    } else {
      togglePrayerCompletion(prayer.name as PrayerName);
    }
  };

  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false);
    navigate('prayer');
  };

  const linkedAwrad = useMemo(() => awrad.filter(
    w => w.type === 'PRAYER_LINKED' && w.linkedPrayer === prayerName
  ), [awrad, prayerName]);

  if (!prayer) return null;

  return (
    <>
      <div>
        <Header title="تفاصيل الصلاة" onBack={() => navigate('prayer')} />
        <div className="p-6 pb-40">
          <h2 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-8">{PRAYER_NAMES[prayer.name as PrayerName]}</h2>

          <div className="space-y-4 text-lg">
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-200 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg mr-4">🕒</div>
                <span className="font-semibold">وقت الصلاة</span>
              </div>
              <span>{prayer.time}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-200 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg mr-4">📜</div>
                <span className="font-semibold">الركعات</span>
              </div>
              <span>{RAKAT_COUNT[prayer.name as PrayerName].text}</span>
            </div>
          </div>

          {prayerName === 'Dhuhr' && (
              <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">النوافل</h3>
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
                        <p className={`text-sm ${duhaCompleted ? 'text-white/80' : 'text-yellow-600 dark:text-yellow-400'}`}>صدقة عن كل مفصل</p>
                      </div>
                    </div>
                    {duhaCompleted && <CheckCircleIcon className="w-8 h-8 text-white" />}
                  </div>
              </div>
          )}
          
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              <button 
                onClick={handleCompletePrayer}
                className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-green-600 transition-colors">
                {prayer.completed ? 'إلغاء إتمام الصلاة' : 'إتمام الصلاة'}
              </button>
          </div>
        </div>
      </div>
      <PrayerCompletionModal 
        isOpen={isCompletionModalOpen}
        onClose={handleCloseCompletionModal}
        prayerName={prayer.name as PrayerName}
        linkedAwrad={linkedAwrad}
        navigate={navigate}
      />
    </>
  );
};

export default PrayerDetailScreen;