import React, { useState } from 'react';
import { YStack, XStack, SizableText, Input, Button, Card, Separator } from 'tamagui';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import type { BudgetFormData, RawMaterialRow } from '../types';
import { UNIT_OPTIONS } from '../types';
import { calcRawMaterial, fmt } from '../calculations';
import { OptionSheet, SelectTrigger } from './OptionSheet';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function newRow(): RawMaterialRow {
  return {
    id: Math.random().toString(36).slice(2), // crypto.randomUUID() no siempre disponible en RN
    supply: '',
    quantity: 1,
    unit: 'unidad',
    costUSD: 0,
  };
}

function FieldLabel({ children }: { children: string }) {
  return (
    <SizableText size="$1" color="$colorSubtitle" marginBottom="$1" textTransform="uppercase">
      {children}
    </SizableText>
  );
}

function ReadonlyField({ value }: { value: string }) {
  return (
    <YStack
      backgroundColor="$backgroundStrong"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$3"
      paddingHorizontal="$3"
      height="$4"
      justifyContent="center"
    >
      <SizableText size="$3" color="$colorSubtitle">
        {value}
      </SizableText>
    </YStack>
  );
}

interface RowCardProps {
  row: ReturnType<typeof calcRawMaterial>;
  exchangeRate: number;
  onUpdate: (updates: Partial<RawMaterialRow>) => void;
  onRemove: () => void;
}

function RowCard({ row, onUpdate, onRemove }: RowCardProps) {
  const [unitSheetOpen, setUnitSheetOpen] = useState(false);

  return (
    <Card
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      backgroundColor="$background"
      gap="$3"
    >
      {/* Header de la tarjeta */}
      <XStack justifyContent="space-between" alignItems="center">
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">
          Insumo
        </SizableText>
        <Button
          size="$2"
          circular
          chromeless
          onPress={onRemove}
          icon={<Trash2 size={14} color="$red9" />}
        />
      </XStack>

      {/* Nombre del insumo */}
      <Input
        placeholder="Nombre del insumo"
        value={row.supply}
        onChangeText={(t) => onUpdate({ supply: t })}
        size="$4"
      />

      {/* Grid 2x2 */}
      <XStack gap="$2">
        <YStack flex={1}>
          <FieldLabel>Cantidad</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            value={String(row.quantity)}
            onChangeText={(t) => onUpdate({ quantity: parseFloat(t) || 0 })}
            size="$4"
          />
        </YStack>
        <YStack flex={1}>
          <FieldLabel>Unidad</FieldLabel>
          <SelectTrigger
            label={row.unit}
            onPress={() => setUnitSheetOpen(true)}
          />
        </YStack>
      </XStack>

      <XStack gap="$2">
        <YStack flex={1}>
          <FieldLabel>Costo USD</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={row.costUSD ? String(row.costUSD) : ''}
            onChangeText={(t) => onUpdate({ costUSD: parseFloat(t) || 0 })}
            size="$4"
          />
        </YStack>
        <YStack flex={1}>
          <FieldLabel>Costo Bs.</FieldLabel>
          <ReadonlyField value={fmt(row.costBS)} />
        </YStack>
      </XStack>

      <XStack gap="$2">
        <YStack flex={1}>
          <FieldLabel>Sub. USD</FieldLabel>
          <ReadonlyField value={`$ ${fmt(row.subtotalUSD)}`} />
        </YStack>
        <YStack flex={1}>
          <FieldLabel>Sub. Bs.</FieldLabel>
          <ReadonlyField value={`Bs. ${fmt(row.subtotalBS)}`} />
        </YStack>
      </XStack>

      <OptionSheet
        open={unitSheetOpen}
        onOpenChange={setUnitSheetOpen}
        options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
        value={row.unit}
        onSelect={(val) => {
          onUpdate({ unit: val });
          setUnitSheetOpen(false);
        }}
        title="Unidad de Medida"
      />
    </Card>
  );
}

export function Step2RawMaterials({ data, onChange }: Props) {
  const rows = data.rawMaterials;
  const calcs = rows.map((r) => calcRawMaterial(r, data.exchangeRate));
  const totalUSD = calcs.reduce((s, r) => s + r.subtotalUSD, 0);
  const totalBS = calcs.reduce((s, r) => s + r.subtotalBS, 0);

  const updateRow = (id: string, updates: Partial<RawMaterialRow>) => {
    onChange({ rawMaterials: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  };

  const removeRow = (id: string) => {
    onChange({ rawMaterials: rows.filter((r) => r.id !== id) });
  };

  const addRow = () => {
    onChange({ rawMaterials: [...rows, newRow()] });
  };

  return (
    <YStack gap="$4">
      <SizableText size="$3" color="$colorSubtitle">
        Lista todos los insumos o materias primas necesarias para producir el lote.
      </SizableText>

      {/* Tarjetas de filas */}
      {calcs.length === 0 ? (
        <YStack
          borderColor="$borderColor"
          borderWidth={1}
          borderStyle="dashed"
          borderRadius="$4"
          paddingVertical="$8"
          alignItems="center"
          justifyContent="center"
        >
          <SizableText size="$3" color="$colorSubtitle" opacity={0.6}>
            Sin insumos — agrega la primera fila
          </SizableText>
        </YStack>
      ) : (
        calcs.map((row) => (
          <RowCard
            key={row.id}
            row={row}
            exchangeRate={data.exchangeRate}
            onUpdate={(updates) => updateRow(row.id, updates)}
            onRemove={() => removeRow(row.id)}
          />
        ))
      )}

      {/* Botón agregar */}
      <Button
        onPress={addRow}
        borderColor="$blue7"
        borderWidth={1}
        borderStyle="dashed"
        borderRadius="$4"
        backgroundColor="transparent"
        icon={<Plus size={16} color="$blue9" />}
        color="$blue9"
      >
        Agregar Insumo
      </Button>

      {/* Totales */}
      {rows.length > 0 && (
        <Card
          backgroundColor="$backgroundStrong"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$4"
          padding="$4"
          gap="$2"
        >
          <XStack justifyContent="space-between">
            <SizableText size="$3" color="$colorSubtitle">Total USD:</SizableText>
            <SizableText size="$3" fontWeight="700" color="$color">$ {fmt(totalUSD)}</SizableText>
          </XStack>
          <Separator />
          <XStack justifyContent="space-between">
            <SizableText size="$3" color="$colorSubtitle">Total Bs.:</SizableText>
            <SizableText size="$3" fontWeight="700" color="$color">Bs. {fmt(totalBS)}</SizableText>
          </XStack>
        </Card>
      )}
    </YStack>
  );
}
