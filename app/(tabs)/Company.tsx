import React, { useState, useEffect } from 'react';
import {
  ScrollView, Platform, Image, Pressable, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  YStack, XStack, SizableText, Button, Card, Separator,
} from 'tamagui';
import {
  Building2, MapPin, Phone, Save, CheckCircle, Camera,
} from '@tamagui/lucide-icons';
import {
  useCompany, validateRIF, formatRIF,
  type CompanyProfile, type PhoneEntry,
} from '../../src/store/CompanyContext';
import InputCustom from '../../src/components/ui/InputCustom';
import { useThemeContext } from '../../src/state/themeContext';

const COLORS = {
  light: { bg: '#ffffff', label: '#64748b', border: '#cbd5e1', text: '#0f172a', subtle: '#f8fafc' },
  dark:  { bg: '#1e293b', label: '#94a3b8', border: '#334155', text: '#f1f5f9', subtle: '#0f172a' },
};

function PhoneTypeToggle({
  type, onChange,
}: { type: PhoneEntry['type']; onChange: (t: PhoneEntry['type']) => void }) {
  const { theme } = useThemeContext();
  const c = COLORS[theme];
  return (
    <XStack borderWidth={1} borderColor={c.border as any} borderRadius="$3" overflow="hidden" height="$5">
      {(['call', 'whatsapp'] as const).map(t => {
        const active = type === t;
        return (
          <Pressable key={t} onPress={() => onChange(t)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center',
              backgroundColor: active ? '#2563eb' : c.bg }}>
            <SizableText size="$2" fontWeight={active ? '700' : '400'}
              style={{ color: active ? 'white' : c.label }}>
              {t === 'call' ? 'Llamada' : 'WhatsApp'}
            </SizableText>
          </Pressable>
        );
      })}
    </XStack>
  );
}

async function pickImage(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      };
      input.click();
    });
  } else {
    try {
      const { default: ImagePicker } = await import('expo-image-picker') as any;
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a fotos para subir el logo.');
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true,
      });
      if (result.canceled) return null;
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    } catch {
      Alert.alert('Error', 'Instala expo-image-picker: expo install expo-image-picker');
      return null;
    }
  }
}

export default function CompanyScreen() {
  const { profile, loading, saveProfile } = useCompany();
  const insets = useSafeAreaInsets();
  const { theme } = useThemeContext();
  const c = COLORS[theme];

  const [form,   setForm]   = useState<CompanyProfile>(profile);
  const [saved,  setSaved]  = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm(profile); }, [profile]);

  const update = (key: keyof CompanyProfile, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
    setSaved(false);
  };

  const updatePhone = (index: number, field: keyof PhoneEntry, value: string) => {
    const phones = [...form.phones];
    phones[index] = { ...phones[index], [field]: value };
    update('phones', phones);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'El nombre de la empresa es obligatorio.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido.';
    if (form.rif && !validateRIF(form.rif)) errs.rif = 'Formato inválido. Ej: J-12345678-9';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePickLogo = async () => {
    const uri = await pickImage();
    if (uri) update('logoBase64', uri);
  };

  if (loading) return null;

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <XStack alignItems="center" gap="$3" marginTop={insets.top + 16} marginBottom="$6">
          <YStack width={40} height={40} borderRadius="$3" backgroundColor="$blue9"
            alignItems="center" justifyContent="center">
            <Building2 size={20} color="white" />
          </YStack>
          <YStack>
            <SizableText size="$6" fontWeight="800" color="$color">Mi Empresa</SizableText>
            <SizableText size="$2" color="$colorSubtitle">Configura los datos de tu empresa</SizableText>
          </YStack>
        </XStack>

        {/* Logo */}
        <Card backgroundColor="$backgroundStrong" borderColor="$borderColor"
          borderWidth={1} borderRadius="$5" padding="$4" marginBottom="$4">
          <SizableText size="$3" fontWeight="700" color="$color" marginBottom="$3">Logo de la Empresa</SizableText>
          <XStack alignItems="center" gap="$4">
            <Pressable onPress={handlePickLogo}>
              <YStack width={80} height={80} borderRadius="$4" borderWidth={2}
                borderColor="$borderColor" borderStyle="dashed" backgroundColor="$backgroundStrong"
                alignItems="center" justifyContent="center" overflow="hidden">
                {form.logoBase64
                  ? <Image source={{ uri: form.logoBase64 }}
                      style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="contain" />
                  : <Camera size={28} color="$colorSubtitle" />}
              </YStack>
            </Pressable>
            <YStack flex={1} gap="$2">
              <SizableText size="$3" color="$color">{form.logoBase64 ? 'Logo cargado' : 'Sin logo'}</SizableText>
              <SizableText size="$2" color="$colorSubtitle">Formatos: JPG, PNG. Recomendado: cuadrado.</SizableText>
              <Button onPress={handlePickLogo} size="$3" borderRadius="$3"
                backgroundColor="$blue3" borderColor="$blue6" borderWidth={1}
                icon={<Camera size={14} color="$blue9" />}>
                <SizableText size="$2" color="$blue9" fontWeight="600">
                  {form.logoBase64 ? 'Cambiar logo' : 'Subir logo'}
                </SizableText>
              </Button>
              {form.logoBase64 && (
                <Button onPress={() => update('logoBase64', null)} size="$3" borderRadius="$3" chromeless>
                  <SizableText size="$2" color="$red9">Eliminar logo</SizableText>
                </Button>
              )}
            </YStack>
          </XStack>
        </Card>

        {/* Datos generales */}
        <Card backgroundColor="$backgroundStrong" borderColor="$borderColor"
          borderWidth={1} borderRadius="$5" padding="$4" marginBottom="$4" gap="$4">
          <XStack alignItems="center" gap="$2">
            <Building2 size={16} color="$blue9" />
            <SizableText size="$3" fontWeight="700" color="$color">Datos de la Empresa</SizableText>
          </XStack>
          <Separator />
          <InputCustom label="Nombre de la Empresa *" placeholder="Ej: Cocina Gourmet C.A."
            variant="text" value={form.name} onChangeText={v => update('name', v)}
            autoCapitalize="words" error={errors.name} />
          <InputCustom label="RIF" placeholder="Ej: J-12345678-9"
            variant="text" value={form.rif}
            onChangeText={v => update('rif', formatRIF(v))}
            error={errors.rif} />
        </Card>

        {/* Dirección */}
        <Card backgroundColor="$backgroundStrong" borderColor="$borderColor"
          borderWidth={1} borderRadius="$5" padding="$4" marginBottom="$4" gap="$4">
          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="$blue9" />
            <SizableText size="$3" fontWeight="700" color="$color">Dirección</SizableText>
          </XStack>
          <Separator />
          <InputCustom label="Dirección" placeholder="Calle, Edificio, Ciudad, Estado"
            variant="text" value={form.address} onChangeText={v => update('address', v)}
            autoCapitalize="sentences" />
        </Card>

        {/* Contacto */}
        <Card backgroundColor="$backgroundStrong" borderColor="$borderColor"
          borderWidth={1} borderRadius="$5" padding="$4" marginBottom="$4" gap="$4">
          <XStack alignItems="center" gap="$2">
            <Phone size={16} color="$blue9" />
            <SizableText size="$3" fontWeight="700" color="$color">Contacto</SizableText>
          </XStack>
          <Separator />
          <InputCustom label="Email" placeholder="empresa@ejemplo.com"
            variant="text" value={form.email} onChangeText={v => update('email', v)}
            autoCapitalize="none" error={errors.email} />
          {form.phones.map((phone, i) => (
            <YStack key={i} gap="$2">
              <SizableText size="$2" style={{ color: c.label }} fontWeight="500">Teléfono {i + 1}</SizableText>
              <PhoneTypeToggle type={phone.type} onChange={t => updatePhone(i, 'type', t)} />
              <InputCustom
                placeholder={phone.type === 'whatsapp' ? '+58 414 000 0000' : '0212-000 0000'}
                variant="text" value={phone.number} onChangeText={v => updatePhone(i, 'number', v)} />
              <SizableText size="$1" color="$colorSubtitle">
                {phone.type === 'call'
                  ? 'Enlace: tel:' + (phone.number || '...')
                  : 'Enlace: https://wa.me/' + (phone.number.replace(/\D/g, '') || '...')}
              </SizableText>
            </YStack>
          ))}
        </Card>

        {/* Guardar */}
        <Button onPress={handleSave} backgroundColor={saved ? '$green9' : '$blue9'}
          borderRadius="$5" height="$6"
          icon={saved ? <CheckCircle size={18} color="white" /> : <Save size={18} color="white" />}
          pressStyle={{ opacity: 0.85, scale: 0.98 }}>
          <SizableText color="white" fontWeight="700">
            {saved ? '¡Guardado!' : 'Guardar Configuración'}
          </SizableText>
        </Button>
      </ScrollView>
    </YStack>
  );
}