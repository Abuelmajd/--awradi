import React from 'react';
import { PRAYER_NAMES, PrayerName, Page, Wird } from '../types';
import { BookOpenIcon } from './Icons';

interface PrayerCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: PrayerName;
  linkedAwrad: Wird[];
  navigate: (page: Page, params?: any) => void;
}

const PrayerCompletionModal: React.FC<PrayerCompletionModalProps> = ({ isOpen, onClose, prayerName, linkedAwrad, navigate }) => {
  if (!isOpen) {
    return null;
  }

  const handleWirdClick = (wird: Wird) => {
    onClose();
    navigate('wird-detail', { wird });
  };
  
  const handleAddWirdClick = () => {
    onClose();
    navigate('add-wird');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-end z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl flex flex-col max-h-[90vh] animate-slide-up">
        <div className="p-6 flex flex-col flex-grow min-h-0">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center animate-pop-in">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">تقبل الله</h2>
            <p className="text-gray-600 dark:text-gray-300">لا تنسَ أورادك بعد صلاة {PRAYER_NAMES[prayerName]}</p>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pr-2">
            {linkedAwrad.length > 0 ? (
              linkedAwrad.map((wird) => (
                <button 
                  key={wird.id} 
                  onClick={() => handleWirdClick(wird)}
                  className="w-full text-right p-4 rounded-lg transition-all duration-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <BookOpenIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mr-3">{wird.name}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    ابدأ الآن &gt;
                  </span>
                </button>
              ))
            ) : (
              <div className="text-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300 mb-4">ليس لديك أوراد مسجلة لهذه الصلاة.</p>
                <button 
                  onClick={handleAddWirdClick} 
                  className="bg-green-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  إضافة ورد جديد
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-4 rounded-xl text-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayerCompletionModal;
