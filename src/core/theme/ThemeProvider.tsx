import React, { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme } from 'tamagui';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Detecta si el sistema del usuario está en modo oscuro o claro
  const colorScheme = useColorScheme();

  return (
    <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
      {children}
    </Theme>
  );
};