import React from 'react';
import { LogOut, User, History, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'app' }) => {
  const { user, logout } = useAuth();
  const { sessions } = useApp();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo black.png" 
                alt="ReelWriterAI" 
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="text-xl font-heading font-bold text-gray-900">
                ReelWriterAI
              </div>
            </div>
            
            {/* Navigation */}
            {onNavigate && (
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => onNavigate('app')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'app'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Create Content
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  History ({sessions.length})
                </button>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Navigation */}
            {onNavigate && (
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('history')}
                  className={`p-2 rounded-md transition-colors ${
                    currentPage === 'history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="History"
                >
                  <History className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-gray-500 text-xs">{user?.email}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;