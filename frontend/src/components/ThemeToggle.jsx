import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-200/50 hover:bg-slate-200/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 border border-slate-300/30 text-slate-700 dark:text-slate-200 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
