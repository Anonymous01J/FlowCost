import React from 'react';
import { Theme, YStack } from 'tamagui';
import { useThemeContext, ThemeProvider as StateProvider } from '../../state/themeContext';

const TamaguiThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useThemeContext();
  
  return (
    <Theme name={theme}>
      {/* Usamos un YStack base con una transición CSS. 
         Esto hará que el fondo cambie suavemente en 0.5s 
      */}
        <YStack 
          flex={1} 
          backgroundColor="$background" 
          style={{ transition: 'all 0.5s ease' } as any}
        >
        {children}
      </YStack>
    </Theme>
  );
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <StateProvider>
      <TamaguiThemeWrapper>{children}</TamaguiThemeWrapper>
    </StateProvider>
  );
};