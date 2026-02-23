import { config } from '@tamagui/config/v3'
import { createTamagui, TamaguiInternalConfig } from 'tamagui'

const tamaguiConfig = createTamagui(config)

// Usamos una interfaz intermedia para que TS no se bloquee
type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

// Exportamos con un cast a TamaguiInternalConfig para eliminar el "unknown"
export default tamaguiConfig as TamaguiInternalConfig