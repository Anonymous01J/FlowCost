import React, { useState, useEffect, useRef } from 'react';
import { Animated, Pressable, ActivityIndicator } from 'react-native';
import { YStack, XStack, SizableText, Card } from 'tamagui';
import { Info, RefreshCw } from '@tamagui/lucide-icons';
import type { BudgetFormData } from '../types';
import { SALE_UNIT_OPTIONS } from '../types';
import { OptionSheet, SelectTrigger } from './OptionSheet';
import InputCustom, { formatVE, parseVE } from '../../../components/ui/InputCustom';
import { useThemeContext } from '../../../state/themeContext';

interface Props {
  data: BudgetFormData;
  onChange: (updates: Partial<BudgetFormData>) => void;
}

// ─── Botón BCV con animación de rotación ──────────────────────────────────────

function BcvButton({
  onFetch,
  loading,
}: {
  onFetch: () => void;
  loading: boolean;
}) {
  const { theme } = useThemeContext();
  const rotation = useRef(new Animated.Value(0)).current;
  const loopRef  = useRef<Animated.CompositeAnimation | null>(null);

  // Arranca la animación de giro infinito cuando loading=true,
  // la detiene suavemente cuando loading=false
  useEffect(() => {
    if (loading) {
      rotation.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      // Completa la vuelta hasta 0 para que no quede a medias
      Animated.timing(rotation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const rotate = rotation.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isDark   = theme === 'dark';
  const bg       = isDark ? '#1e3a5f' : '#eff6ff';
  const border   = isDark ? '#2563eb' : '#bfdbfe';
  const iconColor = loading
    ? (isDark ? '#60a5fa' : '#93c5fd')
    : '#2563eb';

  return (
    <Pressable
      onPress={loading ? undefined : onFetch}
      style={{
        height: 48,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: border,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.8 : 1,
        flexDirection: 'row',
        gap: 4,
      }}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <RefreshCw size={16} color={iconColor} />
      </Animated.View>
      <SizableText size="$1" style={{ color: iconColor, fontFamily: 'Inter-SemiBold' }}>
        BCV
      </SizableText>
    </Pressable>
  );
}

// ─── Step1GeneralData ─────────────────────────────────────────────────────────

export function Step1GeneralData({ data, onChange }: Props) {
  const [saleUnitSheetOpen, setSaleUnitSheetOpen] = useState(false);
  const [bcvLoading, setBcvLoading]               = useState(false);
  const [bcvError,   setBcvError]                 = useState<string | null>(null);

  const toDisplay = (n: number) => n > 0 ? formatVE(n) : '';

  const [displays, setDisplays] = useState({
    exchangeRate:    toDisplay(data.exchangeRate),
    profitMarginPct: toDisplay(data.profitMarginPct),
    lotQuantity:     data.lotQuantity > 0 ? String(data.lotQuantity) : '',
    vatPct:          toDisplay(data.vatPct),
  });

  useEffect(() => {
    setDisplays({
      exchangeRate:    toDisplay(data.exchangeRate),
      profitMarginPct: toDisplay(data.profitMarginPct),
      lotQuantity:     data.lotQuantity > 0 ? String(data.lotQuantity) : '',
      vatPct:          toDisplay(data.vatPct),
    });
  }, [data.exchangeRate, data.profitMarginPct, data.lotQuantity, data.vatPct]);

  // ─── Fetch tasa BCV ───────────────────────────────────────────────────────
  const fetchBCV = async () => {
    setBcvLoading(true);
    setBcvError(null);
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // /v1/dolares → array de tipos, el BCV (oficial) es el índice 0
      const rate: number = json[0]?.promedio;
      if (!rate || isNaN(rate)) throw new Error('Respuesta inesperada de la API');
      const formatted = formatVE(rate);
      setDisplays(d => ({ ...d, exchangeRate: formatted }));
      onChange({ exchangeRate: rate });
    } catch (e: any) {
      setBcvError('No se pudo obtener la tasa. Inténtalo de nuevo.');
    } finally {
      setBcvLoading(false);
    }
  };

  const selectedSaleUnitLabel =
    SALE_UNIT_OPTIONS.find((o) => o.value === data.saleUnit)?.label ?? data.saleUnit;

  return (
    <YStack gap="$5">
      <SizableText size="$3" color="$colorSubtitle">
        Ingresa la información base del presupuesto. Estos datos se usarán en todos los cálculos.
      </SizableText>

      <InputCustom
        label="Nombre del Presupuesto *"
        placeholder="Ej: Producción Lote A – Marzo 2026"
        variant="text"
        value={data.name}
        onChangeText={(t) => onChange({ name: t })}
        autoCapitalize="sentences"
      />

      <XStack gap="$3" flexWrap="wrap">

        {/* Tasa de cambio + botón BCV */}
        <YStack flex={1} minWidth={140}>
          <SizableText size="$2" fontWeight="500" color="$colorSubtitle" marginBottom="$1">
            Tasa de Cambio (Bs./$)
          </SizableText>
          <XStack gap="$2" alignItems="flex-end">
            <YStack flex={1}>
              <InputCustom
                placeholder="0,00"
                variant="price"
                prefix="Bs."
                value={displays.exchangeRate}
                onChangeText={(t) => setDisplays(d => ({ ...d, exchangeRate: t }))}
                onChangeValue={(n) => onChange({ exchangeRate: n })}
              />
            </YStack>
            <BcvButton onFetch={fetchBCV} loading={bcvLoading} />
          </XStack>
          {/* Mensaje de error debajo del campo */}
          {bcvError && (
            <SizableText size="$1" color="$red9" marginTop="$1">
              {bcvError}
            </SizableText>
          )}
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="Utilidad / Margen"
            placeholder="0,00"
            variant="price"
            suffix="%"
            value={displays.profitMarginPct}
            onChangeText={(t) => setDisplays(d => ({ ...d, profitMarginPct: t }))}
            onChangeValue={(n) => onChange({ profitMarginPct: n })}
          />
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="Cantidad de Lote"
            placeholder="1"
            variant="integer"
            value={displays.lotQuantity}
            onChangeText={(t) => setDisplays(d => ({ ...d, lotQuantity: t }))}
            onChangeValue={(n) => onChange({ lotQuantity: n || 1 })}
          />
        </YStack>

        <YStack flex={1} minWidth={140}>
          <InputCustom
            label="IVA"
            placeholder="0,00"
            variant="price"
            suffix="%"
            value={displays.vatPct}
            onChangeText={(t) => setDisplays(d => ({ ...d, vatPct: t }))}
            onChangeValue={(n) => onChange({ vatPct: n })}
          />
        </YStack>
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        <YStack flex={1} minWidth={160}>
          <SizableText size="$2" color="$colorSubtitle" fontWeight="500" marginBottom="$1">
            Unidad de Venta
          </SizableText>
          <SelectTrigger
            label={selectedSaleUnitLabel}
            onPress={() => setSaleUnitSheetOpen(true)}
          />
        </YStack>

        {data.saleUnit === 'personalizada' && (
          <YStack flex={1} minWidth={160}>
            <InputCustom
              label="Unidad Personalizada"
              placeholder="Ej: paquete de 6 unidades"
              variant="text"
              value={data.customSaleUnit}
              onChangeText={(t) => onChange({ customSaleUnit: t })}
            />
          </YStack>
        )}
      </XStack>

      <Card backgroundColor="$blue3" borderColor="$blue6" borderWidth={1} borderRadius="$4" padding="$4">
        <XStack gap="$3" alignItems="flex-start">
          <Info size={16} color="$blue9" marginTop={2} />
          <SizableText size="$2" color="$blue10" flex={1}>
            Pulsa <SizableText size="$2" color="$blue10" fontWeight="700">BCV</SizableText> para
            obtener la tasa oficial del Banco Central de Venezuela automáticamente.
          </SizableText>
        </XStack>
      </Card>

      <OptionSheet
        open={saleUnitSheetOpen}
        onOpenChange={setSaleUnitSheetOpen}
        options={SALE_UNIT_OPTIONS}
        value={data.saleUnit}
        onSelect={(val) => { onChange({ saleUnit: val }); setSaleUnitSheetOpen(false); }}
        title="Unidad de Venta"
      />
    </YStack>
  );
}