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

  // Costo total del lote completo
  totalCostUSD: number;
  totalCostBS: number;

  // Costo por unidad (lote / cantidad)
  unitCostUSD: number;
  unitCostBS: number;

  // Precio de venta SIN IVA (unitario)
  // = unitCostUSD * (1 + profitMarginPct/100)
  salePriceWithoutVatUSD: number;
  salePriceWithoutVatBS: number;

  // IVA sobre el precio de venta sin IVA
  vatAmountUSD: number;
  vatAmountBS: number;

  // Precio FINAL al cliente = salePriceWithoutVat + IVA
  finalPriceUSD: number;
  finalPriceBS: number;

  // Utilidad (ganancia) por unidad
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
  const totalRawMaterialsBS  = totalRawMaterialsUSD * exchangeRate;

  const laborItems = data.laborItems.map(l => calcLabor(l, exchangeRate));
  const totalLaborUSD = laborItems.reduce((s, l) => s + l.subtotalUSD, 0);
  const totalLaborBS  = totalLaborUSD * exchangeRate;

  const indirectCosts = data.indirectCosts.map(c => calcIndirectCost(c, exchangeRate));
  const totalCIFUSD = indirectCosts.reduce((s, c) => s + c.costUSD, 0);
  const totalCIFBS  = totalCIFUSD * exchangeRate;

  // Costo total del lote
  const totalCostUSD = totalRawMaterialsUSD + totalLaborUSD + totalCIFUSD;
  const totalCostBS  = totalCostUSD * exchangeRate;

  // Costo unitario (por porción/unidad)
  const qty = lotQuantity > 0 ? lotQuantity : 1;
  const unitCostUSD = totalCostUSD / qty;
  const unitCostBS  = unitCostUSD * exchangeRate;

  // Precio de venta SIN IVA: costo unitario + margen de utilidad
  const salePriceWithoutVatUSD = unitCostUSD * (1 + profitMarginPct / 100);
  const salePriceWithoutVatBS  = salePriceWithoutVatUSD * exchangeRate;

  // IVA sobre el precio de venta sin IVA
  const vatAmountUSD = salePriceWithoutVatUSD * (vatPct / 100);
  const vatAmountBS  = vatAmountUSD * exchangeRate;

  // Precio FINAL al cliente (con IVA)
  const finalPriceUSD = salePriceWithoutVatUSD + vatAmountUSD;
  const finalPriceBS  = finalPriceUSD * exchangeRate;

  // Utilidad por unidad
  const profitAmountUSD = salePriceWithoutVatUSD - unitCostUSD;

  // Margen real sobre precio de venta sin IVA
  const profitMarginCalc = salePriceWithoutVatUSD > 0
    ? (profitAmountUSD / salePriceWithoutVatUSD) * 100
    : 0;

  return {
    rawMaterials, totalRawMaterialsUSD, totalRawMaterialsBS,
    laborItems, totalLaborUSD, totalLaborBS,
    indirectCosts, totalCIFUSD, totalCIFBS,
    totalCostUSD, totalCostBS,
    unitCostUSD, unitCostBS,
    salePriceWithoutVatUSD, salePriceWithoutVatBS,
    vatAmountUSD, vatAmountBS,
    finalPriceUSD, finalPriceBS,
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