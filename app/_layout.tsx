import { Head, Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import config from '../tamagui.config';

import { ThemeProvider, useThemeContext } from '../src/state/themeContext';
import { BudgetsProvider } from '../src/store/BudgetsContext';
import { CompanyProvider } from '../src/store/CompanyContext';
import { OnboardingProvider, useOnboarding } from '../src/store/OnboardingContext';
import FlowCostOnboarding from '../src/features/onboarding/FlowCostOnboarding';
import FlowCostSplash from '../src/components/ui/SplashScreen';

SplashScreen.preventAutoHideAsync();

function TamaguiThemeSync({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();
  return (
    <Theme name={theme}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </Theme>
  );
}

function AppContent() {
  const { hasSeenOnboarding, loading } = useOnboarding();
  const [splashDone, setSplashDone] = useState(false);

  if (loading) return null;

  // Muestra el splash animado primero, siempre (primera apertura o regreso)
  if (!splashDone) {
    return <FlowCostSplash onFinish={() => setSplashDone(true)} />;
  }

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
    <>
      <Head>
        <title>FlowCost - Calcula tus Costos y Genera Cotizaciones Fácilmente</title>
        <meta name="description" content="Con FlowCost, puedes calcular los costos de tus productos, determinar precios de venta y generar cotizaciones en PDF para tus clientes. Ideal para emprendedores y pequeños negocios." />
        <meta name="keywords" content="FlowCost, presupuesto, cotización, calcular costos, precio de venta, negocios, emprendedores, materia prima, mano de obra, costos indirectos, ganancia, PDF" />
      </Head>
      <TamaguiProvider config={config} defaultTheme="light">
        <ThemeProvider>
          <TamaguiThemeSync>
            <OnboardingProvider>
              <CompanyProvider>
                <BudgetsProvider>
                  <AppContent />
                </BudgetsProvider>
              </CompanyProvider>
            </OnboardingProvider>
          </TamaguiThemeSync>
        </ThemeProvider>
      </TamaguiProvider>
    </>
  );
}