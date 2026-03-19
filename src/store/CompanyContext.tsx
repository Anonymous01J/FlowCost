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
  // 1. Limpiamos y dejamos solo letras y números
  const clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length === 0) return '';
  
  // 2. Extraemos la letra inicial (V, J, G, E, P, C)
  const letter = clean[0];
  if (clean.length === 1) return letter;

  // 3. Extraemos solo los números siguientes
  const digits = clean.slice(1).replace(/\D/g, '');

  // 4. Aplicamos el formato según la cantidad de números:
  // Si tiene 8 o menos, el guion va después de la letra: V-12345678
  if (digits.length <= 8) {
    return `${letter}-${digits}`;
  }
  
  // Si tiene más de 8, el noveno dígito es el verificador: V-12345678-9
  return `${letter}-${digits.slice(0, 8)}-${digits[8]}`;
}
export function formatPhoneForLink(phone: string): string {
  // Elimina todo lo que no sea número
  const clean = phone.replace(/\D/g, '');
  
  // Si no empieza por 58 (y asumimos que es Venezuela), se lo agregamos
  if (clean.length === 10 && clean.startsWith('4')) { // ej: 4121234567
     return `+58${clean}`;
  }
  if (clean.length === 11 && clean.startsWith('0')) { // ej: 04121234567
     return `+58${clean.slice(1)}`;
  }
  
  return `+${clean}`;
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