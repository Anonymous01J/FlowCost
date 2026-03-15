import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, Separator } from 'tamagui';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import type { BudgetFormData, IndirectCostRow } from '../types';
import { calcIndirectCost } from '../calculations';
import InputCustom, { formatVE } from '../../../components/ui/InputCustom';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function newRow(): IndirectCostRow {
  return { id: Math.random().toString(36).slice(2), description: '', calculationBase: '', costUSD: 0 };
}

const CIF_SUGGESTIONS = [
  'Alquiler del local', 'Energía eléctrica', 'Agua y servicios',
  'Depreciación de maquinaria', 'Seguro del inventario',
  'Mantenimiento equipos', 'Gastos administrativos', 'Transporte y logística',
];

function ReadonlyField({ value }: { value: string }) {
  return (
    <YStack backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}
      borderRadius="$3" paddingHorizontal="$3" height="$5" justifyContent="center">
      <SizableText size="$3" color="$colorSubtitle">{value}</SizableText>
    </YStack>
  );
}

interface RowCardProps {
  row: ReturnType<typeof calcIndirectCost>;
  onUpdate: (updates: Partial<IndirectCostRow>) => void;
  onRemove: () => void;
}

function RowCard({ row, onUpdate, onRemove }: RowCardProps) {
  const [costDisplay, setCostDisplay] = useState(row.costUSD > 0 ? formatVE(row.costUSD) : '');

  // Sync con datos externos (modo edición)
  useEffect(() => {
    setCostDisplay(row.costUSD > 0 ? formatVE(row.costUSD) : '');
  }, [row.costUSD]);

  return (
    <Card borderColor="$borderColor" borderWidth={1} borderRadius="$4" padding="$3"
      backgroundColor="$background" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <SizableText size="$2" color="$colorSubtitle" fontWeight="600" textTransform="uppercase">
          CIF
        </SizableText>
        <Button size="$2" circular chromeless onPress={onRemove}
          icon={<Trash2 size={14} color="$red9" />} />
      </XStack>

      <InputCustom
        placeholder="Descripción del costo"
        variant="text"
        value={row.description}
        onChangeText={(t) => onUpdate({ description: t })}
      />

      <InputCustom
        label="Base de Cálculo"
        placeholder="Ej: Mensual / Porcentaje"
        variant="text"
        value={row.calculationBase}
        onChangeText={(t) => onUpdate({ calculationBase: t })}
      />

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
          <ReadonlyField value={`Bs. ${formatVE(row.costBS)}`} />
        </YStack>
      </XStack>
    </Card>
  );
}

export function Step4IndirectCosts({ data, onChange }: Props) {
  const rows  = data.indirectCosts;
  const calcs = rows.map((r) => calcIndirectCost(r, data.exchangeRate));
  const totalUSD = calcs.reduce((s, r) => s + r.costUSD, 0);
  const totalBS  = calcs.reduce((s, r) => s + r.costBS,  0);

  const updateRow = (id: string, updates: Partial<IndirectCostRow>) =>
    onChange({ indirectCosts: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  const removeRow = (id: string) =>
    onChange({ indirectCosts: rows.filter((r) => r.id !== id) });
  const addRow = (description = '') =>
    onChange({ indirectCosts: [...rows, { ...newRow(), description }] });

  return (
    <YStack gap="$4">
      <SizableText size="$3" color="$colorSubtitle">
        Gastos generales que no se asocian directamente al producto pero son parte del costo de producción.
      </SizableText>

      {calcs.length === 0 ? (
        <YStack borderColor="$borderColor" borderWidth={1} borderStyle="dashed"
          borderRadius="$4" paddingVertical="$8" alignItems="center" justifyContent="center">
          <SizableText size="$3" color="$colorSubtitle" opacity={0.6}>
            Sin costos indirectos — agrega filas o usa los accesos rápidos
          </SizableText>
        </YStack>
      ) : (
        calcs.map((row) => (
          <RowCard key={row.id} row={row}
            onUpdate={(u) => updateRow(row.id, u)} onRemove={() => removeRow(row.id)} />
        ))
      )}

      <Button onPress={() => addRow()} borderColor="$blue7" borderWidth={1} borderStyle="dashed"
        borderRadius="$4" backgroundColor="transparent" icon={<Plus size={16} color="$blue9" />}>
        <SizableText color="$blue9">Agregar Costo Indirecto</SizableText>
      </Button>

      <YStack gap="$2">
        <SizableText size="$2" color="$colorSubtitle">Accesos rápidos:</SizableText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingBottom="$1">
            {CIF_SUGGESTIONS.map((s) => (
              <Button key={s} onPress={() => addRow(s)} size="$3" borderRadius="$10"
                backgroundColor="$backgroundStrong" borderColor="$borderColor" borderWidth={1}>
                <SizableText size="$2" color="$colorSubtitle">+ {s}</SizableText>
              </Button>
            ))}
          </XStack>
        </ScrollView>
      </YStack>

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