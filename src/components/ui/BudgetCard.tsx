import React, { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, XStack, SizableText, Card, Button, Sheet, Separator, Spinner } from 'tamagui';
import {
  CheckCircle, Clock, MoreHorizontal, Trash2, RefreshCw, Pencil, FileDown, Copy,
} from '@tamagui/lucide-icons';
import type { Budget } from '../../features/budget-form/types';
import { formatVE } from './InputCustom';
import { exportBudgetPDF } from '../../features/budget-form/pdfExport';
import { useCompany } from '../../store/CompanyContext';

interface Props {
  budget: Budget;
  onDelete?:       (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onEdit?:         (budget: Budget) => void;
  /** Abre el modal de creación con datos precargados pero nombre único */
  onCopy?:         (budget: Budget) => void;
}

export function BudgetCard({ budget, onDelete, onToggleStatus, onEdit, onCopy }: Props) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [exporting, setExporting] = useState(false);
  const { profile } = useCompany();

  const formattedDate = new Date(budget.date + 'T00:00:00').toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const isListo = budget.status === 'listo';

  const handleExport = async () => {
    setMenuOpen(false);
    setExporting(true);
    try {
      await exportBudgetPDF(budget, profile);
    } catch (e: any) {
      Alert.alert('Error al exportar', e?.message ?? 'Ocurrió un error inesperado.');
    } finally {
      setExporting(false);
    }
  };

  const menuItem = (
    label: string,
    color: string,
    Icon: React.ComponentType<any>,
    onPress: () => void,
  ) => (
    <Button
      onPress={onPress}
      chromeless justifyContent="flex-start"
      icon={<Icon size={16} color={color} />}
      height="$5"
    >
      <SizableText size="$4" style={{ color }}>{label}</SizableText>
    </Button>
  );

  return (
    <>
      <Card
        borderColor="$borderColor" borderWidth={1} borderRadius="$5"
        padding="$4" backgroundColor="$background"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2" marginBottom="$3">
          <YStack flex={1} gap="$1">
            <XStack alignItems="center" gap="$2">
              {budget.number && (
                <YStack backgroundColor="$backgroundStrong" borderRadius="$2"
                  paddingHorizontal="$2" paddingVertical="$0.5">
                  <SizableText size="$1" color="$colorSubtitle" fontWeight="600">
                    #{budget.number}
                  </SizableText>
                </YStack>
              )}
              <SizableText size="$4" fontWeight="700" color="$color" numberOfLines={1} flex={1}>
                {budget.name}
              </SizableText>
            </XStack>
            <SizableText size="$2" color="$colorSubtitle">{formattedDate}</SizableText>
          </YStack>

          <XStack alignItems="center" gap="$2" flexShrink={0}>
            <XStack
              backgroundColor={isListo ? '$green3' : '$orange3'}
              borderColor={isListo ? '$green6' : '$orange6'}
              borderWidth={1} borderRadius="$10"
              paddingHorizontal="$2" paddingVertical="$1"
              alignItems="center" gap="$1"
            >
              {isListo
                ? <CheckCircle size={11} color="$green9" />
                : <Clock       size={11} color="$orange9" />}
              <SizableText size="$1" fontWeight="600" color={isListo ? '$green9' : '$orange9'}>
                {isListo ? 'Listo' : 'En desarrollo'}
              </SizableText>
            </XStack>

            {exporting ? (
              <Spinner size="small" color="$blue9" />
            ) : (
              <Button
                size="$3" circular chromeless
                onPress={e => { e.stopPropagation(); setMenuOpen(true); }}
                icon={<MoreHorizontal size={16} color="$colorSubtitle" />}
              />
            )}
          </XStack>
        </XStack>

        {/* Footer */}
        <XStack
          justifyContent="space-between" alignItems="flex-end"
          borderTopWidth={1} borderTopColor="$borderColor"
          paddingTop="$3" marginTop="$1"
        >
          <YStack gap="$1">
            <SizableText size="$1" color="$colorSubtitle">Costo Total USD</SizableText>
            <SizableText size="$6" fontWeight="700" color="$color">
              ${formatVE(budget.totalUSD)}
            </SizableText>
          </YStack>
          <YStack gap="$1" alignItems="flex-end">
            <SizableText size="$1" color="$colorSubtitle">Equivalente Bs.</SizableText>
            <SizableText size="$3" color="$colorSubtitle">
              Bs. {formatVE(budget.totalBS, 0)}
            </SizableText>
          </YStack>
        </XStack>
      </Card>

      {/* Sheet de acciones */}
      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        snapPoints={[60]}
        dismissOnSnapToBottom
        modal
        zIndex={300000}
      >
        <Sheet.Overlay backgroundColor="rgba(0,0,0,0.4)"
          enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" gap="$1">
          <SizableText size="$3" fontWeight="700" color="$colorSubtitle" paddingBottom="$2">
            {budget.name}
          </SizableText>
          <Separator />

          {menuItem('Editar presupuesto', '#2563eb', Pencil,
            () => { setMenuOpen(false); onEdit?.(budget); })}
          <Separator />

          {menuItem('Hacer copia', '#0891b2', Copy,
            () => { setMenuOpen(false); onCopy?.(budget); })}
          <Separator />

          {menuItem('Exportar PDF', '#7c3aed', FileDown, handleExport)}
          <Separator />

          {menuItem(
            isListo ? '↩ Marcar En Desarrollo' : '✓ Marcar como Listo',
            '#64748b', RefreshCw,
            () => { onToggleStatus?.(budget.id); setMenuOpen(false); },
          )}
          <Separator />

          {menuItem('Eliminar', '#ef4444', Trash2,
            () => { onDelete?.(budget.id); setMenuOpen(false); })}
        </Sheet.Frame>
      </Sheet>
    </>
  );
}