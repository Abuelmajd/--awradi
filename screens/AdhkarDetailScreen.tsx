import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Page, AdhkarCategory, AdhkarItem } from '../types';
import { playSound } from '../utils/sounds';
import { CheckCircleIcon, ArrowLeftIcon as PrevIcon, ArrowRightIcon as NextIcon } from '../components/Icons';

interface AdhkarDetailScreenProps {
  navigate: (page: Page, params?: any) => void;
  category: AdhkarCategory;
}

const AdhkarDetailScreen: React.FC<AdhkarDetailScreenProps> = ({ navigate, category }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const storageKey = `adhkar_progress_${category.slug}`;

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.error("Failed to load adhkar progress", e);
    }
  }, [storageKey]);

  const saveProgress = (newProgress: { [key: number]: number }) => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
    } catch(e) {
        console.error("Failed to save adhkar progress", e);
    }
  }

  const currentAdhkar = category.items[currentIndex];
  const target = typeof currentAdhkar.count === 'number' ? currentAdhkar.count : 1;
  const currentCount = progress[currentIndex] || 0;
  const isComplete = currentCount >= target;
  const allComplete = category.items.every((item, index) => (progress[index] || 0) >= (typeof item.count === 'number' ? item.count : 1));

  const handleNext = () => {
    if (currentIndex < category.items.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const handleTap = () => {
    if (isComplete) return;
    
    const newCount = currentCount + 1;
    const newProgress = { ...progress, [currentIndex]: newCount };
    setProgress(newProgress);
    saveProgress(newProgress);

    if (navigator.vibrate) navigator.vibrate(50);

    if (newCount >= target) {
      playSound('chime');
      if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
      setTimeout(() => {
        if (currentIndex < category.items.length - 1) {
          handleNext();
        }
      }, 700);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
        <Header title={category.title} onBack={() => navigate('adhkar')} />
        
        <div className="p-4 pt-2">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                {currentIndex + 1} / {category.items.length}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                <div 
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentIndex + (isComplete ? 1 : currentCount / target)) / category.items.length) * 100}%` }}
                ></div>
            </div>
        </div>
      
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        {allComplete ? (
             <div className="flex flex-col items-center justify-center text-center animate-pop-in">
                <CheckCircleIcon className="w-24 h-24 text-green-500" />
                <h2 className="text-2xl font-bold mt-4">أحسنت! لقد أتممت الأذكار</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">تقبل الله منك</p>
            </div>
        ) : (
          <>
            <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {currentAdhkar.text}
            </p>
            {currentAdhkar.note && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-6 bg-yellow-50 dark:bg-yellow-900/50 px-3 py-1 rounded-full">
                    {currentAdhkar.note}
                </p>
            )}

            <div 
                onClick={handleTap} 
                className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center select-none transition-all duration-300 shadow-xl cursor-pointer ${
                    isComplete ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 active:scale-95'
                }`}
            >
                {isComplete ? (
                    <CheckCircleIcon className="w-20 h-20 animate-pop-in" />
                ) : (
                    <span className="text-7xl font-bold">{currentCount}</span>
                )}
                <div className="absolute bottom-6 text-lg font-semibold text-gray-500 dark:text-gray-400">
                    {typeof currentAdhkar.count === 'number' ? `من ${target}` : ''}
                </div>
            </div>
          </>
        )}
        </div>
      
        <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700 flex justify-between items-center">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
                <PrevIcon className="w-6 h-6" />
            </button>
            <button onClick={() => navigate('adhkar')} className="font-bold py-3 px-6 bg-gray-200 dark:bg-gray-700 rounded-lg">
                العودة للقائمة
            </button>
            <button onClick={handleNext} disabled={currentIndex >= category.items.length - 1} className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
                <NextIcon className="w-6 h-6" />
            </button>
        </div>
    </div>
  );
};

export default AdhkarDetailScreen;