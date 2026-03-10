import React, { useState } from 'react';
import { YStack, XStack, SizableText, Input, Card } from 'tamagui';
import { Info } from '@tamagui/lucide-icons';
import type { BudgetFormData } from '../types';
import { SALE_UNIT_OPTIONS } from '../types';
import { OptionSheet, SelectTrigger } from './OptionSheet';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <SizableText size="$2" color="$colorSubtitle" marginBottom="$1">
      {children}
    </SizableText>
  );
}

export function Step1GeneralData({ data, onChange }: Props) {
  const [saleUnitSheetOpen, setSaleUnitSheetOpen] = useState(false);

  const selectedSaleUnitLabel =
    SALE_UNIT_OPTIONS.find((o) => o.value === data.saleUnit)?.label ?? data.saleUnit;

  return (
    <YStack gap="$5">
      <SizableText size="$3" color="$colorSubtitle">
        Ingresa la información base del presupuesto. Estos datos se usarán en todos los cálculos.
      </SizableText>

      {/* Nombre */}
      <YStack>
        <FieldLabel>Nombre del Presupuesto *</FieldLabel>
        <Input
          placeholder="Ej: Producción Lote A – Marzo 2026"
          value={data.name}
          onChangeText={(t) => onChange({ name: t })}
          size="$4"
        />
      </YStack>

      {/* Grid 2 columnas */}
      <XStack gap="$3" flexWrap="wrap">
        {/* Tasa de cambio */}
        <YStack flex={1} minWidth={140}>
          <FieldLabel>Tasa de Cambio (Bs. / $)</FieldLabel>
          <XStack alignItems="center" gap="$2">
            <SizableText size="$3" color="$colorSubtitle">Bs.</SizableText>
            <Input
              flex={1}
              keyboardType="decimal-pad"
              placeholder="36.50"
              value={data.exchangeRate ? String(data.exchangeRate) : ''}
              onChangeText={(t) => onChange({ exchangeRate: parseFloat(t) || 0 })}
              size="$4"
            />
          </XStack>
        </YStack>

        {/* Margen */}
        <YStack flex={1} minWidth={140}>
          <FieldLabel>Utilidad / Margen (%)</FieldLabel>
          <XStack alignItems="center" gap="$2">
            <Input
              flex={1}
              keyboardType="decimal-pad"
              placeholder="30"
              value={data.profitMarginPct ? String(data.profitMarginPct) : ''}
              onChangeText={(t) => onChange({ profitMarginPct: parseFloat(t) || 0 })}
              size="$4"
            />
            <SizableText size="$3" color="$colorSubtitle">%</SizableText>
          </XStack>
        </YStack>

        {/* Cantidad de lote */}
        <YStack flex={1} minWidth={140}>
          <FieldLabel>Cantidad de Lote (Unidades)</FieldLabel>
          <Input
            keyboardType="number-pad"
            placeholder="1"
            value={data.lotQuantity ? String(data.lotQuantity) : ''}
            onChangeText={(t) => onChange({ lotQuantity: parseInt(t) || 1 })}
            size="$4"
          />
        </YStack>

        {/* IVA */}
        <YStack flex={1} minWidth={140}>
          <FieldLabel>IVA (%)</FieldLabel>
          <XStack alignItems="center" gap="$2">
            <Input
              flex={1}
              keyboardType="decimal-pad"
              placeholder="16"
              value={data.vatPct ? String(data.vatPct) : ''}
              onChangeText={(t) => onChange({ vatPct: parseFloat(t) || 0 })}
              size="$4"
            />
            <SizableText size="$3" color="$colorSubtitle">%</SizableText>
          </XStack>
        </YStack>
      </XStack>

      {/* Unidad de Venta */}
      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={160}>
          <FieldLabel>Unidad de Venta</FieldLabel>
          <SelectTrigger
            label={selectedSaleUnitLabel}
            onPress={() => setSaleUnitSheetOpen(true)}
          />
        </YStack>

        {data.saleUnit === 'personalizada' && (
          <YStack flex={1} minWidth={160}>
            <FieldLabel>Unidad Personalizada</FieldLabel>
            <Input
              placeholder="Ej: paquete de 6 unidades"
              value={data.customSaleUnit}
              onChangeText={(t) => onChange({ customSaleUnit: t })}
              size="$4"
            />
          </YStack>
        )}
      </XStack>

      {/* Info card */}
      <Card
        backgroundColor="$blue3"
        borderColor="$blue6"
        borderWidth={1}
        borderRadius="$4"
        padding="$4"
      >
        <XStack gap="$3" alignItems="flex-start">
          <Info size={16} color="$blue9" marginTop={2} />
          <SizableText size="$2" color="$blue10" flex={1}>
            La tasa de cambio se aplicará automáticamente en todos los cálculos de Bs.
            Podrás modificarla desde este paso si actualizan la tasa oficial.
          </SizableText>
        </XStack>
      </Card>

      {/* Sheet de unidades de venta */}
      <OptionSheet
        open={saleUnitSheetOpen}
        onOpenChange={setSaleUnitSheetOpen}
        options={SALE_UNIT_OPTIONS}
        value={data.saleUnit}
        onSelect={(val) => {
          onChange({ saleUnit: val });
          setSaleUnitSheetOpen(false);
        }}
        title="Unidad de Venta"
      />
    </YStack>
  );
}
