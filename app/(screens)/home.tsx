import { YStack, XStack, Text, Heading, Button, Card } from 'tamagui';
import { DollarSign, Plus, Moon, Sun } from '@tamagui/lucide-icons';
import { useThemeContext } from '../../src/state/themeContext'; // Importar el hook
export default function Home() {
  const { theme, toggleTheme } = useThemeContext();
  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      {/* Cabecera con Botón */}
      <XStack justifyContent="space-between" alignItems="center" marginTop="$6">
        <YStack gap="$2">
          <Text color="$colorSubtitle" fontWeight="700">Balance Total</Text>
          <Heading size="$9" color="$green10">$1,250.00</Heading>
        </YStack>
        
        <Button 
          circular 
          size="$4" 
          onPress={toggleTheme}
          
          // 2. Efecto visual al mantener presionado
          pressStyle={{ scale: 0.9, opacity: 0.8 }}
          
          // 3. Fondo que cambia suavemente según el tema
          backgroundColor={theme === 'light' ? '$blue5' : '$purple5'}
          
          // Icono con su propia lógica de animación
          icon={
            <YStack enterStyle={{ scale: 0, rotate: '-45deg' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </YStack>
          }
        />
      </XStack>

      {/* Tarjeta de Resumen Rápido */}
      <XStack gap="$3" justifyContent="space-between">
        <Card flex={1} padding="$3" backgroundColor="$green3" borderWidth={1} borderColor="$green6">
          <Text fontSize="$2">Ingresos</Text>
          <Text fontWeight="bold" color="$green10">+$3,000</Text>
        </Card>
        <Card flex={1} padding="$3" backgroundColor="$red3" borderWidth={1} borderColor="$red6">
          <Text fontSize="$2">Gastos</Text>
          <Text fontWeight="bold" color="$red10">-$1,750</Text>
        </Card>
      </XStack>

      {/* Actividad */}
      <YStack flex={1} gap="$2" marginTop="$4">
        <Text fontWeight="bold" fontSize="$5">Actividad Reciente</Text>
        <YStack justifyContent="center" alignItems="center" flex={0.5} opacity={0.5}>
          <Text>No hay gastos registrados aún</Text>
        </YStack>
      </YStack>

      {/* Botón Flotante */}
      <Button 
        position="absolute" 
        bottom="$5" 
        right="$5" 
        circular 
        size="$6" 
        backgroundColor="$blue10"
        icon={<Plus size={24} color="white" />}
      />
    </YStack>
  );
}