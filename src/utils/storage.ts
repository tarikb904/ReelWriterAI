import localforage from 'localforage';
import { Session, User, APIProvider } from '../types';
import { STORAGE_KEYS, SESSION_EXPIRY_MS, API_PROVIDERS } from '../config/constants';

// Configure localforage
localforage.config({
  name: 'ReelWriterAI',
  version: 1.0,
  storeName: 'reelwriter_data',
  description: 'ReelWriterAI local storage',
});

// User management
export const saveUser = async (user: User): Promise<void> => {
  await localforage.setItem(STORAGE_KEYS.USER, user);
};

export const getUser = async (): Promise<User | null> => {
  return await localforage.getItem(STORAGE_KEYS.USER);
};

export const removeUser = async (): Promise<void> => {
  await localforage.removeItem(STORAGE_KEYS.USER);
  await localforage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Session management
export const saveSessions = async (sessions: Session[]): Promise<void> => {
  // Filter out expired sessions
  const now = new Date();
  const validSessions = sessions.filter(session => new Date(session.expiresAt) > now);
  await localforage.setItem(STORAGE_KEYS.SESSIONS, validSessions);
};

export const getSessions = async (): Promise<Session[]> => {
  const sessions = await localforage.getItem<Session[]>(STORAGE_KEYS.SESSIONS) || [];
  const now = new Date();
  
  // Filter out expired sessions
  const validSessions = sessions.filter(session => new Date(session.expiresAt) > now);
  
  // Save back the filtered sessions if any were removed
  if (validSessions.length !== sessions.length) {
    await saveSessions(validSessions);
  }
  
  return validSessions;
};

export const saveCurrentSession = async (session: Session): Promise<void> => {
  await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, session);
  
  // Also update in sessions list
  const sessions = await getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  
  await saveSessions(sessions);
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const session = await localforage.getItem<Session>(STORAGE_KEYS.CURRENT_SESSION);
  
  if (session && new Date(session.expiresAt) > new Date()) {
    return session;
  }
  
  // Remove expired session
  if (session) {
    await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }
  
  return null;
};

export const removeCurrentSession = async (): Promise<void> => {
  await localforage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const sessions = await getSessions();
  const filteredSessions = sessions.filter(s => s.id !== sessionId);
  await saveSessions(filteredSessions);
  
  // If this was the current session, remove it
  const currentSession = await getCurrentSession();
  if (currentSession?.id === sessionId) {
    await removeCurrentSession();
  }
};

// API Provider management
export const saveSelectedAPI = async (provider: APIProvider): Promise<void> => {
  await localforage.setItem(STORAGE_KEYS.SELECTED_API, provider);
};

export const getSelectedAPI = async (): Promise<APIProvider> => {
  const saved = await localforage.getItem<APIProvider>(STORAGE_KEYS.SELECTED_API);
  return saved || API_PROVIDERS[0]; // Default to OpenRouter
};

// Auth token management
export const saveAuthToken = async (token: string): Promise<void> => {
  await localforage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await localforage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Utility functions
export const createSession = (contentIdea: any): Session => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_MS);
  
  return {
    id: generateId(),
    contentIdea,
    currentStep: 1,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Cleanup expired data
export const cleanupExpiredData = async (): Promise<void> => {
  const sessions = await getSessions();
  // getSessions already filters expired sessions and saves the result
  
  console.log(`Cleanup completed. ${sessions.length} valid sessions remaining.`);
};

// Initialize storage
export const initializeStorage = async (): Promise<void> => {
  try {
    await cleanupExpiredData();
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
};