import { config } from '@tamagui/config/v3'
import { createAnimations } from '@tamagui/animations-react-native'
import { createTamagui, createFont } from 'tamagui'

// animations-react-native no requiere Worklets ni Moti
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
  },
  lazy: {
    type: 'timing',
    duration: 300,
  },
  medium: {
    type: 'timing',
    duration: 200,
  },
})

const interFont = createFont({
  family: 'Inter-Regular',
  size: {
    1: 13, 2: 14, 3: 15, 4: 16,
    5: 17, 6: 18, 7: 20, 8: 22,
    9: 26, 10: 30, 11: 34, 12: 42,
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
    body:       interFont,
    heading:    interFont,
    mono:       interFont,
    silkscreen: interFont,
  },
})

type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  // @ts-ignore
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig as any