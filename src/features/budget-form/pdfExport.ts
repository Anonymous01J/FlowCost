import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { calculateBudgetSummary } from './calculations';
import { formatVE } from '../../components/ui/InputCustom';
import type { Budget } from './types';

function buildHtml(budget: Budget): string {
  const d = budget.data;
  const s = calculateBudgetSummary(d);

  const mpRows = s.rawMaterials.map(r => `
    <tr>
      <td>${r.supply || '—'}</td>
      <td class="center">${r.quantity} ${r.unit}</td>
      <td class="right">$ ${formatVE(r.costUSD)}</td>
      <td class="right">$ ${formatVE(r.subtotalUSD)}</td>
      <td class="right">Bs. ${formatVE(r.subtotalBS)}</td>
    </tr>`).join('');

  const moRows = s.laborItems.map(l => `
    <tr>
      <td>${l.position || '—'}</td>
      <td class="center">${l.timeQuantity}× ${l.payType}</td>
      <td class="right">$ ${formatVE(l.amountUSD)}</td>
      <td class="right">$ ${formatVE(l.subtotalUSD)}</td>
      <td class="right">Bs. ${formatVE(l.subtotalBS)}</td>
    </tr>`).join('');

  const cifRows = s.indirectCosts.map(c => `
    <tr>
      <td>${c.description || '—'}</td>
      <td>${c.calculationBase || '—'}</td>
      <td class="right">$ ${formatVE(c.costUSD)}</td>
      <td class="right">Bs. ${formatVE(c.costBS)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 32px; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-badge { width: 36px; height: 36px; background: #2563eb; border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: 800; font-size: 13px; }
  .app-name { font-size: 20px; font-weight: 800; color: #1e293b; }
  .app-sub  { font-size: 11px; color: #64748b; margin-top: 2px; }
  .budget-title { text-align: right; }
  .budget-title h1 { font-size: 16px; font-weight: 700; color: #1e293b; }
  .budget-title p  { font-size: 11px; color: #64748b; margin-top: 3px; }

  /* Metric cards */
  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
  .metric { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
  .metric-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px; }
  .metric-value { font-size: 16px; font-weight: 700; color: #1e293b; }
  .metric-sub   { font-size: 10px; color: #64748b; margin-top: 2px; }
  .metric.blue   { border-color: #bfdbfe; background: #eff6ff; }
  .metric.green  { border-color: #bbf7d0; background: #f0fdf4; }
  .metric.purple { border-color: #ddd6fe; background: #faf5ff; }
  .metric.orange { border-color: #fed7aa; background: #fff7ed; }

  /* Info row */
  .info-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
              background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
              padding: 12px 16px; margin-bottom: 24px; }
  .info-item-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; }
  .info-item-value { font-size: 12px; font-weight: 600; color: #1e293b; margin-top: 2px; }

  /* Tables */
  .section { margin-bottom: 20px; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase;
                   letter-spacing: 0.5px; margin-bottom: 6px; padding: 4px 8px;
                   border-radius: 4px; display: inline-block; }
  .section-title.blue   { color: #2563eb; background: #eff6ff; }
  .section-title.purple { color: #7c3aed; background: #faf5ff; }
  .section-title.orange { color: #ea580c; background: #fff7ed; }

  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px;
       text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:last-child td { border-bottom: none; }
  .subtotal-row td { font-weight: 700; background: #f8fafc; color: #1e293b; border-top: 1px solid #e2e8f0; }
  .total-row   td { font-weight: 700; background: #1e293b; color: white; font-size: 12px; }
  .center { text-align: center; }
  .right  { text-align: right; }

  /* Price breakdown */
  .price-table { margin-bottom: 28px; }
  .price-final td { background: #16a34a; color: white; font-weight: 700; font-size: 13px; }

  /* Footer */
  .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 8px;
            display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="logo">
    <div class="logo-badge">FC</div>
    <div>
      <div class="app-name">FlowCost</div>
      <div class="app-sub">Presupuesto de Costos de Producción</div>
    </div>
  </div>
  <div class="budget-title">
    <h1>${d.name || 'Presupuesto'}</h1>
    <p>Generado el ${new Date(budget.date + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p>Tasa de cambio: Bs. ${formatVE(s.exchangeRate)} / $</p>
  </div>
</div>

<!-- Métricas -->
<div class="metrics">
  <div class="metric blue">
    <div class="metric-label">Costo Unitario</div>
    <div class="metric-value">$ ${formatVE(s.unitCostUSD)}</div>
    <div class="metric-sub">Bs. ${formatVE(s.unitCostBS)}</div>
  </div>
  <div class="metric green">
    <div class="metric-label">Precio s/IVA</div>
    <div class="metric-value">$ ${formatVE(s.salePriceWithoutVatUSD)}</div>
    <div class="metric-sub">Bs. ${formatVE(s.salePriceWithoutVatBS)}</div>
  </div>
  <div class="metric purple">
    <div class="metric-label">Margen Utilidad</div>
    <div class="metric-value">${formatVE(s.profitMarginPct, 1)}%</div>
    <div class="metric-sub">$ ${formatVE(s.profitAmountUSD)} por unidad</div>
  </div>
  <div class="metric orange">
    <div class="metric-label">Precio Final c/IVA</div>
    <div class="metric-value">$ ${formatVE(s.finalPriceUSD)}</div>
    <div class="metric-sub">Bs. ${formatVE(s.finalPriceBS)}</div>
  </div>
</div>

<!-- Info general -->
<div class="info-row">
  <div class="info-item">
    <div class="info-item-label">Presupuesto</div>
    <div class="info-item-value">${d.name || '—'}</div>
  </div>
  <div class="info-item">
    <div class="info-item-label">Unidad de Venta</div>
    <div class="info-item-value">${s.saleUnit || '—'}</div>
  </div>
  <div class="info-item">
    <div class="info-item-label">Tamaño de Lote</div>
    <div class="info-item-value">${s.lotQuantity} unidades</div>
  </div>
  <div class="info-item">
    <div class="info-item-label">IVA aplicado</div>
    <div class="info-item-value">${d.vatPct}%</div>
  </div>
</div>

<!-- Materia Prima -->
<div class="section">
  <div class="section-title blue">I. Materia Prima (${d.rawMaterials.length} ítems)</div>
  <table>
    <thead><tr>
      <th>Ingrediente / Insumo</th><th class="center">Cant.</th>
      <th class="right">Costo/u ($)</th><th class="right">Sub. ($)</th><th class="right">Sub. (Bs.)</th>
    </tr></thead>
    <tbody>
      ${mpRows || '<tr><td colspan="5" style="color:#94a3b8;text-align:center">Sin ítems</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="3">Subtotal Materia Prima</td>
        <td class="right">$ ${formatVE(s.totalRawMaterialsUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalRawMaterialsBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Mano de Obra -->
<div class="section">
  <div class="section-title purple">II. Mano de Obra (${d.laborItems.length} ítems)</div>
  <table>
    <thead><tr>
      <th>Cargo / Rol</th><th class="center">Tiempo</th>
      <th class="right">Monto ($)</th><th class="right">Sub. ($)</th><th class="right">Sub. (Bs.)</th>
    </tr></thead>
    <tbody>
      ${moRows || '<tr><td colspan="5" style="color:#94a3b8;text-align:center">Sin ítems</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="3">Subtotal Mano de Obra</td>
        <td class="right">$ ${formatVE(s.totalLaborUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalLaborBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- CIF -->
<div class="section">
  <div class="section-title orange">III. Costos Indirectos CIF (${d.indirectCosts.length} ítems)</div>
  <table>
    <thead><tr>
      <th>Detalle</th><th>Base de Cálculo</th>
      <th class="right">Costo ($)</th><th class="right">Costo (Bs.)</th>
    </tr></thead>
    <tbody>
      ${cifRows || '<tr><td colspan="4" style="color:#94a3b8;text-align:center">Sin ítems</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="2">Subtotal CIF</td>
        <td class="right">$ ${formatVE(s.totalCIFUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalCIFBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Costo total lote -->
<table class="section">
  <tbody>
    <tr class="total-row">
      <td>Costo Total del Lote (${s.lotQuantity} unid.)</td>
      <td class="right">$ ${formatVE(s.totalCostUSD)}</td>
      <td class="right">Bs. ${formatVE(s.totalCostBS)}</td>
    </tr>
  </tbody>
</table>

<!-- Precio por unidad -->
<div class="section">
  <div class="section-title blue">IV. Estructura de Precio por Unidad</div>
  <table class="price-table">
    <tbody>
      <tr>
        <td>Costo Unitario (Lote ÷ ${s.lotQuantity})</td>
        <td class="right">$ ${formatVE(s.unitCostUSD)}</td>
        <td class="right">Bs. ${formatVE(s.unitCostBS)}</td>
      </tr>
      <tr>
        <td>Utilidad (${d.profitMarginPct}%)</td>
        <td class="right">$ ${formatVE(s.profitAmountUSD)}</td>
        <td class="right">Bs. ${formatVE(s.profitAmountUSD * s.exchangeRate)}</td>
      </tr>
      <tr>
        <td>Precio de Venta (sin IVA)</td>
        <td class="right">$ ${formatVE(s.salePriceWithoutVatUSD)}</td>
        <td class="right">Bs. ${formatVE(s.salePriceWithoutVatBS)}</td>
      </tr>
      <tr>
        <td>IVA (${d.vatPct}%)</td>
        <td class="right">$ ${formatVE(s.vatAmountUSD)}</td>
        <td class="right">Bs. ${formatVE(s.vatAmountBS)}</td>
      </tr>
      <tr class="price-final">
        <td>Precio Final al Cliente</td>
        <td class="right">$ ${formatVE(s.finalPriceUSD)}</td>
        <td class="right">Bs. ${formatVE(s.finalPriceBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Footer -->
<div class="footer">
  <span>FlowCost · Presupuesto generado automáticamente</span>
  <span>${d.name} · ${new Date().toLocaleDateString('es-VE')}</span>
</div>

</body>
</html>`;
}

export async function exportBudgetPDF(budget: Budget): Promise<void> {
  const html = buildHtml(budget);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Exportar: ${budget.name}`,
      UTI: 'com.adobe.pdf',
    });
  }
}