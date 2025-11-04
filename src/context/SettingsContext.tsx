import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

/**
 * Global settings context with reducer pattern
 */

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  mapStyle: 'default' | 'satellite' | 'terrain';
  language: string;
  hudEnabled: boolean;
  gamificationEnabled: boolean;
}

type SettingsAction =
  | { type: 'SET_THEME'; payload: SettingsState['theme'] }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'SET_MAP_STYLE'; payload: SettingsState['mapStyle'] }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_HUD' }
  | { type: 'TOGGLE_GAMIFICATION' }
  | { type: 'RESET_SETTINGS' };

const initialState: SettingsState = {
  theme: 'system',
  soundEnabled: true,
  notificationsEnabled: true,
  mapStyle: 'default',
  language: 'en',
  hudEnabled: true,
  gamificationEnabled: true,
};

const STORAGE_KEY = 'app_settings';

// Load settings from localStorage
const loadSettings = (): SettingsState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
};

// Reducer
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    case 'SET_MAP_STYLE':
      return { ...state, mapStyle: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'TOGGLE_HUD':
      return { ...state, hudEnabled: !state.hudEnabled };
    case 'TOGGLE_GAMIFICATION':
      return { ...state, gamificationEnabled: !state.gamificationEnabled };
    case 'RESET_SETTINGS':
      return initialState;
    default:
      return state;
  }
};

// Context
const SettingsContext = createContext<{
  settings: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
} | undefined>(undefined);

// Provider
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, dispatch] = useReducer(settingsReducer, initialState, loadSettings);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, dispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
