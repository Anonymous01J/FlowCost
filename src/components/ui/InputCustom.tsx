/**
 * InputCustom.tsx
 * Componente universal de input para FlowCost.
 *
 * Variantes:
 *   text     → texto libre
 *   decimal  → acepta decimales con punto (ej: 36.5)
 *   integer  → solo enteros
 *   price    → formateador venezolano en tiempo real: 1.234,56
 *              onChangeValue devuelve el número real parseado
 *
 * Uso básico:
 *   <InputCustom label="Nombre" value={name} onChangeText={setName} />
 *
 * Uso precio:
 *   <InputCustom
 *     label="Costo USD"
 *     variant="price"
 *     prefix="$"
 *     value={displayValue}        // string formateado que se muestra
 *     onChangeText={setDisplay}   // actualiza el string en pantalla
 *     onChangeValue={setCostUSD}  // recibe el número real (1234.56)
 *   />
 */
import React, { useRef } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { YStack, XStack, SizableText } from 'tamagui';
import type { InputCustomProps } from './interface';

// ─── Utilidades de formato venezolano ────────────────────────────────────────

/**
 * Formatea un número al estilo venezolano/europeo: 1.234,56
 */
export function formatVE(value: number, decimals = 2): string {
  if (isNaN(value)) return '0,00';
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return intFormatted + ',' + dec;
}

/**
 * Parsea un string formateado venezolano a número: "1.234,56" → 1234.56
 */
export function parseVE(formatted: string): number {
  const clean = formatted.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

/**
 * Formateador de input en tiempo real estilo venezolano.
 * Trabaja solo con dígitos, coloca coma decimal automáticamente
 * en los últimos 2 dígitos: "12345" → "123,45"
 */
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

// ─── Componente ───────────────────────────────────────────────────────────────

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
  const inputRef = useRef<TextInput>(null);

  // Determina el keyboardType según la variante
  const keyboardType = (() => {
    switch (variant) {
      case 'price':
      case 'integer': return 'number-pad';
      case 'decimal': return 'decimal-pad';
      default: return 'default';
    }
  })();

  const handleChangeText = (text: string) => {
    if (variant === 'price') {
      const formatted = formatPriceInput(text);
      onChangeText?.(formatted);
      onChangeValue?.(parseVE(formatted));
    } else if (variant === 'decimal') {
      // Permite solo dígitos y un punto decimal
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
  const borderColor = hasError ? '#ef4444' : '#e2e8f0';
  const focusBorderColor = hasError ? '#ef4444' : '#3b82f6';

  return (
    <YStack gap={4}>
      {label && (
        <SizableText size="$2" color="$colorSubtitle" fontWeight="500">
          {label}
        </SizableText>
      )}

      <XStack
        borderWidth={1.5}
        borderColor={borderColor as any}
        borderRadius="$3"
        backgroundColor={disabled ? '$backgroundStrong' : '$background'}
        alignItems="center"
        paddingHorizontal="$3"
        height="$5"
        gap="$2"
      >
        {prefix && (
          <SizableText size="$3" color="$colorSubtitle" fontWeight="500">
            {prefix}
          </SizableText>
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            disabled && styles.disabled,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          textContentType={textContentType}
        />

        {suffix && (
          <SizableText size="$3" color="$colorSubtitle" fontWeight="500">
            {suffix}
          </SizableText>
        )}
      </XStack>

      {hasError && (
        <SizableText size="$2" color="$red9">
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
    color: '#0f172a',
    paddingVertical: 0,
    fontFamily: 'Inter-Regular',
  },
  disabled: {
    color: '#94a3b8',
  },
});