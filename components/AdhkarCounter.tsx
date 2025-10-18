import React, { useState, useEffect } from 'react';
import { AdhkarItem } from '../types';
import { playSound } from '../utils/sounds';
import { ArrowRightIcon, CheckCircleIcon } from './Icons';

interface AdhkarCounterProps {
  adhkar: AdhkarItem;
  onComplete: () => void;
  onBack: () => void;
}

const AdhkarCounter: React.FC<AdhkarCounterProps> = ({ adhkar, onComplete, onBack }) => {
  const [count, setCount] = useState(0);
  const target = typeof adhkar.count === 'number' ? adhkar.count : 0;
  const isComplete = count >= target;

  useEffect(() => {
    if (isComplete && target > 0) {
      playSound('chime');
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      const timer = setTimeout(() => {
        onComplete();
      }, 800); // Wait a bit before automatically going back
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete, target]);

  const handleIncrement = () => {
    if (!isComplete) {
      setCount(c => c + 1);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <div className="flex flex-col p-6 animate-fade-in flex-grow">
      <header className="flex items-center justify-between flex-shrink-0">
         <div className="w-8"></div>
         <h2 className="text-xl font-bold text-center">التسبيح</h2>
         <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2">
            <ArrowRightIcon className="w-6 h-6" />
         </button>
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <p className="text-2xl font-bold leading-relaxed mb-8">{adhkar.text}</p>
        
        <button 
          onClick={handleIncrement}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl focus:outline-none ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 active:bg-gray-200 dark:active:bg-gray-600'}`}
        >
          {isComplete ? (
            <CheckCircleIcon className="w-20 h-20" />
          ) : (
            <span className="text-7xl font-bold">{count}</span>
          )}
        </button>
        
        <p className="mt-8 text-xl font-semibold text-gray-500 dark:text-gray-400">
          {isComplete ? `أتممت ${target} تسبيحة!` : `الهدف: ${target}`}
        </p>
      </div>
      
       <div className="flex-shrink-0">
          <button
            onClick={onBack}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-xl text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            العودة للأذكار
          </button>
        </div>
    </div>
  );
};

export default AdhkarCounter;