import React, { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, Separator } from 'tamagui';
import {
  CheckCircle, TrendingUp, Package, DollarSign, Tag, FileDown, Save,
} from '@tamagui/lucide-icons';
import type { BudgetFormData, Budget } from '../types';
import {
  calculateBudgetSummary,
  type RawMaterialCalc,
  type LaborCalc,
  type IndirectCostCalc,
} from '../calculations';
import { formatVE } from '../../../components/ui/InputCustom';
import { exportBudgetPDF } from '../pdfExport';

interface Props {
  data: BudgetFormData;
  onSaveAndExport: () => void;
}

function SectionRow({ label, usd, bs }: { label: string; usd: number; bs: number }) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start" paddingVertical="$2">
      <SizableText size="$3" color="$color" flex={1} paddingRight="$2">{label}</SizableText>
      <XStack gap="$4">
        <SizableText size="$3" fontWeight="600" color="$color" minWidth={90} textAlign="right">
          $ {formatVE(usd)}
        </SizableText>
        <SizableText size="$3" color="$colorSubtitle" minWidth={100} textAlign="right">
          Bs. {formatVE(bs)}
        </SizableText>
      </XStack>
    </XStack>
  );
}

function MetricCard({ icon, label, value, sub, backgroundColor, borderColor }: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; backgroundColor: string; borderColor: string;
}) {
  return (
    <Card flex={1} padding="$3" gap="$2"
      backgroundColor={backgroundColor as any} borderColor={borderColor as any}
      borderWidth={1} borderRadius="$4">
      <XStack alignItems="center" gap="$2">
        {icon}
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">{label}</SizableText>
      </XStack>
      <SizableText size="$6" fontWeight="700" color="$color">{value}</SizableText>
      {sub && <SizableText size="$2" color="$colorSubtitle">{sub}</SizableText>}
    </Card>
  );
}

export function Step5Summary({ data, onSaveAndExport }: Props) {
  const s = calculateBudgetSummary(data);
  const [exporting, setExporting] = useState(false);

  // Guarda el presupuesto y luego exporta PDF por separado
  // para evitar el error "An earlier share has not yet completed"
  const handleSave = () => {
    onSaveAndExport();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Construye un objeto Budget temporal para pasárselo al exportador
      const tempBudget: Budget = {
        id:       'preview',
        name:     data.name || 'Presupuesto',
        date:     new Date().toISOString().split('T')[0],
        totalUSD: s.totalCostUSD,
        totalBS:  s.totalCostBS,
        status:   'listo',
        data,
      };
      await exportBudgetPDF(tempBudget);
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar el PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <YStack gap="$5">
      {/* Banner */}
      <XStack alignItems="center" gap="$2">
        <CheckCircle size={18} color="$green9" />
        <SizableText size="$3" color="$green9" flex={1}>
          Revisa el resumen antes de guardar. Puedes volver a cualquier paso para editar.
        </SizableText>
      </XStack>

      {/* Métricas 2x2 */}
      <XStack gap="$3">
        <MetricCard
          icon={<Package size={14} color="$blue9" />}
          label="Costo Unitario"
          value={`$${formatVE(s.unitCostUSD)}`}
          sub={`Bs. ${formatVE(s.unitCostBS)}`}
          backgroundColor="$blue3" borderColor="$blue6"
        />
        <MetricCard
          icon={<DollarSign size={14} color="$green9" />}
          label="Precio s/IVA"
          value={`$${formatVE(s.salePriceWithoutVatUSD)}`}
          sub={`Bs. ${formatVE(s.salePriceWithoutVatBS)}`}
          backgroundColor="$green3" borderColor="$green6"
        />
      </XStack>
      <XStack gap="$3">
        <MetricCard
          icon={<TrendingUp size={14} color="$purple9" />}
          label="Margen"
          value={`${formatVE(s.profitMarginPct, 1)}%`}
          sub={`Utilidad: $${formatVE(s.profitAmountUSD)}`}
          backgroundColor="$purple3" borderColor="$purple6"
        />
        <MetricCard
          icon={<Tag size={14} color="$orange9" />}
          label="Precio Final c/IVA"
          value={`$${formatVE(s.finalPriceUSD)}`}
          sub={`Bs. ${formatVE(s.finalPriceBS)}`}
          backgroundColor="$orange3" borderColor="$orange6"
        />
      </XStack>

      {/* Info general */}
      <Card backgroundColor="$backgroundStrong" borderColor="$borderColor"
        borderWidth={1} borderRadius="$4" padding="$4">
        <XStack flexWrap="wrap" gap="$3">
          {[
            { label: 'Presupuesto',     value: data.name || '—' },
            { label: 'Unidad de Venta', value: s.saleUnit || '—' },
            { label: 'Tamaño de Lote',  value: `${s.lotQuantity} unid.` },
            { label: 'Tasa de Cambio',  value: `Bs. ${formatVE(s.exchangeRate)} / $` },
          ].map(item => (
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
            <SizableText size="$1" color="$blue9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Materia Prima ({data.rawMaterials.length})
            </SizableText>
            {s.rawMaterials.map((r: RawMaterialCalc) => (
              <XStack key={r.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {r.supply || 'Sin nombre'} ({r.quantity} {r.unit})
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {formatVE(r.subtotalUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {formatVE(r.subtotalBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal Materia Prima" usd={s.totalRawMaterialsUSD} bs={s.totalRawMaterialsBS} />
            <Separator />

            <SizableText size="$1" color="$purple9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Mano de Obra ({data.laborItems.length})
            </SizableText>
            {s.laborItems.map((l: LaborCalc) => (
              <XStack key={l.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {l.position || 'Sin nombre'} ({l.timeQuantity}× {l.payType})
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {formatVE(l.subtotalUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {formatVE(l.subtotalBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal Mano de Obra" usd={s.totalLaborUSD} bs={s.totalLaborBS} />
            <Separator />

            <SizableText size="$1" color="$orange9" textTransform="uppercase" marginTop="$3" marginBottom="$1">
              Costos Indirectos CIF ({data.indirectCosts.length})
            </SizableText>
            {s.indirectCosts.map((c: IndirectCostCalc) => (
              <XStack key={c.id} justifyContent="space-between" paddingVertical="$1">
                <SizableText size="$2" color="$colorSubtitle" flex={1} numberOfLines={1}>
                  • {c.description || 'Sin nombre'}
                </SizableText>
                <XStack gap="$4">
                  <SizableText size="$2" color="$color" minWidth={90} textAlign="right">$ {formatVE(c.costUSD)}</SizableText>
                  <SizableText size="$2" color="$colorSubtitle" minWidth={100} textAlign="right">Bs. {formatVE(c.costBS)}</SizableText>
                </XStack>
              </XStack>
            ))}
            <SectionRow label="Subtotal CIF" usd={s.totalCIFUSD} bs={s.totalCIFBS} />
          </YStack>

          <XStack backgroundColor="$color" paddingHorizontal="$4" paddingVertical="$3"
            justifyContent="space-between" alignItems="center">
            <SizableText size="$4" fontWeight="700" color="$background">Costo Total del Lote</SizableText>
            <XStack gap="$4">
              <SizableText size="$4" fontWeight="700" color="$background" minWidth={90} textAlign="right">
                $ {formatVE(s.totalCostUSD)}
              </SizableText>
              <SizableText size="$3" color="$backgroundHover" minWidth={100} textAlign="right">
                Bs. {formatVE(s.totalCostBS)}
              </SizableText>
            </XStack>
          </XStack>
        </Card>
      </YStack>

      {/* Precio por unidad */}
      <YStack>
        <SizableText size="$4" fontWeight="600" color="$color" marginBottom="$3">
          Estructura de Precio por Unidad
        </SizableText>
        <Card borderColor="$borderColor" borderWidth={1} borderRadius="$4" paddingHorizontal="$4">
          <SectionRow label={`Costo Unitario (Lote ÷ ${s.lotQuantity})`} usd={s.unitCostUSD} bs={s.unitCostBS} />
          <Separator />
          <SectionRow label={`Utilidad (${data.profitMarginPct}%)`} usd={s.profitAmountUSD} bs={s.profitAmountUSD * s.exchangeRate} />
          <Separator />
          <SectionRow label="Precio de Venta (sin IVA)" usd={s.salePriceWithoutVatUSD} bs={s.salePriceWithoutVatBS} />
          <Separator />
          <SectionRow label={`IVA (${data.vatPct}%)`} usd={s.vatAmountUSD} bs={s.vatAmountBS} />
          <Separator />
          <XStack justifyContent="space-between" alignItems="center" paddingVertical="$3">
            <SizableText size="$4" fontWeight="700" color="$color">Precio Final al Cliente</SizableText>
            <XStack gap="$4">
              <SizableText size="$4" fontWeight="700" color="$green9" minWidth={90} textAlign="right">
                $ {formatVE(s.finalPriceUSD)}
              </SizableText>
              <SizableText size="$3" color="$green9" minWidth={100} textAlign="right">
                Bs. {formatVE(s.finalPriceBS)}
              </SizableText>
            </XStack>
          </XStack>
        </Card>
      </YStack>

      {/* Botones — Guardar y Exportar PDF separados */}
      <XStack gap="$3">
        <Button
          flex={1}
          onPress={handleSave}
          backgroundColor="$green9" borderRadius="$5" height="$6"
          icon={<Save size={18} color="white" />}
          pressStyle={{ opacity: 0.85, scale: 0.98 }}
        >
          <SizableText color="white" fontWeight="700">Guardar</SizableText>
        </Button>

        <Button
          flex={1}
          onPress={handleExportPDF}
          disabled={exporting}
          backgroundColor="$blue10" borderRadius="$5" height="$6"
          icon={<FileDown size={18} color="white" />}
          pressStyle={{ opacity: 0.85, scale: 0.98 }}
          opacity={exporting ? 0.6 : 1}
        >
          <SizableText color="white" fontWeight="700">
            {exporting ? 'Exportando...' : 'Exportar PDF'}
          </SizableText>
        </Button>
      </XStack>
    </YStack>
  );
}