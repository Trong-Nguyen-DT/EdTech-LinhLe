import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../utils/theme';

interface Props {
  compactOnMobile?: boolean;
  className?: string;
}

export const ThemeToggleButton: React.FC<Props> = ({
  compactOnMobile = false,
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
        isDark
          ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
          : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
      )}
      <span className={compactOnMobile ? 'hidden sm:inline' : ''}>
        {isDark ? 'Sáng' : 'Tối'}
      </span>
    </button>
  );
};
