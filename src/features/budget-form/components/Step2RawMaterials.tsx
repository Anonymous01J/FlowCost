import React, { useState } from 'react';
import { YStack, XStack, SizableText, Button, Card, Separator } from 'tamagui';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import type { BudgetFormData, RawMaterialRow } from '../types';
import { UNIT_OPTIONS } from '../types';
import { calcRawMaterial, fmt } from '../calculations';
import { OptionSheet, SelectTrigger } from './OptionSheet';
import InputCustom, { formatVE } from '../../../components/ui/InputCustom';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function newRow(): RawMaterialRow {
  return { id: Math.random().toString(36).slice(2), supply: '', quantity: 1, unit: 'unidad', costUSD: 0 };
}

function ReadonlyField({ value }: { value: string }) {
  return (
    <YStack backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}
      borderRadius="$3" paddingHorizontal="$3" height="$5" justifyContent="center">
      <SizableText size="$3" color="$colorSubtitle">{value}</SizableText>
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
  const [costDisplay, setCostDisplay] = useState(row.costUSD ? formatVE(row.costUSD) : '');
  const [qtyDisplay, setQtyDisplay] = useState(String(row.quantity));

  return (
    <Card borderColor="$borderColor" borderWidth={1} borderRadius="$4" padding="$3"
      backgroundColor="$background" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <SizableText size="$2" color="$colorSubtitle" fontWeight="600" textTransform="uppercase">
          Insumo
        </SizableText>
        <Button size="$2" circular chromeless onPress={onRemove}
          icon={<Trash2 size={14} color="$red9" />} />
      </XStack>

      <InputCustom
        placeholder="Nombre del insumo"
        variant="text"
        value={row.supply}
        onChangeText={(t) => onUpdate({ supply: t })}
      />

      <XStack gap="$2">
        <YStack flex={1}>
          <InputCustom
            label="Cantidad"
            variant="decimal"
            placeholder="1"
            value={qtyDisplay}
            onChangeText={setQtyDisplay}
            onChangeValue={(n) => onUpdate({ quantity: n })}
          />
        </YStack>
        <YStack flex={1}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Unidad
          </SizableText>
          <SelectTrigger label={row.unit} onPress={() => setUnitSheetOpen(true)} />
        </YStack>
      </XStack>

      <XStack gap="$2">
        <YStack flex={1}>
          <InputCustom
            label="Costo USD"
            variant="price"
            prefix="$"
            placeholder="0,00"
            value={costDisplay}
            onChangeText={setCostDisplay}
            onChangeValue={(n) => onUpdate({ costUSD: n })}
          />
        </YStack>
        <YStack flex={1}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Costo Bs.
          </SizableText>
          <ReadonlyField value={formatVE(row.costBS)} />
        </YStack>
      </XStack>

      <XStack gap="$2">
        <YStack flex={1}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Sub. USD
          </SizableText>
          <ReadonlyField value={`$ ${formatVE(row.subtotalUSD)}`} />
        </YStack>
        <YStack flex={1}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Sub. Bs.
          </SizableText>
          <ReadonlyField value={`Bs. ${formatVE(row.subtotalBS)}`} />
        </YStack>
      </XStack>

      <OptionSheet open={unitSheetOpen} onOpenChange={setUnitSheetOpen}
        options={UNIT_OPTIONS.map((u) => ({ value: u, label: u }))}
        value={row.unit}
        onSelect={(val) => { onUpdate({ unit: val }); setUnitSheetOpen(false); }}
        title="Unidad de Medida" />
    </Card>
  );
}

export function Step2RawMaterials({ data, onChange }: Props) {
  const rows = data.rawMaterials;
  const calcs = rows.map((r) => calcRawMaterial(r, data.exchangeRate));
  const totalUSD = calcs.reduce((s, r) => s + r.subtotalUSD, 0);
  const totalBS  = calcs.reduce((s, r) => s + r.subtotalBS,  0);

  const updateRow = (id: string, updates: Partial<RawMaterialRow>) =>
    onChange({ rawMaterials: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  const removeRow = (id: string) =>
    onChange({ rawMaterials: rows.filter((r) => r.id !== id) });
  const addRow = () =>
    onChange({ rawMaterials: [...rows, newRow()] });

  return (
    <YStack gap="$4">
      <SizableText size="$3" color="$colorSubtitle">
        Lista todos los insumos o materias primas necesarias para producir el lote.
      </SizableText>

      {calcs.length === 0 ? (
        <YStack borderColor="$borderColor" borderWidth={1} borderStyle="dashed"
          borderRadius="$4" paddingVertical="$8" alignItems="center" justifyContent="center">
          <SizableText size="$3" color="$colorSubtitle" opacity={0.6}>
            Sin insumos — agrega la primera fila
          </SizableText>
        </YStack>
      ) : (
        calcs.map((row) => (
          <RowCard key={row.id} row={row} exchangeRate={data.exchangeRate}
            onUpdate={(u) => updateRow(row.id, u)} onRemove={() => removeRow(row.id)} />
        ))
      )}

      <Button onPress={addRow} borderColor="$blue7" borderWidth={1} borderStyle="dashed"
        borderRadius="$4" backgroundColor="transparent" icon={<Plus size={16} color="$blue9" />}>
        <SizableText color="$blue9">Agregar Insumo</SizableText>
      </Button>

      {rows.length > 0 && (
        <Card backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}
          borderRadius="$4" padding="$4" gap="$2">
          <XStack justifyContent="space-between">
            <SizableText size="$3" color="$colorSubtitle">Total USD:</SizableText>
            <SizableText size="$3" fontWeight="700" color="$color">$ {formatVE(totalUSD)}</SizableText>
          </XStack>
          <Separator />
          <XStack justifyContent="space-between">
            <SizableText size="$3" color="$colorSubtitle">Total Bs.:</SizableText>
            <SizableText size="$3" fontWeight="700" color="$color">Bs. {formatVE(totalBS)}</SizableText>
          </XStack>
        </Card>
      )}
    </YStack>
  );
}