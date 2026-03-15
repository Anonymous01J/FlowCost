import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Budget } from '../features/budget-form/types';

const STORAGE_KEY = 'flowcost:budgets';

const MOCK_BUDGETS: Budget[] = [
  {
    id: '1', name: 'Producción de Queso Artesanal', date: '2026-03-01',
    totalUSD: 1240.5, totalBS: 45278.25, status: 'listo',
    data: { name: 'Producción de Queso Artesanal', exchangeRate: 36.5, profitMarginPct: 30,
            lotQuantity: 50, vatPct: 16, saleUnit: 'kg', customSaleUnit: '',
            rawMaterials: [], laborItems: [], indirectCosts: [] },
  },
  {
    id: '2', name: 'Servicio de Diseño Gráfico Q1', date: '2026-03-05',
    totalUSD: 3800.0, totalBS: 138700.0, status: 'listo',
    data: { name: 'Servicio de Diseño Gráfico Q1', exchangeRate: 36.5, profitMarginPct: 45,
            lotQuantity: 1, vatPct: 16, saleUnit: 'unidad', customSaleUnit: '',
            rawMaterials: [], laborItems: [], indirectCosts: [] },
  },
  {
    id: '3', name: 'Fabricación Muebles Oficina – Lote A', date: '2026-03-08',
    totalUSD: 6512.75, totalBS: 237716.38, status: 'en-desarrollo',
    data: { name: 'Fabricación Muebles Oficina – Lote A', exchangeRate: 36.5, profitMarginPct: 25,
            lotQuantity: 10, vatPct: 16, saleUnit: 'unidad', customSaleUnit: '',
            rawMaterials: [], laborItems: [], indirectCosts: [] },
  },
];

interface BudgetsContextValue {
  budgets: Budget[];
  loading: boolean;
  addBudget:          (budget: Budget) => Promise<void>;
  updateBudget:       (budget: Budget) => Promise<void>;
  updateBudgetStatus: (id: string, status: Budget['status']) => Promise<void>;
  deleteBudget:       (id: string) => Promise<void>;
  /** Devuelve un nombre único: si ya existe agrega " (copia)", " (copia 2)", etc. */
  uniqueName:         (base: string) => string;
}

const BudgetsContext = createContext<BudgetsContextValue | null>(null);

async function loadFromStorage(): Promise<Budget[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Budget[];
  } catch (e) { console.warn('[BudgetsContext]', e); }
  return MOCK_BUDGETS;
}

async function saveToStorage(budgets: Budget[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (e) { console.warn('[BudgetsContext]', e); }
}

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage().then(data => { setBudgets(data); setLoading(false); });
  }, []);

  const persist = useCallback(async (next: Budget[]) => {
    setBudgets(next);
    await saveToStorage(next);
  }, []);

  // Genera un nombre único en base a los existentes
  const uniqueName = useCallback((base: string): string => {
    const names = new Set(budgets.map(b => b.name));
    if (!names.has(base)) return base;
    // Quita sufijo previo tipo " (copia N)" para no acumularlos
    const stripped = base.replace(/\s\(copia(\s\d+)?\)$/, '');
    let candidate = `${stripped} (copia)`;
    let n = 2;
    while (names.has(candidate)) {
      candidate = `${stripped} (copia ${n})`;
      n++;
    }
    return candidate;
  }, [budgets]);

  const addBudget = useCallback(async (budget: Budget) => {
    await persist([budget, ...budgets]);
  }, [budgets, persist]);

  const updateBudget = useCallback(async (budget: Budget) => {
    await persist(budgets.map(b => b.id === budget.id ? budget : b));
  }, [budgets, persist]);

  const updateBudgetStatus = useCallback(async (id: string, status: Budget['status']) => {
    await persist(budgets.map(b => b.id === id ? { ...b, status } : b));
  }, [budgets, persist]);

  const deleteBudget = useCallback(async (id: string) => {
    await persist(budgets.filter(b => b.id !== id));
  }, [budgets, persist]);

  return (
    <BudgetsContext.Provider value={{
      budgets, loading, addBudget, updateBudget,
      updateBudgetStatus, deleteBudget, uniqueName,
    }}>
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const ctx = useContext(BudgetsContext);
  if (!ctx) throw new Error('useBudgets debe usarse dentro de <BudgetsProvider>');
  return ctx;
}