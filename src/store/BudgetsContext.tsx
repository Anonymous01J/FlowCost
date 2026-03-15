import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Ref siempre actualizada — evita stale closures en callbacks
  const budgetsRef = useRef(budgets);
  useEffect(() => { budgetsRef.current = budgets; }, [budgets]);

  useEffect(() => {
    loadFromStorage().then(data => { setBudgets(data); setLoading(false); });
  }, []);

  const persist = useCallback(async (next: Budget[]) => {
    setBudgets(next);
    budgetsRef.current = next;
    await saveToStorage(next);
  }, []);

  const uniqueName = useCallback((base: string): string => {
    const names = new Set(budgetsRef.current.map(b => b.name));
    if (!names.has(base)) return base;
    const stripped = base.replace(/\s\(copia(\s\d+)?\)$/, '');
    let candidate = `${stripped} (copia)`;
    let n = 2;
    while (names.has(candidate)) {
      candidate = `${stripped} (copia ${n})`;
      n++;
    }
    return candidate;
  }, []);

  const addBudget = useCallback(async (budget: Budget) => {
    const maxNum = budgetsRef.current.reduce((m, b) => Math.max(m, b.number ?? 0), 0);
    const withNumber: Budget = { ...budget, number: maxNum + 1 };
    await persist([withNumber, ...budgetsRef.current]);
  }, [persist]);

  const updateBudget = useCallback(async (budget: Budget) => {
    await persist(budgetsRef.current.map(b => b.id === budget.id ? budget : b));
  }, [persist]);

  const updateBudgetStatus = useCallback(async (id: string, status: Budget['status']) => {
    await persist(budgetsRef.current.map(b => b.id === id ? { ...b, status } : b));
  }, [persist]);

  const deleteBudget = useCallback(async (id: string) => {
    await persist(budgetsRef.current.filter(b => b.id !== id));
  }, [persist]);

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