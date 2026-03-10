import type { BudgetFormData, RawMaterialRow, LaborRow, IndirectCostRow } from './types';

export interface RawMaterialCalc extends RawMaterialRow {
  costBS: number;
  subtotalUSD: number;
  subtotalBS: number;
}

export interface LaborCalc extends LaborRow {
  subtotalUSD: number;
  subtotalBS: number;
}

export interface IndirectCostCalc extends IndirectCostRow {
  costBS: number;
}

export interface BudgetSummary {
  rawMaterials: RawMaterialCalc[];
  totalRawMaterialsUSD: number;
  totalRawMaterialsBS: number;
  laborItems: LaborCalc[];
  totalLaborUSD: number;
  totalLaborBS: number;
  indirectCosts: IndirectCostCalc[];
  totalCIFUSD: number;
  totalCIFBS: number;
  totalCostUSD: number;
  totalCostBS: number;
  unitCostUSD: number;
  unitCostBS: number;
  priceBeforeVatUSD: number;
  priceBeforeVatBS: number;
  vatAmountUSD: number;
  vatAmountBS: number;
  salePriceUSD: number;
  salePriceBS: number;
  profitAmountUSD: number;
  profitMarginPct: number;
  saleUnit: string;
  lotQuantity: number;
  exchangeRate: number;
}

export function calcRawMaterial(row: RawMaterialRow, exchangeRate: number): RawMaterialCalc {
  const costBS = row.costUSD * exchangeRate;
  const subtotalUSD = row.quantity * row.costUSD;
  const subtotalBS = subtotalUSD * exchangeRate;
  return { ...row, costBS, subtotalUSD, subtotalBS };
}

export function calcLabor(row: LaborRow, exchangeRate: number): LaborCalc {
  const subtotalUSD = row.amountUSD * row.timeQuantity;
  const subtotalBS = subtotalUSD * exchangeRate;
  return { ...row, subtotalUSD, subtotalBS };
}

export function calcIndirectCost(row: IndirectCostRow, exchangeRate: number): IndirectCostCalc {
  const costBS = row.costUSD * exchangeRate;
  return { ...row, costBS };
}

export function calculateBudgetSummary(data: BudgetFormData): BudgetSummary {
  const { exchangeRate, profitMarginPct, lotQuantity, vatPct } = data;

  const rawMaterials = data.rawMaterials.map(r => calcRawMaterial(r, exchangeRate));
  const totalRawMaterialsUSD = rawMaterials.reduce((s, r) => s + r.subtotalUSD, 0);
  const totalRawMaterialsBS = totalRawMaterialsUSD * exchangeRate;

  const laborItems = data.laborItems.map(l => calcLabor(l, exchangeRate));
  const totalLaborUSD = laborItems.reduce((s, l) => s + l.subtotalUSD, 0);
  const totalLaborBS = totalLaborUSD * exchangeRate;

  const indirectCosts = data.indirectCosts.map(c => calcIndirectCost(c, exchangeRate));
  const totalCIFUSD = indirectCosts.reduce((s, c) => s + c.costUSD, 0);
  const totalCIFBS = totalCIFUSD * exchangeRate;

  const totalCostUSD = totalRawMaterialsUSD + totalLaborUSD + totalCIFUSD;
  const totalCostBS = totalCostUSD * exchangeRate;

  const qty = lotQuantity > 0 ? lotQuantity : 1;
  const unitCostUSD = totalCostUSD / qty;
  const unitCostBS = unitCostUSD * exchangeRate;

  const priceBeforeVatUSD = unitCostUSD * (1 + profitMarginPct / 100);
  const priceBeforeVatBS = priceBeforeVatUSD * exchangeRate;
  const vatAmountUSD = priceBeforeVatUSD * (vatPct / 100);
  const vatAmountBS = vatAmountUSD * exchangeRate;
  const salePriceUSD = priceBeforeVatUSD + vatAmountUSD;
  const salePriceBS = salePriceUSD * exchangeRate;

  const profitAmountUSD = priceBeforeVatUSD - unitCostUSD;
  const profitMarginCalc =
    salePriceUSD > 0 ? ((salePriceUSD - unitCostUSD) / salePriceUSD) * 100 : 0;

  return {
    rawMaterials,
    totalRawMaterialsUSD,
    totalRawMaterialsBS,
    laborItems,
    totalLaborUSD,
    totalLaborBS,
    indirectCosts,
    totalCIFUSD,
    totalCIFBS,
    totalCostUSD,
    totalCostBS,
    unitCostUSD,
    unitCostBS,
    priceBeforeVatUSD,
    priceBeforeVatBS,
    vatAmountUSD,
    vatAmountBS,
    salePriceUSD,
    salePriceBS,
    profitAmountUSD,
    profitMarginPct: profitMarginCalc,
    saleUnit: data.saleUnit === 'personalizada' ? data.customSaleUnit : data.saleUnit,
    lotQuantity: qty,
    exchangeRate,
  };
}

export const fmt = (n: number, decimals = 2) =>
  n.toLocaleString('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
