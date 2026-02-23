import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config'; 
import { ThemeProvider } from '../src/core/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </TamaguiProvider>
  );
}