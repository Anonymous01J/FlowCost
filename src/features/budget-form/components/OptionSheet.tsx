/**
 * OptionSheet.tsx
 * Reemplaza los <select> HTML con un Sheet de Tamagui.
 * Uso:
 *   <OptionSheet
 *     open={open}
 *     onOpenChange={setOpen}
 *     options={UNIT_OPTIONS.map(u => ({ value: u, label: u }))}
 *     value={selected}
 *     onSelect={(val) => { setSelected(val); setOpen(false); }}
 *     title="Unidad"
 *   />
 */
import React from 'react';
import { Sheet, YStack, XStack, Button, SizableText, Separator } from 'tamagui';
import { Check } from '@tamagui/lucide-icons';

interface Option {
  value: string;
  label: string;
}

interface OptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  title?: string;
}

export function OptionSheet({
  open,
  onOpenChange,
  options,
  value,
  onSelect,
  title,
}: OptionSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[50, 85]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" gap="$3">
        {title && (
          <>
            <SizableText size="$5" fontWeight="700" color="$color">
              {title}
            </SizableText>
            <Separator />
          </>
        )}
        <Sheet.ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$2">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <Button
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  backgroundColor={isSelected ? '$blue3' : '$backgroundHover'}
                  borderColor={isSelected ? '$blue6' : '$borderColor'}
                  borderWidth={1}
                  borderRadius="$3"
                  justifyContent="space-between"
                  paddingHorizontal="$4"
                  height="$5"
                >
                  <SizableText
                    size="$4"
                    color={isSelected ? '$blue10' : '$color'}
                    fontWeight={isSelected ? '600' : '400'}
                  >
                    {opt.label}
                  </SizableText>
                  {isSelected && <Check size={16} color="$blue10" />}
                </Button>
              );
            })}
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

/**
 * SelectTrigger - botón que activa el OptionSheet.
 * Replica visualmente el estilo de los inputs del formulario.
 */
interface SelectTriggerProps {
  label: string;
  onPress: () => void;
  placeholder?: string;
}

export function SelectTrigger({ label, onPress, placeholder }: SelectTriggerProps) {
  return (
    <Button
      onPress={onPress}
      backgroundColor="$backgroundPress"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$3"
      height="$4"
      justifyContent="flex-start"
      paddingHorizontal="$3"
    >
      <SizableText
        size="$3"
        color={label === placeholder ? '$colorPlaceholder' : '$color'}
      >
        {label || placeholder || 'Seleccionar...'}
      </SizableText>
    </Button>
  );
}