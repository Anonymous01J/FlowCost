import { Platform } from 'react-native';
import { calculateBudgetSummary } from './calculations';
import { formatVE } from '../../components/ui/InputCustom';
import type { Budget } from './types';
import type { CompanyProfile } from '../../store/CompanyContext';

// ─── Cabecera corporativa HTML (compartida) ───────────────────────────────────

function buildCompanyHeader(company: CompanyProfile | null): string {
  if (!company || !company.name) {
    return `
    <div class="header">
      <div class="logo-wrap">
        <div class="logo-badge">FC</div>
        <div>
          <div class="app-name">FlowCost</div>
          <div class="app-sub">Presupuesto de Costos de Produccion</div>
        </div>
      </div>
    </div>`;
  }

  const logoHtml = company.logoBase64
    ? `<img src="${company.logoBase64}" style="width:72px;height:72px;object-fit:contain;border-radius:8px;" />`
    : `<div class="logo-badge">FC</div>`;

  const phones = (company.phones ?? [])
    .filter(p => p.number)
    .map(p => {
      const href = p.type === 'whatsapp'
        ? `https://wa.me/${p.number.replace(/\D/g, '')}`
        : `tel:${p.number}`;
      const icon = p.type === 'whatsapp' ? 'WA' : 'Tel';
      return `<div><a href="${href}" style="color:#2563eb;text-decoration:none;">${icon}: ${p.number}</a></div>`;
    }).join('');

  return `
  <div class="company-header">
    <div class="company-left">${logoHtml}</div>
    <div class="company-right">
      <div class="company-name">${company.name}</div>
      ${company.rif     ? `<div class="company-detail">RIF: ${company.rif}</div>` : ''}
      ${company.address ? `<div class="company-detail">${company.address}</div>` : ''}
      ${phones}
      ${company.email   ? `<div class="company-detail"><a href="mailto:${company.email}" style="color:#2563eb;text-decoration:none;">${company.email}</a></div>` : ''}
    </div>
  </div>
  <hr class="company-divider" />`;
}

// ─── CSS base compartido ──────────────────────────────────────────────────────

const BASE_CSS = `
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Helvetica, Arial, sans-serif; font-size: 12px;
         color: #1e293b; padding: 32px; max-width: 900px; margin: 0 auto; }

  .print-btn { display: block; margin: 0 auto 24px auto; padding: 10px 28px;
               background: #2563eb; color: white; border: none; border-radius: 8px;
               font-size: 14px; font-weight: 700; cursor: pointer; }
  .print-btn:hover { background: #1d4ed8; }

  .company-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 16px; }
  .company-left  { flex-shrink: 0; }
  .company-right { flex: 1; }
  .company-name  { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
  .company-detail { font-size: 11px; color: #64748b; margin-top: 2px; }
  .company-divider { border: none; border-top: 2px solid #e2e8f0; margin: 16px 0 20px 0; }

  .logo-badge { display: inline-flex; width: 64px; height: 64px; background: #2563eb;
                border-radius: 8px; align-items: center; justify-content: center;
                color: white; font-weight: 800; font-size: 18px; flex-shrink: 0; }

  .doc-header { display: flex; justify-content: space-between; align-items: flex-start;
                background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
                padding: 16px; margin-bottom: 24px; }
  .doc-title h1 { font-size: 15px; font-weight: 700; }
  .doc-title p  { font-size: 11px; color: #64748b; margin-top: 3px; }
  .doc-badge { color: white; font-size: 10px; font-weight: 700;
               padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
  .doc-badge.internal { background: #2563eb; }
  .doc-badge.quote    { background: #16a34a; }

  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px;
       text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; }
  .subtotal-row td { font-weight: 700; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  .total-row   td { font-weight: 700; background: #1e293b; color: white; }
  .price-final td { background: #16a34a; color: white; font-weight: 700; }
  .center { text-align: center; }
  .right  { text-align: right; }

  .footer { border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 16px;
            font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
`;

// ─── PDF INTERNO (para el productor) ─────────────────────────────────────────

function buildInternalHtml(budget: Budget, company: CompanyProfile | null): string {
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
      <td class="center">${l.timeQuantity}x ${l.payType}</td>
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
<title>${d.name || 'Presupuesto'} - FlowCost</title>
<style>
  ${BASE_CSS}

  .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .metric { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
  .metric-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
  .metric-value { font-size: 15px; font-weight: 700; }
  .metric-sub   { font-size: 10px; color: #64748b; margin-top: 2px; }
  .metric.blue   { border-color: #bfdbfe; background: #eff6ff; }
  .metric.green  { border-color: #bbf7d0; background: #f0fdf4; }
  .metric.purple { border-color: #ddd6fe; background: #faf5ff; }
  .metric.orange { border-color: #fed7aa; background: #fff7ed; }

  .info-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
              background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
              padding: 12px 16px; margin-bottom: 20px; }
  .info-item-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; }
  .info-item-value { font-size: 12px; font-weight: 600; margin-top: 2px; }

  .section { margin-bottom: 20px; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase;
                   margin-bottom: 6px; padding: 4px 8px; border-radius: 4px; display: inline-block; }
  .section-title.blue   { color: #2563eb; background: #eff6ff; }
  .section-title.purple { color: #7c3aed; background: #faf5ff; }
  .section-title.orange { color: #ea580c; background: #fff7ed; }
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">Guardar como PDF / Imprimir</button>

${buildCompanyHeader(company)}

<div class="doc-header">
  <div class="doc-title">
    <h1>${budget.number ? '#' + budget.number + ' — ' : ''}${d.name || 'Presupuesto'}</h1>
    <p>Generado el ${new Date(budget.date + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p>Tasa de cambio: Bs. ${formatVE(s.exchangeRate)} / $</p>
  </div>
  <div class="doc-badge internal">Presupuesto Interno</div>
</div>

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
    <div class="metric-label">Margen (${formatVE(d.profitMarginPct, 1)}%)</div>
    <div class="metric-value">${formatVE(d.profitMarginPct, 1)}%</div>
    <div class="metric-sub">$ ${formatVE(s.profitAmountUSD)} por unidad</div>
  </div>
  <div class="metric orange">
    <div class="metric-label">Precio Final c/IVA</div>
    <div class="metric-value">$ ${formatVE(s.finalPriceUSD)}</div>
    <div class="metric-sub">Bs. ${formatVE(s.finalPriceBS)}</div>
  </div>
</div>

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
    <div class="info-item-label">Tamano de Lote</div>
    <div class="info-item-value">${s.lotQuantity} unidades</div>
  </div>
  <div class="info-item">
    <div class="info-item-label">IVA</div>
    <div class="info-item-value">${d.vatPct}%</div>
  </div>
</div>

<div class="section">
  <div class="section-title blue">I. Materia Prima (${d.rawMaterials.length} items)</div>
  <table>
    <thead><tr>
      <th>Insumo</th><th class="center">Cant.</th>
      <th class="right">Costo/u $</th><th class="right">Sub. $</th><th class="right">Sub. Bs.</th>
    </tr></thead>
    <tbody>
      ${mpRows || '<tr><td colspan="5" style="color:#94a3b8;text-align:center;padding:12px">Sin items</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="3">Subtotal Materia Prima</td>
        <td class="right">$ ${formatVE(s.totalRawMaterialsUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalRawMaterialsBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title purple">II. Mano de Obra (${d.laborItems.length} items)</div>
  <table>
    <thead><tr>
      <th>Cargo</th><th class="center">Tiempo</th>
      <th class="right">Monto $</th><th class="right">Sub. $</th><th class="right">Sub. Bs.</th>
    </tr></thead>
    <tbody>
      ${moRows || '<tr><td colspan="5" style="color:#94a3b8;text-align:center;padding:12px">Sin items</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="3">Subtotal Mano de Obra</td>
        <td class="right">$ ${formatVE(s.totalLaborUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalLaborBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="section">
  <div class="section-title orange">III. Costos Indirectos CIF (${d.indirectCosts.length} items)</div>
  <table>
    <thead><tr>
      <th>Detalle</th><th>Base</th>
      <th class="right">Costo $</th><th class="right">Costo Bs.</th>
    </tr></thead>
    <tbody>
      ${cifRows || '<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:12px">Sin items</td></tr>'}
      <tr class="subtotal-row">
        <td colspan="2">Subtotal CIF</td>
        <td class="right">$ ${formatVE(s.totalCIFUSD)}</td>
        <td class="right">Bs. ${formatVE(s.totalCIFBS)}</td>
      </tr>
    </tbody>
  </table>
</div>

<table class="section">
  <tbody>
    <tr class="total-row">
      <td>Costo Total del Lote (${s.lotQuantity} unid.)</td>
      <td class="right">$ ${formatVE(s.totalCostUSD)}</td>
      <td class="right">Bs. ${formatVE(s.totalCostBS)}</td>
    </tr>
  </tbody>
</table>

<div class="section" style="margin-top:20px">
  <div class="section-title blue">IV. Estructura de Precio por Unidad</div>
  <table>
    <tbody>
      <tr><td>Costo Unitario (Lote / ${s.lotQuantity})</td>
          <td class="right">$ ${formatVE(s.unitCostUSD)}</td>
          <td class="right">Bs. ${formatVE(s.unitCostBS)}</td></tr>
      <tr><td>Utilidad (${d.profitMarginPct}%)</td>
          <td class="right">$ ${formatVE(s.profitAmountUSD)}</td>
          <td class="right">Bs. ${formatVE(s.profitAmountUSD * s.exchangeRate)}</td></tr>
      <tr><td>Precio de Venta (sin IVA)</td>
          <td class="right">$ ${formatVE(s.salePriceWithoutVatUSD)}</td>
          <td class="right">Bs. ${formatVE(s.salePriceWithoutVatBS)}</td></tr>
      <tr><td>IVA (${d.vatPct}%)</td>
          <td class="right">$ ${formatVE(s.vatAmountUSD)}</td>
          <td class="right">Bs. ${formatVE(s.vatAmountBS)}</td></tr>
      <tr class="price-final">
          <td>Precio Final al Cliente</td>
          <td class="right">$ ${formatVE(s.finalPriceUSD)}</td>
          <td class="right">Bs. ${formatVE(s.finalPriceBS)}</td></tr>
    </tbody>
  </table>
</div>

<div class="footer">
  <span>${company?.name ? company.name + ' — ' : ''}FlowCost</span>
  <span>${d.name} | ${new Date().toLocaleDateString('es-VE')}</span>
</div>

</body>
</html>`;
}

// ─── PDF COTIZACIÓN PARA EL CLIENTE ──────────────────────────────────────────
// Sin costos internos, sin margen, sin desglose de insumos/MO/CIF.
// Solo lo que el cliente necesita ver: qué se produce, precio y condiciones.

function buildClientQuoteHtml(budget: Budget, company: CompanyProfile | null): string {
  const d = budget.data;
  const s = calculateBudgetSummary(d);
  const today = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
  const budgetDate = new Date(budget.date + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Cotización — ${d.name || 'Presupuesto'}</title>
<style>
  ${BASE_CSS}

  /* Estilos específicos de cotización */
  .quote-intro {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 16px; margin-bottom: 24px;
    font-size: 13px; color: #166534; line-height: 1.6;
  }

  .price-block {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 24px;
  }
  .price-card {
    border-radius: 12px; padding: 20px;
    border: 1px solid; text-align: center;
  }
  .price-card.main  { background: #f0fdf4; border-color: #86efac; }
  .price-card.alt   { background: #eff6ff; border-color: #bfdbfe; }
  .price-card-label { font-size: 10px; text-transform: uppercase;
                      color: #64748b; margin-bottom: 8px; letter-spacing: 0.05em; }
  .price-card-value { font-size: 26px; font-weight: 800; }
  .price-card.main .price-card-value { color: #16a34a; }
  .price-card.alt  .price-card-value { color: #2563eb; }
  .price-card-sub   { font-size: 11px; color: #64748b; margin-top: 4px; }

  .detail-table { margin-bottom: 24px; }
  .detail-table table { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .detail-table th { background: #f8fafc; }

  .conditions {
    background: #fefce8; border: 1px solid #fef08a;
    border-radius: 10px; padding: 16px; margin-bottom: 24px;
  }
  .conditions-title { font-size: 11px; font-weight: 700;
                       text-transform: uppercase; color: #854d0e; margin-bottom: 10px; }
  .conditions ul { padding-left: 18px; }
  .conditions li { font-size: 12px; color: #713f12; line-height: 1.7; }

  .signature-block {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 40px; margin-top: 40px; padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }
  .sig-line { border-top: 1px solid #94a3b8; margin-top: 40px; padding-top: 6px; }
  .sig-label { font-size: 10px; color: #64748b; text-align: center; }
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">Guardar como PDF / Imprimir</button>

${buildCompanyHeader(company)}

<div class="doc-header">
  <div class="doc-title">
    <h1>Cotización${budget.number ? ' #' + budget.number : ''}</h1>
    <p><strong>Descripción:</strong> ${d.name || '—'}</p>
    <p>Fecha de emisión: ${budgetDate}</p>
    <p>Tasa de cambio referencial: Bs. ${formatVE(s.exchangeRate)} / $</p>
  </div>
  <div class="doc-badge quote">Cotización</div>
</div>

<div class="quote-intro">
  Estimado cliente, a continuación le presentamos nuestra cotización para el servicio/producto
  indicado. Los precios están expresados en dólares estadounidenses (USD) y en bolívares (Bs.)
  a la tasa referencial del día de emisión.
</div>

<!-- Precio destacado -->
<div class="price-block">
  <div class="price-card main">
    <div class="price-card-label">Precio por ${s.saleUnit} (con IVA ${d.vatPct}%)</div>
    <div class="price-card-value">$ ${formatVE(s.finalPriceUSD)}</div>
    <div class="price-card-sub">Bs. ${formatVE(s.finalPriceBS)}</div>
  </div>
  <div class="price-card alt">
    <div class="price-card-label">Precio sin IVA</div>
    <div class="price-card-value">$ ${formatVE(s.salePriceWithoutVatUSD)}</div>
    <div class="price-card-sub">Bs. ${formatVE(s.salePriceWithoutVatBS)}</div>
  </div>
</div>

<!-- Desglose de precio (solo lo que ve el cliente) -->
<div class="detail-table">
  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th class="center">Cantidad</th>
        <th class="right">Precio Unit. $</th>
        <th class="right">Precio Unit. Bs.</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${d.name || 'Producto/Servicio'}</td>
        <td class="center">${s.lotQuantity} ${s.saleUnit}</td>
        <td class="right">$ ${formatVE(s.salePriceWithoutVatUSD)}</td>
        <td class="right">Bs. ${formatVE(s.salePriceWithoutVatBS)}</td>
      </tr>
      <tr>
        <td>IVA (${d.vatPct}%)</td>
        <td class="center">—</td>
        <td class="right">$ ${formatVE(s.vatAmountUSD)}</td>
        <td class="right">Bs. ${formatVE(s.vatAmountBS)}</td>
      </tr>
      <tr class="price-final">
        <td><strong>Total a pagar</strong></td>
        <td class="center">${s.lotQuantity} ${s.saleUnit}</td>
        <td class="right">$ ${formatVE(s.finalPriceUSD * s.lotQuantity)}</td>
        <td class="right">Bs. ${formatVE(s.finalPriceBS * s.lotQuantity)}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Condiciones -->
<div class="conditions">
  <div class="conditions-title">📋 Condiciones de la Cotización</div>
  <ul>
    <li>Esta cotización tiene una vigencia de <strong>15 días</strong> a partir de la fecha de emisión.</li>
    <li>Los precios están sujetos a variación según la tasa de cambio vigente al momento del pago.</li>
    <li>El IVA del ${d.vatPct}% está incluido en el precio final indicado.</li>
    <li>Para confirmar el pedido se requiere un <strong>50% de anticipo</strong>.</li>
  </ul>
</div>

<!-- Firma -->
<div class="signature-block">
  <div>
    <div class="sig-line"></div>
    <div class="sig-label">${company?.name || 'Proveedor'} — Firma y Sello</div>
  </div>
  <div>
    <div class="sig-line"></div>
    <div class="sig-label">Cliente — Acepto las condiciones</div>
  </div>
</div>

<div class="footer" style="margin-top: 24px;">
  <span>${company?.name ? company.name : 'FlowCost'}</span>
  <span>Emitido el ${today}</span>
</div>

</body>
</html>`;
}

// ─── Función compartida de exportación ───────────────────────────────────────

async function exportHtml(html: string, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (!win) throw new Error('El navegador bloqueó la ventana emergente. Permite pop-ups para esta pagina.');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    return;
  }

  const { default: Print }   = await import('expo-print') as any;
  const { default: Sharing } = await import('expo-sharing') as any;

  const result = await Print.printToFileAsync({ html, base64: false, width: 595, height: 842 });
  if (!result?.uri) throw new Error('expo-print no genero el archivo');

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: filename,
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ uri: result.uri });
  }
}

// ─── Exports públicos ─────────────────────────────────────────────────────────

/** PDF interno con todos los costos — para uso del productor */
export async function exportBudgetPDF(
  budget: Budget,
  company: CompanyProfile | null = null,
): Promise<void> {
  const html = buildInternalHtml(budget, company);
  await exportHtml(html, `Presupuesto: ${budget.name}`);
}

/** PDF cotización para el cliente — sin costos internos ni margen */
export async function exportClientQuotePDF(
  budget: Budget,
  company: CompanyProfile | null = null,
): Promise<void> {
  const html = buildClientQuoteHtml(budget, company);
  await exportHtml(html, `Cotización: ${budget.name}`);
}