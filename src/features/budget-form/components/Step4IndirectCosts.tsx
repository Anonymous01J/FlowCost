import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, SizableText, Input, Button, Card, Separator } from 'tamagui';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import type { BudgetFormData, IndirectCostRow } from '../types';
import { calcIndirectCost, fmt } from '../calculations';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function newRow(): IndirectCostRow {
  return {
    id: Math.random().toString(36).slice(2),
    description: '',
    calculationBase: '',
    costUSD: 0,
  };
}

const CIF_SUGGESTIONS = [
  'Alquiler del local',
  'Energía eléctrica',
  'Agua y servicios',
  'Depreciación de maquinaria',
  'Seguro del inventario',
  'Mantenimiento equipos',
  'Gastos administrativos',
  'Transporte y logística',
];

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
  row: ReturnType<typeof calcIndirectCost>;
  onUpdate: (updates: Partial<IndirectCostRow>) => void;
  onRemove: () => void;
}

function RowCard({ row, onUpdate, onRemove }: RowCardProps) {
  return (
    <Card
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      padding="$3"
      backgroundColor="$background"
      gap="$3"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">
          CIF
        </SizableText>
        <Button
          size="$2"
          circular
          chromeless
          onPress={onRemove}
          icon={<Trash2 size={14} color="$red9" />}
        />
      </XStack>

      {/* Descripción */}
      <Input
        placeholder="Descripción del costo"
        value={row.description}
        onChangeText={(t) => onUpdate({ description: t })}
        size="$4"
      />

      {/* Base de cálculo */}
      <YStack>
        <FieldLabel>Base de Cálculo</FieldLabel>
        <Input
          placeholder="Ej: Mensual / Porcentaje"
          value={row.calculationBase}
          onChangeText={(t) => onUpdate({ calculationBase: t })}
          size="$4"
        />
      </YStack>

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
          <ReadonlyField value={`Bs. ${fmt(row.costBS)}`} />
        </YStack>
      </XStack>
    </Card>
  );
}

export function Step4IndirectCosts({ data, onChange }: Props) {
  const rows = data.indirectCosts;
  const calcs = rows.map((r) => calcIndirectCost(r, data.exchangeRate));
  const totalUSD = calcs.reduce((s, r) => s + r.costUSD, 0);
  const totalBS = calcs.reduce((s, r) => s + r.costBS, 0);

  const updateRow = (id: string, updates: Partial<IndirectCostRow>) => {
    onChange({ indirectCosts: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  };

  const removeRow = (id: string) => {
    onChange({ indirectCosts: rows.filter((r) => r.id !== id) });
  };

  const addRow = (description = '') => {
    onChange({ indirectCosts: [...rows, { ...newRow(), description }] });
  };

  return (
    <YStack gap="$4">
      <SizableText size="$3" color="$colorSubtitle">
        Gastos generales que no se asocian directamente al producto pero son parte del costo de producción.
      </SizableText>

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
            Sin costos indirectos — agrega filas o usa los accesos rápidos
          </SizableText>
        </YStack>
      ) : (
        calcs.map((row) => (
          <RowCard
            key={row.id}
            row={row}
            onUpdate={(updates) => updateRow(row.id, updates)}
            onRemove={() => removeRow(row.id)}
          />
        ))
      )}

      <Button
        onPress={() => addRow()}
        borderColor="$blue7"
        borderWidth={1}
        borderStyle="dashed"
        borderRadius="$4"
        backgroundColor="transparent"
        icon={<Plus size={16} color="$blue9" />}
        color="$blue9"
      >
        Agregar Costo Indirecto
      </Button>

      {/* Accesos rápidos — ScrollView horizontal */}
      <YStack gap="$2">
        <SizableText size="$2" color="$colorSubtitle">Accesos rápidos:</SizableText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingBottom="$1">
            {CIF_SUGGESTIONS.map((s) => (
              <Button
                key={s}
                onPress={() => addRow(s)}
                size="$3"
                borderRadius="$10"
                backgroundColor="$backgroundStrong"
                borderColor="$borderColor"
                borderWidth={1}
                color="$colorSubtitle"
                pressStyle={{ backgroundColor: '$blue3', borderColor: '$blue6', color: '$blue10' }}
              >
                + {s}
              </Button>
            ))}
          </XStack>
        </ScrollView>
      </YStack>

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
