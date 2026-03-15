import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import config from '../tamagui.config';
import { ThemeProvider } from '../src/core/theme/ThemeProvider';
import { BudgetsProvider } from '../src/store/BudgetsContext';
import { CompanyProvider } from '../src/store/CompanyContext';
import { OnboardingProvider, useOnboarding } from '../src/store/OnboardingContext';
import FlowCostOnboarding from '../src/features/onboarding/FlowCostOnboarding';

SplashScreen.preventAutoHideAsync();

// Envuelve el Stack con la lógica de onboarding
function AppContent() {
  const { hasSeenOnboarding, loading } = useOnboarding();

  if (loading) return null;

  // Primera vez → muestra onboarding a pantalla completa
  if (!hasSeenOnboarding) {
    return (
      <View style={{ flex: 1 }}>
        <FlowCostOnboarding />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Thin':       require('../assets/fonts/Inter-Thin.ttf'),
    'Inter-ExtraLight': require('../assets/fonts/Inter-ExtraLight.ttf'),
    'Inter-Light':      require('../assets/fonts/Inter-Light.ttf'),
    'Inter-Regular':    require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium':     require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold':   require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold':       require('../assets/fonts/Inter-Bold.ttf'),
    'Inter-ExtraBold':  require('../assets/fonts/Inter-ExtraBold.ttf'),
    'Inter-Black':      require('../assets/fonts/Inter-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <ThemeProvider>
        <OnboardingProvider>
          <CompanyProvider>
            <BudgetsProvider>
              <AppContent />
            </BudgetsProvider>
          </CompanyProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}