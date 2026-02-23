import { TamaguiProvider, View, Text, YStack, createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

// Creamos la instancia de configuración
const tamaguiConfig = createTamagui(config)

export default function App() {
  return (
    // Es vital pasar la configuración aquí
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      {/* f={1} hace que ocupe todo el alto, bg="$background" el color de fondo */}
      <YStack f={1} jc="center" ai="center" backgroundColor="white" width="100%" height="100vh">
        <View p="$4" backgroundColor="$blue5" borderRadius="$4">
          <Text color="$blue10" fontSize="$8" fontWeight="bold">
            ¡FlowCost está Vivo! 🚀
          </Text>
        </View>
        <Text mt="$4" color="$gray10">
          Si ves esto, la configuración de Tamagui es correcta.
        </Text>
      </YStack>
    </TamaguiProvider>
  )
}