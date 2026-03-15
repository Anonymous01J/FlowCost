import React, { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, XStack, SizableText, Card, Button, Sheet, Separator, Spinner } from 'tamagui';
import {
  CheckCircle, Clock, MoreHorizontal, Trash2, RefreshCw, Pencil, FileDown,
} from '@tamagui/lucide-icons';
import type { Budget } from '../../features/budget-form/types';
import { formatVE } from './InputCustom';
import { exportBudgetPDF } from '../../features/budget-form/pdfExport';

interface Props {
  budget: Budget;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  onEdit?: (budget: Budget) => void;
}

export function BudgetCard({ budget, onDelete, onToggleStatus, onEdit }: Props) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [exporting,   setExporting]   = useState(false);

  const formattedDate = new Date(budget.date + 'T00:00:00').toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const isListo = budget.status === 'listo';

  const handleExport = async () => {
    setMenuOpen(false);
    setExporting(true);
    try {
      await exportBudgetPDF(budget);
    } catch (e) {
      Alert.alert('Error', 'No se pudo exportar el PDF. Verifica que expo-print y expo-sharing estén instalados.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <Card
        borderColor="$borderColor"
        borderWidth={1}
        borderRadius="$5"
        padding="$4"
        backgroundColor="$background"
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$2" marginBottom="$3">
          <YStack flex={1} gap="$1">
            <SizableText size="$4" fontWeight="700" color="$color" numberOfLines={1}>
              {budget.name}
            </SizableText>
            <SizableText size="$2" color="$colorSubtitle">{formattedDate}</SizableText>
          </YStack>

          <XStack alignItems="center" gap="$2" flexShrink={0}>
            {/* Badge estado */}
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

            {/* Spinner de exportación o botón menú */}
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

        {/* Footer totales */}
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
        snapPoints={[50]}
        dismissOnSnapToBottom
        modal
        zIndex={300000}
      >
        <Sheet.Overlay backgroundColor="rgba(0,0,0,0.4)" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" gap="$2">
          <SizableText size="$3" fontWeight="700" color="$colorSubtitle" paddingBottom="$1">
            {budget.name}
          </SizableText>
          <Separator />

          {/* Editar */}
          <Button
            onPress={() => { setMenuOpen(false); onEdit?.(budget); }}
            chromeless justifyContent="flex-start"
            icon={<Pencil size={16} color="$blue9" />}
            height="$5"
          >
            <SizableText size="$4" color="$blue9">Editar presupuesto</SizableText>
          </Button>

          <Separator />

          {/* Exportar PDF */}
          <Button
            onPress={handleExport}
            chromeless justifyContent="flex-start"
            icon={<FileDown size={16} color="$purple9" />}
            height="$5"
          >
            <SizableText size="$4" color="$purple9">Exportar PDF</SizableText>
          </Button>

          <Separator />

          {/* Cambiar estado */}
          <Button
            onPress={() => { onToggleStatus?.(budget.id); setMenuOpen(false); }}
            chromeless justifyContent="flex-start"
            icon={<RefreshCw size={16} color="$color" />}
            height="$5"
          >
            <SizableText size="$4" color="$color">
              {isListo ? '↩ Marcar En Desarrollo' : '✓ Marcar como Listo'}
            </SizableText>
          </Button>

          <Separator />

          {/* Eliminar */}
          <Button
            onPress={() => { onDelete?.(budget.id); setMenuOpen(false); }}
            chromeless justifyContent="flex-start"
            icon={<Trash2 size={16} color="$red9" />}
            height="$5"
          >
            <SizableText size="$4" color="$red9">Eliminar</SizableText>
          </Button>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}