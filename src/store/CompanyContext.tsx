import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'flowcost:company';

export interface PhoneEntry {
  number: string;
  type: 'call' | 'whatsapp';
}

export interface CompanyProfile {
  name: string;
  rif: string;
  address: string;
  email: string;
  phones: PhoneEntry[];
  logoBase64: string | null; // base64 data URI
}

const DEFAULT_PROFILE: CompanyProfile = {
  name: '',
  rif: '',
  address: '',
  email: '',
  phones: [
    { number: '', type: 'call' },
    { number: '', type: 'whatsapp' },
  ],
  logoBase64: null,
};

interface CompanyContextValue {
  profile: CompanyProfile;
  loading: boolean;
  saveProfile: (p: CompanyProfile) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setProfile(JSON.parse(raw) as CompanyProfile);
      })
      .catch(e => console.warn('[CompanyContext]', e))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (p: CompanyProfile) => {
    setProfile(p);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  return (
    <CompanyContext.Provider value={{ profile, loading, saveProfile }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany debe usarse dentro de <CompanyProvider>');
  return ctx;
}