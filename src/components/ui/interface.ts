import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

/**
 * Variantes del InputCustom:
 * - 'text'     → texto libre
 * - 'decimal'  → teclado numérico, acepta decimales con punto
 * - 'integer'  → teclado numérico, solo enteros
 * - 'price'    → formateador venezolano en tiempo real (1.234,56)
 */
export type InputVariant = 'text' | 'decimal' | 'integer' | 'price';

export interface InputCustomProps {
  label?: string;
  placeholder?: string;

  /**
   * Para variant='price': valor numérico real (ej: 1234.56)
   * Para el resto: string normal
   */
  value?: string;
  onChangeText?: (text: string) => void;

  /**
   * Solo para variant='price': se llama con el número parseado (sin formato)
   * Útil para guardar el valor en el estado sin formatear.
   */
  onChangeValue?: (value: number) => void;

  variant?: InputVariant;

  /** Prefijo visual (ej: "Bs." o "$") */
  prefix?: string;
  /** Sufijo visual (ej: "%") */
  suffix?: string;

  error?: string;
  disabled?: boolean;

  // Pasar-alante de props nativas de TextInput
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  textContentType?: TextInputProps['textContentType'];
}