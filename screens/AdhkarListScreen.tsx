import React from 'react';
import Header from '../components/Header';
import { Page, AdhkarCategoryIcon } from '../types';
import { adhkarData } from '../data/adhkarData';
import { SunIcon, MoonIcon, ShieldCheckIcon, HomeIcon, HomeModernIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, SparklesIcon, ListBulletIcon } from '../components/Icons';

interface AdhkarListScreenProps {
  navigate: (page: Page, params?: any) => void;
}

const AdhkarCategoryIcon: React.FC<{ icon: AdhkarCategoryIcon, className: string }> = ({ icon, className }) => {
    switch(icon) {
        case 'sun':
        case 'wakeup':
            return <SunIcon className={className} />;
        case 'moon':
        case 'sleep':
            return <MoonIcon className={className} />;
        case 'shield':
            return <ShieldCheckIcon className={className} />;
        case 'mosque_enter':
            return <HomeModernIcon className={className} />;
        case 'mosque_leave':
            return <HomeModernIcon className={className} />;
        case 'home_enter':
            return <ArrowRightOnRectangleIcon className={className} />;
        case 'home_leave':
            return <ArrowLeftOnRectangleIcon className={className} />;
        case 'toilet_enter':
        case 'toilet_leave':
            return <ListBulletIcon className={className} />;
        case 'misc':
             return <SparklesIcon className={className} />;
        default:
            return <ListBulletIcon className={className} />;
    }
}

const AdhkarListScreen: React.FC<AdhkarListScreenProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <Header title="الأذكار" onBack={() => navigate('prayer')} />
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {adhkarData.map(category => (
            <button 
              key={category.slug} 
              onClick={() => navigate('adhkar-details', { category })}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-center flex flex-col items-center justify-center aspect-square hover:bg-green-50 dark:hover:bg-green-900/50 hover:shadow-lg transition-all"
            >
              <div className="p-4 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full mb-3">
                <AdhkarCategoryIcon icon={category.icon} className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-100">{category.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdhkarListScreen;