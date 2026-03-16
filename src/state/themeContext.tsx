import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'flowcost:theme_mode';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Valor por defecto — usado cuando el contexto no está montado todavía
// (ej: portales de Sheet/Modal que se renderizan fuera del árbol)
// En lugar de lanzar un error, devuelve 'light' silenciosamente
const DEFAULT_CONTEXT: ThemeContextType = {
  theme: 'light',
  mode: 'system',
  setMode: () => {},
  toggleTheme: () => {},
};

const ThemeContext = createContext<ThemeContextType>(DEFAULT_CONTEXT);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  };

  const theme: 'light' | 'dark' =
    mode === 'system'
      ? systemColorScheme === 'dark' ? 'dark' : 'light'
      : mode;

  const toggleTheme = () => {
    setMode(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Ya no lanza error — devuelve el valor por defecto si no hay provider
// Esto permite que InputCustom funcione dentro de portales de Sheet/Modal
export const useThemeContext = () => useContext(ThemeContext);