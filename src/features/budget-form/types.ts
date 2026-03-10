export type PayType = 'hora' | 'dia' | 'semana' | 'mes';

export interface RawMaterialRow {
  id: string;
  supply: string;
  quantity: number;
  unit: string;
  costUSD: number;
}

export interface LaborRow {
  id: string;
  position: string;
  payType: PayType;
  amountUSD: number;
  timeQuantity: number;
}

export interface IndirectCostRow {
  id: string;
  description: string;
  calculationBase: string;
  costUSD: number;
}

export interface BudgetFormData {
  name: string;
  exchangeRate: number;
  profitMarginPct: number;
  lotQuantity: number;
  vatPct: number;
  saleUnit: string;
  customSaleUnit: string;
  rawMaterials: RawMaterialRow[];
  laborItems: LaborRow[];
  indirectCosts: IndirectCostRow[];
}

export type BudgetStatus = 'en-desarrollo' | 'listo';

export interface Budget {
  id: string;
  name: string;
  date: string;
  totalUSD: number;
  totalBS: number;
  status: BudgetStatus;
  data: BudgetFormData;
}

export const INITIAL_FORM_DATA: BudgetFormData = {
  name: '',
  exchangeRate: 36.5,
  profitMarginPct: 30,
  lotQuantity: 1,
  vatPct: 16,
  saleUnit: 'unidad',
  customSaleUnit: '',
  rawMaterials: [],
  laborItems: [],
  indirectCosts: [],
};

export const SALE_UNIT_OPTIONS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'lt', label: 'Litro (lt)' },
  { value: 'caja', label: 'Caja' },
  { value: 'metro', label: 'Metro' },
  { value: 'personalizada', label: 'Personalizada...' },
];

export const UNIT_OPTIONS = [
  'unidad', 'kg', 'gr', 'lt', 'ml',
  'metro', 'cm', 'caja', 'bolsa', 'rollo', 'galón',
];

export const PAY_TYPE_OPTIONS: { value: PayType; label: string }[] = [
  { value: 'hora', label: 'Por Hora' },
  { value: 'dia', label: 'Por Día' },
  { value: 'semana', label: 'Por Semana' },
  { value: 'mes', label: 'Por Mes' },
];
