import { config } from '@tamagui/config/v3'
import { createAnimations } from '@tamagui/animations-moti'
import { createTamagui } from 'tamagui'

const animations = createAnimations({
  bouncy: { type: 'spring', damping: 10, stiffness: 100 },
  lazy: { type: 'timing', duration: 300 },
})

const tamaguiConfig = createTamagui({
  ...config,
  animations,
})

// Truco para TypeScript: usamos un alias de tipo
type AppConfig = typeof tamaguiConfig

declare module 'tamagui' {
  // @ts-ignore
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig