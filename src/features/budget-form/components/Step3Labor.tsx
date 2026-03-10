import React, { useState } from 'react';
import { YStack, XStack, SizableText, Input, Button, Card, Separator } from 'tamagui';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import type { BudgetFormData, LaborRow } from '../types';
import { PAY_TYPE_OPTIONS } from '../types';
import { calcLabor, fmt } from '../calculations';
import { OptionSheet, SelectTrigger } from './OptionSheet';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

function newRow(): LaborRow {
  return {
    id: Math.random().toString(36).slice(2),
    position: '',
    payType: 'hora',
    amountUSD: 0,
    timeQuantity: 1,
  };
}

const timeLabel: Record<string, string> = {
  hora: 'Horas',
  dia: 'Días',
  semana: 'Semanas',
  mes: 'Meses',
};

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
  row: ReturnType<typeof calcLabor>;
  onUpdate: (updates: Partial<LaborRow>) => void;
  onRemove: () => void;
}

function RowCard({ row, onUpdate, onRemove }: RowCardProps) {
  const [payTypeSheetOpen, setPayTypeSheetOpen] = useState(false);

  const selectedPayTypeLabel =
    PAY_TYPE_OPTIONS.find((o) => o.value === row.payType)?.label ?? row.payType;

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
          Personal
        </SizableText>
        <Button
          size="$2"
          circular
          chromeless
          onPress={onRemove}
          icon={<Trash2 size={14} color="$red9" />}
        />
      </XStack>

      {/* Cargo / Rol */}
      <Input
        placeholder="Cargo o rol"
        value={row.position}
        onChangeText={(t) => onUpdate({ position: t })}
        size="$4"
      />

      <XStack gap="$2">
        <YStack flex={1}>
          <FieldLabel>Tipo de Pago</FieldLabel>
          <SelectTrigger
            label={selectedPayTypeLabel}
            onPress={() => setPayTypeSheetOpen(true)}
          />
        </YStack>
        <YStack flex={1}>
          <FieldLabel>Monto USD</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={row.amountUSD ? String(row.amountUSD) : ''}
            onChangeText={(t) => onUpdate({ amountUSD: parseFloat(t) || 0 })}
            size="$4"
          />
        </YStack>
      </XStack>

      <XStack gap="$2">
        <YStack flex={1}>
          <FieldLabel>{timeLabel[row.payType]}</FieldLabel>
          <Input
            keyboardType="decimal-pad"
            placeholder="1"
            value={String(row.timeQuantity)}
            onChangeText={(t) => onUpdate({ timeQuantity: parseFloat(t) || 0 })}
            size="$4"
          />
        </YStack>
        <YStack flex={1}>
          <FieldLabel>Sub. USD</FieldLabel>
          <ReadonlyField value={`$ ${fmt(row.subtotalUSD)}`} />
        </YStack>
      </XStack>

      <YStack>
        <FieldLabel>Sub. Bs.</FieldLabel>
        <ReadonlyField value={`Bs. ${fmt(row.subtotalBS)}`} />
      </YStack>

      <OptionSheet
        open={payTypeSheetOpen}
        onOpenChange={setPayTypeSheetOpen}
        options={PAY_TYPE_OPTIONS}
        value={row.payType}
        onSelect={(val) => {
          onUpdate({ payType: val as LaborRow['payType'] });
          setPayTypeSheetOpen(false);
        }}
        title="Tipo de Pago"
      />
    </Card>
  );
}

export function Step3Labor({ data, onChange }: Props) {
  const rows = data.laborItems;
  const calcs = rows.map((r) => calcLabor(r, data.exchangeRate));
  const totalUSD = calcs.reduce((s, r) => s + r.subtotalUSD, 0);
  const totalBS = calcs.reduce((s, r) => s + r.subtotalBS, 0);

  const updateRow = (id: string, updates: Partial<LaborRow>) => {
    onChange({ laborItems: rows.map((r) => (r.id === id ? { ...r, ...updates } : r)) });
  };

  const removeRow = (id: string) => {
    onChange({ laborItems: rows.filter((r) => r.id !== id) });
  };

  const addRow = () => {
    onChange({ laborItems: [...rows, newRow()] });
  };

  return (
    <YStack gap="$4">
      <SizableText size="$3" color="$colorSubtitle">
        Registra el personal involucrado en la producción y su costo asociado por tiempo.
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
            Sin personal registrado — agrega la primera fila
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
        onPress={addRow}
        borderColor="$blue7"
        borderWidth={1}
        borderStyle="dashed"
        borderRadius="$4"
        backgroundColor="transparent"
        icon={<Plus size={16} color="$blue9" />}
        color="$blue9"
      >
        Agregar Personal
      </Button>

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
