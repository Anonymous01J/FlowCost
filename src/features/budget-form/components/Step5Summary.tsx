import React from 'react';
import { Share } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, Separator } from 'tamagui';
import {
  CheckCircle,
  TrendingUp,
  Package,
  DollarSign,
  ReceiptText,
  FileDown,
} from '@tamagui/lucide-icons';
import type { BudgetFormData } from '../types';
import { calculateBudgetSummary, fmt, type RawMaterialCalc, type LaborCalc, type IndirectCostCalc } from '../calculations';

// NOTA: Para PDF nativo instala:
//   expo install expo-print expo-sharing
// Luego descomenta el bloque de importación y la función generatePdf.
//
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';

interface Props {
  data: BudgetFormData;
  onSaveAndExport: () => void;
}

// ─── Componente: fila de sección con USD y BS ────────────────────────────────
function SectionRow({ label, usd, bs }: { label: string; usd: number; bs: number }) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" paddingVertical="$2">
      <SizableText size="$3" color="$color" flex={1} paddingRight="$2">
        {label}
      </SizableText>
      <XStack gap="$4">
        <SizableText size="$3" fontWeight="600" color="$color" minWidth={90} textAlign="right">
          $ {fmt(usd)}
        </SizableText>
        <SizableText size="$3" color="$colorSubtitle" minWidth={100} textAlign="right">
          Bs. {fmt(bs)}
        </SizableText>
      </XStack>
    </XStack>
  );
}

// ─── Componente: tarjeta de métrica ─────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  sub,
  backgroundColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <Card
      flex={1}
      padding="$3"
      gap="$2"
      backgroundColor={backgroundColor as any}
      borderColor={borderColor as any}
      borderWidth={1}
      borderRadius="$4"
    >
      <XStack alignItems="center" gap="$2">
        {icon}
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">
          {label}
        </SizableText>
      </XStack>
      <SizableText size="$6" fontWeight="700" color="$color">
        {value}
      </SizableText>
      {sub && (
        <SizableText size="$2" color="$colorSubtitle">
          {sub}
        </SizableText>
      )}
    </Card>
  );
}

// ─── Genera HTML para expo-print ─────────────────────────────────────────────
function buildPrintHtml(data: BudgetFormData) {
  const s = calculateBudgetSummary(data);
  return `
  <!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body { font-family: sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 8px; background: #f5f5f5; font-size: 12px; }
    td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
    .total-row td { font-weight: bold; background: #111; color: #fff; }
    .metric { display: inline-block; width: 22%; margin: 0 1% 12px 1%; padding: 12px;
               border: 1px solid #e5e7eb; border-radius: 8px; vertical-align: top; }
    .metric-label { font-size: 10px; text-transform: uppercase; color: #999; }
    .metric-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
    .metric-sub { font-size: 11px; color: #999; margin-top: 2px; }
  </style></head><body>
  <h1>${data.name || 'Presupuesto FlowCost'}</h1>
  <p class="sub">Generado el ${new Date().toLocaleDateString('es-VE')} · Tasa: Bs. ${fmt(s.exchangeRate)}</p>

  <div>
    <div class="metric">
      <div class="metric-label">Costo Unitario</div>
      <div class="metric-value">$${fmt(s.unitCostUSD)}</div>
      <div class="metric-sub">Bs. ${fmt(s.unitCostBS)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Precio de Venta</div>
      <div class="metric-value">$${fmt(s.salePriceUSD)}</div>
      <div class="metric-sub">Bs. ${fmt(s.salePriceBS)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Margen</div>
      <div class="metric-value">${fmt(s.profitMarginPct, 1)}%</div>
      <div class="metric-sub">Utilidad: $${fmt(s.profitAmountUSD)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">IVA (${data.vatPct}%)</div>
      <div class="metric-value">$${fmt(s.vatAmountUSD)}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Materia Prima</th><th>Cant.</th><th>Sub. USD</th><th>Sub. Bs.</th></tr></thead>
    <tbody>
      ${s.rawMaterials.map((r: RawMaterialCalc) => `<tr><td>${r.supply}</td><td>${r.quantity} ${r.unit}</td><td>$${fmt(r.subtotalUSD)}</td><td>Bs. ${fmt(r.subtotalBS)}</td></tr>`).join('')}
      <tr><td colspan="2"><b>Subtotal MP</b></td><td><b>$${fmt(s.totalRawMaterialsUSD)}</b></td><td><b>Bs. ${fmt(s.totalRawMaterialsBS)}</b></td></tr>
    </tbody>
  </table>

  <table>
    <thead><tr><th>Mano de Obra</th><th>Tipo</th><th>Sub. USD</th><th>Sub. Bs.</th></tr></thead>
    <tbody>
      ${s.laborItems.map((l: LaborCalc) => `<tr><td>${l.position}</td><td>${l.timeQuantity}× ${l.payType}</td><td>$${fmt(l.subtotalUSD)}</td><td>Bs. ${fmt(l.subtotalBS)}</td></tr>`).join('')}
      <tr><td colspan="2"><b>Subtotal MO</b></td><td><b>$${fmt(s.totalLaborUSD)}</b></td><td><b>Bs. ${fmt(s.totalLaborBS)}</b></td></tr>
    </tbody>
  </table>

  <table>
    <thead><tr><th>CIF</th><th>Base</th><th>USD</th><th>Bs.</th></tr></thead>
    <tbody>
      ${s.indirectCosts.map((c: IndirectCostCalc) => `<tr><td>${c.description}</td><td>${c.calculationBase}</td><td>$${fmt(c.costUSD)}</td><td>Bs. ${fmt(c.costBS)}</td></tr>`).join('')}
      <tr><td colspan="2"><b>Subtotal CIF</b></td><td><b>$${fmt(s.totalCIFUSD)}</b></td><td><b>Bs. ${fmt(s.totalCIFBS)}</b></td></tr>
    </tbody>
  </table>

  <table>
    <tbody>
      <tr class="total-row"><td colspan="2">Costo Total del Lote</td><td>$${fmt(s.totalCostUSD)}</td><td>Bs. ${fmt(s.totalCostBS)}</td></tr>
    </tbody>
  </table>
  </body></html>`;
}

// ─── Componente principal ────────────────────────────────────────────────────
export function Step5Summary({ data, onSaveAndExport }: Props) {
  const s = calculateBudgetSummary(data);

  const handleExport = async () => {
    // ── Opción A: expo-print + expo-sharing (instala las dependencias primero) ──
    // try {
    //   const { uri } = await Print.printToFileAsync({ html: buildPrintHtml(data) });
    //   await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: '.pdf' });
    // } catch (e) {
    //   console.error('Error al exportar PDF:', e);
    // }

    // ── Opción B (fallback): Share nativo de texto mientras no estén instaladas las deps ──
    const s2 = calculateBudgetSummary(data);
    const text = [
      `📊 ${data.name || 'Presupuesto FlowCost'}`,
      ``,
      `Costo Unitario: $${fmt(s2.unitCostUSD)} | Bs. ${fmt(s2.unitCostBS)}`,
      `Precio de Venta: $${fmt(s2.salePriceUSD)} | Bs. ${fmt(s2.salePriceBS)}`,
      `Margen: ${fmt(s2.profitMarginPct, 1)}%`,
      `IVA (${data.vatPct}%): $${fmt(s2.vatAmountUSD)}`,
      ``,
      `─ MP: $${fmt(s2.totalRawMaterialsUSD)}  MO: $${fmt(s2.totalLaborUSD)}  CIF: $${fmt(s2.totalCIFUSD)}`,
      `Total Lote: $${fmt(s2.totalCostUSD)} | Bs. ${fmt(s2.totalCostBS)}`,
    ].join('\n');

    await Share.share({ message: text, title: data.name || 'Presupuesto FlowCost' });
    onSaveAndExport();
  };

  return (
    <YStack gap="$5">
      {/* Banner de confirmación */}
      <XStack alignItems="center" gap="$2">
        <CheckCircle size={18} color="$green9" />
        <SizableText size="$3" color="$green9" flex={1}>
          Revisa el resumen antes de guardar. Puedes volver a cualquier paso para editar.
        </SizableText>
      </XStack>

      {/* Métricas clave — 2x2 */}
      <XStack gap="$3" flexWrap="wrap">
        <MetricCard
          icon={<Package size={14} color="$blue9" />}
          label="Costo Unitario"
          value={`$${fmt(s.unitCostUSD)}`}
          sub={`Bs. ${fmt(s.unitCostBS)}`}
          backgroundColor="$blue3"
          borderColor="$blue6"
        />
        <MetricCard
          icon={<DollarSign size={14} color="$green9" />}
          label="Precio de Venta"
          value={`$${fmt(s.salePriceUSD)}`}
          sub={`Bs. ${fmt(s.salePriceBS)}`}
          backgroundColor="$green3"
          borderColor="$green6"
        />
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <MetricCard
          icon={<TrendingUp size={14} color="$purple9" />}
          label="Margen Ganancia"
          value={`${fmt(s.profitMarginPct, 1)}%`}
          sub={`Utilidad: $${fmt(s.profitAmountUSD)}`}
          backgroundColor="$purple3"
          borderColor="$purple6"
        />
        <MetricCard
          icon={<ReceiptText size={14} color="$orange9" />}
          label="IVA Incluido"
          value={`$${fmt(s.vatAmountUSD)}`}
          sub={`${data.vatPct}% sobre precio`}
          backgroundColor="$orange3"
          borderColor="$orange6"
        />
      </XStack>

      {/* Info general */}
      <Card
        backgroundColor="$backgroundStrong"
        borderColor="$borderColor"
        borderWidth={1}
        borderRadius="$4"
        padding="$4"
      >
        <XStack flexWrap="wrap" gap="$3">
          {[
            { label: 'Presupuesto', value: data.name || '—' },
            { label: 'Unidad de Venta', value: s.saleUnit || '—' },
            { label: 'Tamaño de Lote', value: `${s.lotQuantity} unid.` },
            { label: 'Tasa de Cambio', value: `Bs. ${fmt(s.exchangeRate)} / $` },
          ].map((item) => (
            <YStack key={item.label} minWidth="45%" flex={1}>
              <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">
                {item.label}
              </SizableText>
              <SizableText size="$3" fontWeight="600" color="$color" numberOfLines={1}>
                {item.value}
              </SizableText>
            </YStack>
          ))}
        </XStack>
      </Card>

      {/* Desglose de costos */}
      <YStack>
        <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
          Desglose de Costos
        </SizableText>

        <Card borderColor="$borderColor" borderWidth={1} borderRadius="$4" overflow="hidden">
          {/* Cabecera */}
          <YStack backgroundColor="$backgroundStrong" paddingHorizontal="$4" paddingVertical="$2">
            <XStack justifyContent="space-between">
              <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">Concepto</SizableText>
              <XStack gap="$4">
                <SizableText size="$1" color="$colorSubtitle" minWidth={90} textAlign="right">USD</SizableText>
                <SizableText size="$1" color="$colorSubtitle" minWidth={100} textAlign="right">Bs.</SizableText>
              </XStack>
            </XStack>
          </YStack>

          <YStack paddingHorizontal="$4">
            {/* Materia Prima */}
            <SizableText size="$1" color="$blue9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Materia Prima ({data.rawMaterials.length})
            </SizableText>
            {s.rawMaterials.map((r: RawMaterialCalc) => (
              <XStack key={r.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {r.supply || 'Sin nombre'} ({r.quantity} {r.unit})
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {fmt(r.subtotalUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {fmt(r.subtotalBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal Materia Prima" usd={s.totalRawMaterialsUSD} bs={s.totalRawMaterialsBS} />

            <Separator />

            {/* Mano de Obra */}
            <SizableText size="$1" color="$purple9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Mano de Obra ({data.laborItems.length})
            </SizableText>
            {s.laborItems.map((l: LaborCalc) => (
              <XStack key={l.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {l.position || 'Sin nombre'} ({l.timeQuantity}× {l.payType})
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {fmt(l.subtotalUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {fmt(l.subtotalBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal Mano de Obra" usd={s.totalLaborUSD} bs={s.totalLaborBS} />

            <Separator />

            {/* CIF */}
            <SizableText size="$1" color="$orange9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Costos Indirectos CIF ({data.indirectCosts.length})
            </SizableText>
            {s.indirectCosts.map((c: IndirectCostCalc) => (
              <XStack key={c.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {c.description || 'Sin nombre'}
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {fmt(c.costUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {fmt(c.costBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal CIF" usd={s.totalCIFUSD} bs={s.totalCIFBS} />
          </YStack>

          {/* Total */}
          <XStack
            backgroundColor="$color"
            paddingHorizontal="$4"
            paddingVertical="$3"
            justifyContent="space-between"
            alignItems="center"
          >
            <SizableText size="$4" fontWeight="700" color="$background">Costo Total del Lote</SizableText>
            <XStack gap="$4">
              <SizableText size="$4" fontWeight="700" color="$background" minWidth={90} textAlign="right">
                $ {fmt(s.totalCostUSD)}
              </SizableText>
              <SizableText size="$3" color="$backgroundHover" minWidth={100} textAlign="right">
                Bs. {fmt(s.totalCostBS)}
              </SizableText>
            </XStack>
          </XStack>
        </Card>
      </YStack>

      {/* Estructura de precio por unidad */}
      <YStack>
        <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
          Estructura de Precio por Unidad
        </SizableText>
        <Card borderColor="$borderColor" borderWidth={1} borderRadius="$4" paddingHorizontal="$4">
          <SectionRow label={`Costo Unitario (Lote ÷ ${s.lotQuantity})`} usd={s.unitCostUSD} bs={s.unitCostBS} />
          <Separator />
          <SectionRow label={`Utilidad (${data.profitMarginPct}%)`} usd={s.profitAmountUSD} bs={s.profitAmountUSD * s.exchangeRate} />
          <Separator />
          <SectionRow label={`IVA (${data.vatPct}%)`} usd={s.vatAmountUSD} bs={s.vatAmountBS} />
          <Separator />
          <XStack justifyContent="space-between" alignItems="center" paddingVertical="$3">
            <SizableText size="$4" fontWeight="700" color="$color">Precio de Venta Final</SizableText>
            <XStack gap="$4">
              <SizableText size="$4" fontWeight="700" color="$green9" minWidth={90} textAlign="right">
                $ {fmt(s.salePriceUSD)}
              </SizableText>
              <SizableText size="$3" color="$green9" minWidth={100} textAlign="right">
                Bs. {fmt(s.salePriceBS)}
              </SizableText>
            </XStack>
          </XStack>
        </Card>
      </YStack>

      {/* Botón Guardar y Exportar */}
      <Button
        onPress={handleExport}
        backgroundColor="$blue10"
        borderRadius="$5"
        height="$6"
        icon={<FileDown size={18} color="white" />}
        pressStyle={{ opacity: 0.85, scale: 0.98 }}
      >
        <SizableText color="white" fontWeight="700">Guardar y Exportar PDF</SizableText>
      </Button>
    </YStack>
  );
}