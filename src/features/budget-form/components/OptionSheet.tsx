import React from 'react';
import { Sheet, YStack, XStack, Button, SizableText, Separator } from 'tamagui';
import { Check, ChevronDown } from '@tamagui/lucide-icons';

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
      modal
      zIndex={300000}
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" gap="$3" backgroundColor="$background">
        {title && (
          <>
            <SizableText size="$5" fontWeight="700" color="$color">
              {title}
            </SizableText>
            <Separator />
          </>
        )}
        <Sheet.ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$2" paddingBottom="$6">
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

interface SelectTriggerProps {
  label: string;
  onPress: () => void;
  placeholder?: string;
}

export function SelectTrigger({ label, onPress, placeholder }: SelectTriggerProps) {
  const isEmpty = !label || label === placeholder;
  return (
    <Button
      onPress={onPress}
      backgroundColor="$backgroundPress"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$3"
      height="$4"
      justifyContent="space-between"
      paddingHorizontal="$3"
    >
      <SizableText
        size="$3"
        color={isEmpty ? '$colorPlaceholder' : '$color'}
      >
        {label || placeholder || 'Seleccionar...'}
      </SizableText>
      <ChevronDown size={14} color="$colorSubtitle" />
    </Button>
  );
}