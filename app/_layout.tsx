import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform } from 'react-native';
import config from '../tamagui.config';

import { ThemeProvider, useThemeContext } from '../src/state/themeContext';
import { BudgetsProvider } from '../src/store/BudgetsContext';
import { CompanyProvider } from '../src/store/CompanyContext';
import { OnboardingProvider, useOnboarding } from '../src/store/OnboardingContext';
import FlowCostOnboarding from '../src/features/onboarding/FlowCostOnboarding';
import FlowCostSplash from '../src/components/ui/SplashScreen';

SplashScreen.preventAutoHideAsync();

// SEO para web — sin usar <Head> de expo-router (causa React error #130 en producción)
function WebSEO() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.title = 'FlowCost — Calcula tus costos. Fija tu precio.';
    const setMeta = (name: string, content: string, isOg = false) => {
      const attr = isOg ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Calcula los costos de tus productos, fija tu precio de venta y genera cotizaciones en PDF para tus clientes. Ideal para emprendedores y pequeños negocios.');
    setMeta('keywords', 'FlowCost, presupuesto, cotización, costos, precio de venta, negocios, emprendedores');
    setMeta('og:title', 'FlowCost — Calcula tus costos. Fija tu precio.', true);
    setMeta('og:description', 'Genera presupuestos y cotizaciones profesionales en PDF.', true);
    setMeta('og:type', 'website', true);
  }, []);
  return null;
}

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
    <TamaguiProvider config={config} defaultTheme="light">
      <ThemeProvider>
        <TamaguiThemeSync>
          <WebSEO />
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
  );
}