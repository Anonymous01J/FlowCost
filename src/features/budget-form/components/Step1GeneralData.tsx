import React, { useState } from 'react';
import { YStack, XStack, SizableText, Card } from 'tamagui';
import { Info } from '@tamagui/lucide-icons';
import type { BudgetFormData } from '../types';
import { SALE_UNIT_OPTIONS } from '../types';
import { OptionSheet, SelectTrigger } from './OptionSheet';
import InputCustom from '../../../components/ui/InputCustom';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

// Estado local para los strings formateados de los campos precio
interface PriceDisplays {
  exchangeRate: string;
  profitMarginPct: string;
  lotQuantity: string;
  vatPct: string;
}

export function Step1GeneralData({ data, onChange }: Props) {
  const [saleUnitSheetOpen, setSaleUnitSheetOpen] = useState(false);

  // Strings formateados para mostrar en pantalla
  const [displays, setDisplays] = React.useState<PriceDisplays>({
    exchangeRate: data.exchangeRate ? String(data.exchangeRate) : '',
    profitMarginPct: data.profitMarginPct ? String(data.profitMarginPct) : '',
    lotQuantity: data.lotQuantity ? String(data.lotQuantity) : '',
    vatPct: data.vatPct ? String(data.vatPct) : '',
  });

  const selectedSaleUnitLabel =
    SALE_UNIT_OPTIONS.find((o) => o.value === data.saleUnit)?.label ?? data.saleUnit;

  return (
    <YStack gap="$5">
      <SizableText size="$3" color="$colorSubtitle">
        Ingresa la información base del presupuesto. Estos datos se usarán en todos los cálculos.
      </SizableText>

      {/* Nombre */}
      <InputCustom
        label="Nombre del Presupuesto *"
        placeholder="Ej: Producción Lote A – Marzo 2026"
        variant="text"
        value={data.name}
        onChangeText={(t) => onChange({ name: t })}
        autoCapitalize="sentences"
      />

      {/* Grid 2 columnas */}
      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="Tasa de Cambio (Bs./$)"
            placeholder="36,50"
            variant="price"
            prefix="Bs."
            value={displays.exchangeRate}
            onChangeText={(t) => setDisplays(d => ({ ...d, exchangeRate: t }))}
            onChangeValue={(n) => onChange({ exchangeRate: n })}
          />
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="Utilidad / Margen"
            placeholder="30,00"
            variant="price"
            suffix="%"
            value={displays.profitMarginPct}
            onChangeText={(t) => setDisplays(d => ({ ...d, profitMarginPct: t }))}
            onChangeValue={(n) => onChange({ profitMarginPct: n })}
          />
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="Cantidad de Lote"
            placeholder="1"
            variant="integer"
            value={displays.lotQuantity}
            onChangeText={(t) => setDisplays(d => ({ ...d, lotQuantity: t }))}
            onChangeValue={(n) => onChange({ lotQuantity: n || 1 })}
          />
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="IVA"
            placeholder="16,00"
            variant="price"
            suffix="%"
            value={displays.vatPct}
            onChangeText={(t) => setDisplays(d => ({ ...d, vatPct: t }))}
            onChangeValue={(n) => onChange({ vatPct: n })}
          />
        </YStack>
      </XStack>

      {/* Unidad de Venta */}
      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={160}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Unidad de Venta
          </SizableText>
          <SelectTrigger
            label={selectedSaleUnitLabel}
            onPress={() => setSaleUnitSheetOpen(true)}
          />
        </YStack>

        {data.saleUnit === 'personalizada' && (
          <YStack flex={1} minWidth={160}>
            <InputCustom
              label="Unidad Personalizada"
              placeholder="Ej: paquete de 6 unidades"
              variant="text"
              value={data.customSaleUnit}
              onChangeText={(t) => onChange({ customSaleUnit: t })}
            />
          </YStack>
        )}
      </XStack>

      {/* Info card */}
      <Card backgroundColor="$blue3" borderColor="$blue6" borderWidth={1} borderRadius="$4" padding="$4">
        <XStack gap="$3" alignItems="flex-start">
          <Info size={16} color="$blue9" marginTop={2} />
          <SizableText size="$2" color="$blue10" flex={1}>
            La tasa de cambio se aplicará automáticamente en todos los cálculos de Bs.
          </SizableText>
        </XStack>
      </Card>

      <OptionSheet
        open={saleUnitSheetOpen}
        onOpenChange={setSaleUnitSheetOpen}
        options={SALE_UNIT_OPTIONS}
        value={data.saleUnit}
        onSelect={(val) => { onChange({ saleUnit: val }); setSaleUnitSheetOpen(false); }}
        title="Unidad de Venta"
      />
    </YStack>
  );
}