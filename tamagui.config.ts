import { config } from '@tamagui/config/v3'
import { createAnimations } from '@tamagui/animations-moti'
import { createTamagui, createFont } from 'tamagui'

const animations = createAnimations({
  bouncy: { type: 'spring', damping: 10, stiffness: 100 },
  lazy:   { type: 'timing', duration: 300 },
  medium: { type: 'timing', duration: 200 },
})

// Escala subida ~1-2pt respecto al default de Tamagui
const interFont = createFont({
  family: 'Inter-Regular',
  size: {
    1: 13,   // era 11 — badges, labels uppercase
    2: 14,   // era 12 — subtítulos secundarios
    3: 15,   // era 13 — texto de cuerpo normal
    4: 16,   // era 14 — texto principal, inputs
    5: 17,   // era 15
    6: 18,   // era 16 — títulos de sección
    7: 20,   // era 18
    8: 22,   // era 20
    9: 26,   // era 24 — títulos grandes
    10: 30,  // era 28
    11: 34,  // era 32
    12: 42,  // era 40
    true: 16,
  },
  lineHeight: {
    1: 18, 2: 20, 3: 22, 4: 24,
    5: 26, 6: 28, 7: 30, 8: 32,
    9: 36, 10: 42, 11: 46, 12: 54,
    true: 24,
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
  fonts: {
    body: interFont,
    heading: interFont,
    mono: interFont,
    silkscreen: interFont,
  },
})

type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  // @ts-ignore
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig as any