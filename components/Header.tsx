
import React from 'react';
import { ArrowRightIcon } from './Icons';

interface HeaderProps {
  title: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  return (
    <header className="p-4 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="w-8"></div>
      <h1 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">{title}</h1>
      <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2">
        <ArrowRightIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;