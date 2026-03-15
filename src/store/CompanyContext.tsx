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


/** Valida formato de RIF venezolano: J-12345678-9, V-12345678, etc. */
export function validateRIF(rif: string): boolean {
  if (!rif) return true; // campo opcional
  return /^[VJGEP]-?\d{7,8}-?\d$/.test(rif.trim().toUpperCase());
}

/** Formatea RIF mientras se escribe: J12345678 → J-12345678-9 */
export function formatRIF(raw: string): string {
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  const letter = clean[0];
  const digits = clean.slice(1).replace(/\D/g, '');
  if (digits.length <= 8) return `${letter}-${digits}`;
  return `${letter}-${digits.slice(0, 8)}-${digits[8] ?? ''}`;
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