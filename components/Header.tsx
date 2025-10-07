
import React from 'react';
import { View } from '../types';
import { SparklesIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const commonButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const activeButtonClasses = "bg-indigo-600 text-white shadow-sm";
  const inactiveButtonClasses = "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">IntelliHire</h1>
          </div>
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setCurrentView(View.Recruiter)}
              className={`${commonButtonClasses} ${currentView === View.Recruiter ? activeButtonClasses : inactiveButtonClasses}`}
            >
              Recruiter Dashboard
            </button>
            <button
              onClick={() => setCurrentView(View.Candidate)}
              className={`${commonButtonClasses} ${currentView === View.Candidate ? activeButtonClasses : inactiveButtonClasses}`}
            >
              Candidate Portal
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
