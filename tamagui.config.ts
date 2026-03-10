import { config } from '@tamagui/config/v3'
import { createAnimations } from '@tamagui/animations-moti'
import { createTamagui, createFont } from 'tamagui'

const animations = createAnimations({
  bouncy: { type: 'spring', damping: 10, stiffness: 100 },
  lazy:   { type: 'timing', duration: 300 },
  medium: { type: 'timing', duration: 200 },
})

// Define Inter con todos sus pesos
const interFont = createFont({
  family: 'Inter-Regular',
  size: {
    1: 11, 2: 12, 3: 13, 4: 14,
    5: 15, 6: 16, 7: 18, 8: 20,
    9: 24, 10: 28, 11: 32, 12: 40,
    true: 14,
  },
  lineHeight: {
    1: 16, 2: 17, 3: 18, 4: 20,
    5: 22, 6: 24, 7: 26, 8: 28,
    9: 32, 10: 36, 11: 40, 12: 50,
    true: 20,
  },
  weight: {
    1: '100', 2: '200', 3: '300', 4: '400',
    5: '500', 6: '600', 7: '700', 8: '800',
    9: '900',
    true: '400',
  },
  letterSpacing: {
    4: 0, 8: -0.5, 10: -1, 12: -1.5,
    true: 0,
  },
  // Mapea cada peso a su archivo de fuente cargado
  face: {
    100: { normal: 'Inter-Thin' },
    200: { normal: 'Inter-ExtraLight' },
    300: { normal: 'Inter-Light' },
    400: { normal: 'Inter-Regular' },
    500: { normal: 'Inter-Medium' },
    600: { normal: 'Inter-SemiBold' },
    700: { normal: 'Inter-Bold' },
    800: { normal: 'Inter-ExtraBold' },
    900: { normal: 'Inter-Black' },
  },
})

const tamaguiConfig = createTamagui({
  ...config,
  animations,
  // Sobreescribe las fuentes del config base con Inter
  fonts: {
    ...config.fonts,
    body: interFont,
    heading: interFont,
  },
})

type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  // @ts-ignore
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig as any