import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, APIProvider, ContentIdea, Hook, Script, Caption } from '../types';
import { 
  getSessions, 
  getCurrentSession, 
  saveCurrentSession, 
  createSession,
  getSelectedAPI,
  saveSelectedAPI,
  initializeStorage,
  generateId
} from '../utils/storage';
import { API_PROVIDERS } from '../config/constants';

interface AppContextType {
  // Session management
  currentSession: Session | null;
  sessions: Session[];
  createNewSession: (contentIdea: ContentIdea) => Promise<void>;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  
  // API management
  selectedAPI: APIProvider;
  setSelectedAPI: (provider: APIProvider) => Promise<void>;
  
  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Content management
  selectedContentIdea: ContentIdea | null;
  setSelectedContentIdea: (idea: ContentIdea) => void;
  selectedHook: Hook | null;
  setSelectedHook: (hook: Hook) => void;
  script: Script | null;
  setScript: (script: Script) => void;
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Actions
  refreshSessions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedAPI, setSelectedAPIState] = useState<APIProvider>(API_PROVIDERS[0]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedContentIdea, setSelectedContentIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      await initializeStorage();
      
      const [savedSessions, savedCurrentSession, savedAPI] = await Promise.all([
        getSessions(),
        getCurrentSession(),
        getSelectedAPI(),
      ]);

      setSessions(savedSessions);
      setSelectedAPIState(savedAPI);

      if (savedCurrentSession) {
        setCurrentSession(savedCurrentSession);
        setCurrentStep(savedCurrentSession.currentStep);
        setSelectedContentIdea(savedCurrentSession.contentIdea);
        
        if (savedCurrentSession.selectedHook) {
          setSelectedHook(savedCurrentSession.selectedHook);
        }
        
        if (savedCurrentSession.script) {
          setScript(savedCurrentSession.script);
        }
        
        if (savedCurrentSession.captions) {
          setCaptions(savedCurrentSession.captions);
        }
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to initialize application');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async (contentIdea: ContentIdea): Promise<void> => {
    try {
      const newSession = createSession(contentIdea);
      await saveCurrentSession(newSession);
      
      setCurrentSession(newSession);
      setSelectedContentIdea(contentIdea);
      setCurrentStep(2); // Move to hooks step
      setSelectedHook(null);
      setScript(null);
      setCaptions([]);
      
      await refreshSessions();
    } catch (error) {
      console.error('Failed to create new session:', error);
      setError('Failed to create new session');
    }
  };

  const updateSession = async (updates: Partial<Session>): Promise<void> => {
    if (!currentSession) return;

    try {
      const updatedSession: Session = {
        ...currentSession,
        ...updates,
        updatedAt: new Date(),
      };

      await saveCurrentSession(updatedSession);
      setCurrentSession(updatedSession);
      await refreshSessions();
    } catch (error) {
      console.error('Failed to update session:', error);
      setError('Failed to update session');
    }
  };

  const loadSession = async (sessionId: string): Promise<void> => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        setError('Session not found');
        return;
      }

      await saveCurrentSession(session);
      setCurrentSession(session);
      setCurrentStep(session.currentStep);
      setSelectedContentIdea(session.contentIdea);
      
      if (session.selectedHook) {
        setSelectedHook(session.selectedHook);
      }
      
      if (session.script) {
        setScript(session.script);
      }
      
      if (session.captions) {
        setCaptions(session.captions);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load session');
    }
  };

  const setSelectedAPI = async (provider: APIProvider): Promise<void> => {
    try {
      await saveSelectedAPI(provider);
      setSelectedAPIState(provider);
    } catch (error) {
      console.error('Failed to save selected API:', error);
      setError('Failed to save API selection');
    }
  };

  const refreshSessions = async (): Promise<void> => {
    try {
      const updatedSessions = await getSessions();
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
    }
  };

  // Enhanced setters that also update the session
  const setSelectedContentIdeaWithSession = (idea: ContentIdea) => {
    setSelectedContentIdea(idea);
    if (currentSession) {
      updateSession({ contentIdea: idea });
    }
  };

  const setSelectedHookWithSession = (hook: Hook) => {
    setSelectedHook(hook);
    if (currentSession) {
      updateSession({ selectedHook: hook });
    }
  };

  const setScriptWithSession = (newScript: Script) => {
    setScript(newScript);
    if (currentSession) {
      updateSession({ script: newScript });
    }
  };

  const setCaptionsWithSession = (newCaptions: Caption[]) => {
    setCaptions(newCaptions);
    if (currentSession) {
      updateSession({ captions: newCaptions });
    }
  };

  const value: AppContextType = {
    currentSession,
    sessions,
    createNewSession,
    updateSession,
    loadSession,
    selectedAPI,
    setSelectedAPI,
    currentStep,
    setCurrentStep,
    selectedContentIdea,
    setSelectedContentIdea: setSelectedContentIdeaWithSession,
    selectedHook,
    setSelectedHook: setSelectedHookWithSession,
    script,
    setScript: setScriptWithSession,
    captions,
    setCaptions: setCaptionsWithSession,
    isLoading,
    error,
    setError,
    refreshSessions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};