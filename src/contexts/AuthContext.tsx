import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { saveUser, getUser, removeUser, saveAuthToken, getAuthToken } from '../utils/storage';
import { DEFAULT_CREDENTIALS } from '../config/constants';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [savedUser, authToken] = await Promise.all([
        getUser(),
        getAuthToken(),
      ]);

      if (savedUser && authToken) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check against default credentials
      if (username === DEFAULT_CREDENTIALS.username && password === DEFAULT_CREDENTIALS.password) {
        const newUser: User = {
          id: 'user_1',
          username,
          email: `${username}@reelwriter.ai`,
          createdAt: new Date(),
        };

        const authToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await Promise.all([
          saveUser(newUser),
          saveAuthToken(authToken),
        ]);

        setUser(newUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await removeUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};