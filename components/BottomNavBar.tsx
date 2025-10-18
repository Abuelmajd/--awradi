import React from 'react';
import { Page } from '../types';
import { PrayerIcon, QiblaIcon, SettingsIcon, BookOpenIcon, ListBulletIcon } from './Icons';

interface BottomNavBarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activePage, setPage }) => {
  const navItems = [
    { page: 'settings', label: 'الإعدادات', icon: <SettingsIcon /> },
    { page: 'adhkar', label: 'الأذكار', icon: <ListBulletIcon /> },
    { page: 'awrad', label: 'الأوراد', icon: <BookOpenIcon /> },
    { page: 'prayer', label: 'الصلاة', icon: <PrayerIcon /> },
    { page: 'qibla', label: 'القبلة', icon: <QiblaIcon /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isActive = activePage === item.page;
          const isCenter = item.page === 'awrad';

          if (isCenter) {
            return (
              <div key={item.page} className="w-1/5 flex justify-center">
                <button
                  onClick={() => setPage(item.page as Page)}
                  className="flex flex-col items-center justify-center text-sm transition-all duration-300 transform -translate-y-4"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-green-500 ring-4 ring-white dark:ring-gray-900' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}>
                    {React.cloneElement(item.icon, { className: 'w-8 h-8 text-white' })}
                  </div>
                  <span className={`mt-2 font-semibold text-xs ${
                    isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.page}
              onClick={() => setPage(item.page as Page)}
              className={`flex flex-col items-center justify-center text-sm transition-colors duration-200 ${
                isActive ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
              } w-1/5 h-full`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 dark:bg-green-500/20' : ''}`}>
                {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
              </div>
              <span className="mt-1 text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;