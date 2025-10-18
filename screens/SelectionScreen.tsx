import React from 'react';
import Header from '../components/Header';
import { Page, AppSettings } from '../types';
import { CheckIcon } from '../components/Icons';
import { playSound } from '../utils/sounds';

interface SelectionScreenProps {
  navigate: (page: Page) => void;
  title: string;
  options: { key: string, value: string }[];
  currentValue: string;
  settingsKey: keyof AppSettings;
  onSelect: (key: keyof AppSettings, value: string) => void;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ navigate, title, options, currentValue, settingsKey, onSelect }) => {
  
  const handleSelect = (value: string) => {
    playSound(value); // Play sound for preview
    onSelect(settingsKey, value);
    navigate('settings');
  };

  return (
    <div>
      <Header title={title} onBack={() => navigate('settings')} />
      <div className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {options.map(option => (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className="w-full flex justify-between items-center p-4 border-b dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-700 last:border-b-0"
            >
              <p className="font-semibold">{option.value}</p>
              {currentValue === option.key && <CheckIcon className="w-6 h-6 text-green-500" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;