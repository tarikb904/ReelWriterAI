import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System theme';
      default:
        return 'Light mode';
    }
  };

  return (
    <div className="relative group">
      {/* Main toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-bg-tertiary hover:bg-border-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-bg-secondary"
        aria-label={`Current theme: ${getThemeLabel()}. Click to cycle through themes.`}
        title={getThemeLabel()}
      >
        <div className="relative">
          {getThemeIcon()}
          
          {/* Visual indicator for resolved theme when using system */}
          {theme === 'system' && (
            <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary-500 border border-bg-secondary" />
          )}
        </div>
      </button>

      {/* Dropdown menu for precise theme selection */}
      <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary rounded-lg shadow-lg border border-border-primary py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button
          onClick={() => setTheme('light')}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors flex items-center space-x-2 ${
            theme === 'light' ? 'text-primary-600' : 'text-text-secondary'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Light</span>
          {theme === 'light' && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />}
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors flex items-center space-x-2 ${
            theme === 'dark' ? 'text-primary-600' : 'text-text-secondary'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Dark</span>
          {theme === 'dark' && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />}
        </button>
        
        <button
          onClick={() => setTheme('system')}
          className={`w-full px-3 py-2 text-left text-sm hover:bg-bg-tertiary transition-colors flex items-center space-x-2 ${
            theme === 'system' ? 'text-primary-600' : 'text-text-secondary'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>System</span>
          {theme === 'system' && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />}
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;