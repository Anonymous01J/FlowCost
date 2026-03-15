import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'flowcost:onboarding_completed';

interface OnboardingContextValue {
  hasSeenOnboarding: boolean;
  loading: boolean;
  showOnboarding: () => void;
  markComplete: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => setHasSeenOnboarding(val === 'true'))
      .catch(() => setHasSeenOnboarding(false))
      .finally(() => setLoading(false));
  }, []);

  const markComplete = async () => {
    setHasSeenOnboarding(true);
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  };

  // Permite que el botón de ayuda re-muestre el onboarding
  const showOnboarding = () => setHasSeenOnboarding(false);

  return (
    <OnboardingContext.Provider value={{ hasSeenOnboarding, loading, showOnboarding, markComplete }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding debe usarse dentro de <OnboardingProvider>');
  return ctx;
}