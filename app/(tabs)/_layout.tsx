import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../src/state/themeContext';
import { FileText, Building2 } from 'lucide-react-native';

export default function TabsLayout() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const isDark = theme === 'dark';

  const bg       = isDark ? '#0f172a' : '#ffffff';
  const border   = isDark ? '#1e293b' : '#e2e8f0';
  const active   = '#2563eb';
  const inactive = isDark ? '#64748b' : '#94a3b8';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor:   active,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-Medium',
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Presupuestos',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Company"
        options={{
          title: 'Mi Empresa',
          tabBarIcon: ({ color, size }) => (
            <Building2 size={size ?? 22} color={color} />            
          ),
        }}
      />
    </Tabs>
  );
}