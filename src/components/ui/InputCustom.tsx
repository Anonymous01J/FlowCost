import React, { useRef, useState } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { YStack, XStack, SizableText } from 'tamagui';
import { useThemeContext } from '../../state/themeContext';
import type { InputCustomProps } from './interface';

// ─── Formato venezolano ───────────────────────────────────────────────────────

export function formatVE(value: number, decimals = 2): string {
  if (isNaN(value)) return '0,00';
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimals === 0 ? intFormatted : intFormatted + ',' + dec;
}

export function parseVE(formatted: string): number {
  const clean = formatted.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

function formatPriceInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  const len = digits.length;
  if (len === 0) return '';
  if (len <= 2) return '0,' + digits.padStart(2, '0');
  const intPart = digits.slice(0, len - 2).replace(/^0+/, '') || '0';
  const decPart = digits.slice(len - 2);
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return formatted + ',' + decPart;
}

// ─── Tokens de color ──────────────────────────────────────────────────────────

const COLORS = {
  light: {
    text:        '#0f172a',
    placeholder: '#94a3b8',
    border:      '#cbd5e1',
    borderFocus: '#3b82f6',
    borderError: '#ef4444',
    bg:          '#ffffff',
    bgDisabled:  '#f1f5f9',
    label:       '#64748b',
    prefix:      '#64748b',
  },
  dark: {
    text:        '#f1f5f9',
    placeholder: '#64748b',
    border:      '#334155',
    borderFocus: '#60a5fa',
    borderError: '#f87171',
    bg:          '#1e293b',
    bgDisabled:  '#0f172a',
    label:       '#94a3b8',
    prefix:      '#94a3b8',
  },
};

const INPUT_HEIGHT = 48;

export default function InputCustom({
  label,
  placeholder,
  value = '',
  onChangeText,
  onChangeValue,
  variant = 'text',
  prefix,
  suffix,
  error,
  disabled = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  secureTextEntry,
  textContentType,
}: InputCustomProps) {
  const { theme } = useThemeContext();
  const c = COLORS[theme];

  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const keyboardType = (() => {
    switch (variant) {
      case 'price':
      case 'integer': return 'number-pad' as const;
      case 'decimal': return 'decimal-pad' as const;
      default:        return 'default' as const;
    }
  })();

  const handleChangeText = (text: string) => {
    if (variant === 'price') {
      const formatted = formatPriceInput(text);
      onChangeText?.(formatted);
      onChangeValue?.(parseVE(formatted));
    } else if (variant === 'decimal') {
      const clean = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      onChangeText?.(clean);
      onChangeValue?.(parseFloat(clean) || 0);
    } else if (variant === 'integer') {
      const clean = text.replace(/[^0-9]/g, '');
      onChangeText?.(clean);
      onChangeValue?.(parseInt(clean) || 0);
    } else {
      onChangeText?.(text);
    }
  };

  const hasError = !!error;
  const borderColor = hasError ? c.borderError : focused ? c.borderFocus : c.border;
  const borderWidth = focused ? 2 : 1.5;

  return (
    <YStack gap={4}>
      {label && (
        <SizableText size="$2" fontWeight="500" style={{ color: c.label }}>
          {label}
        </SizableText>
      )}

      <XStack
        borderRadius="$3"
        alignItems="center"
        paddingHorizontal="$3"
        gap="$2"
        style={{
          borderColor,
          borderWidth,
          backgroundColor: disabled ? c.bgDisabled : c.bg,
          height: INPUT_HEIGHT,
          minHeight: INPUT_HEIGHT,
        }}
      >
        {prefix && (
          <SizableText size="$3" fontWeight="500" style={{ color: c.prefix }}>
            {prefix}
          </SizableText>
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: disabled ? c.placeholder : c.text },
          ]}
          placeholder={placeholder}
          placeholderTextColor={c.placeholder}
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          textContentType={textContentType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {suffix && (
          <SizableText size="$3" fontWeight="500" style={{ color: c.prefix }}>
            {suffix}
          </SizableText>
        )}
      </XStack>

      {hasError && (
        <SizableText size="$2" style={{ color: c.borderError }}>
          {error}
        </SizableText>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    // Elimina todo el padding interno que Android agrega por defecto
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    margin: 0,
    fontFamily: 'Inter-Regular',
    // Estilos específicos para Web (Firebase Studio) para quitar el borde de enfoque nativo
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
      outlineStyle: 'none',
      outlineColor: 'transparent',
    } as any),
    // Android: centra verticalmente y elimina el espacio de fuente interno
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
    }),
  },
});