/**
 * FlowCostOnboarding.tsx
 * Fixes para web:
 * - tip y subtitle con maxWidth: W * 0.85 (antes 35% / 30% — ilegible en web)
 * - scrollEnabled habilitado (funciona en web con onMomentumScrollEnd)
 * - gap en StyleSheet reemplazado por marginBottom para react-native-web 0.21
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  Dimensions, FlatList, SafeAreaView,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import Svg, {
  Circle, Rect, Line, Polyline, G, Text as SvgText,
} from 'react-native-svg';
import { useOnboarding } from '../../store/OnboardingContext';
import { useThemeContext } from '../../state/themeContext';

const { width: W } = Dimensions.get('window');
const SVG_SIZE = Math.min(160, W * 0.42);

const A = {
  blue:   '#2563eb', blue2:  '#eff6ff', blue3: '#bfdbfe',
  green:  '#16a34a', green2: '#f0fdf4', green3: '#bbf7d0',
  orange: '#ea580c', orange2:'#fff7ed',
  purple: '#7c3aed', purple2:'#faf5ff',
  amber:  '#f59e0b', amber2: '#fef3c7',
  teal:   '#0891b2', teal2:  '#ecfeff', teal3: '#a5f3fc',
};

type TC = {
  bg: string; text: string; subtitle: string;
  border: string; footerBg: string;
  svgWhite: string; svgGray: string;
};

function useThemeColors(theme: 'light' | 'dark'): TC {
  return theme === 'dark' ? {
    bg:       '#0f172a', text:     '#f1f5f9', subtitle: '#94a3b8',
    border:   '#334155', footerBg: '#0f172a',
    svgWhite: '#1e293b', svgGray:  '#475569',
  } : {
    bg:       '#ffffff', text:     '#1e293b', subtitle: '#64748b',
    border:   '#e2e8f0', footerBg: '#ffffff',
    svgWhite: '#ffffff', svgGray:  '#64748b',
  };
}

// ─── Ilustraciones SVG ────────────────────────────────────────────────────────

function IlluBienvenida({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.blue2} />
      <Rect x={28} y={36} width={144} height={48} rx={10} fill={tc.svgWhite} stroke={A.blue3} strokeWidth={1.5} />
      <Rect x={40} y={50} width={60} height={7} rx={3} fill={A.blue} opacity={0.8} />
      <Rect x={40} y={63} width={40} height={5} rx={2} fill={tc.svgGray} opacity={0.4} />
      <SvgText x={158} y={67} textAnchor="end" fill={A.green} fontSize={11} fontWeight="bold">$150</SvgText>
      <Rect x={28} y={94} width={144} height={48} rx={10} fill={tc.svgWhite} stroke={A.blue3} strokeWidth={1.5} />
      <Rect x={40} y={108} width={50} height={7} rx={3} fill={A.blue} opacity={0.6} />
      <Rect x={40} y={121} width={36} height={5} rx={2} fill={tc.svgGray} opacity={0.4} />
      <SvgText x={158} y={125} textAnchor="end" fill={A.green} fontSize={11} fontWeight="bold">$320</SvgText>
      <Circle cx={162} cy={166} r={15} fill={A.blue} />
      <Line x1={155} y1={166} x2={169} y2={166} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={162} y1={159} x2={162} y2={173} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IlluDatosGenerales({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.teal2} />
      <Rect x={28} y={28} width={144} height={144} rx={12} fill={tc.svgWhite} stroke={A.teal3} strokeWidth={1.5} />
      <SvgText x={40} y={54} fill={tc.svgGray} fontSize={8} opacity={0.7}>Nombre del presupuesto</SvgText>
      <Rect x={40} y={58} width={120} height={14} rx={4} fill={A.teal2} stroke={A.teal} strokeWidth={1} />
      <SvgText x={46} y={69} fill={A.teal} fontSize={8}>Lote Marzo 2026</SvgText>
      <SvgText x={40} y={88} fill={tc.svgGray} fontSize={8} opacity={0.7}>Tasa de cambio (Bs./$)</SvgText>
      <Rect x={40} y={92} width={55} height={14} rx={4} fill={tc.svgWhite} stroke={A.teal3} strokeWidth={1} />
      <SvgText x={46} y={103} fill={tc.svgGray} fontSize={8}>Bs. 36,50</SvgText>
      <SvgText x={103} y={88} fill={tc.svgGray} fontSize={8} opacity={0.7}>Ganancia</SvgText>
      <Rect x={103} y={92} width={57} height={14} rx={4} fill={tc.svgWhite} stroke={A.teal3} strokeWidth={1} />
      <SvgText x={109} y={103} fill={A.green} fontSize={8} fontWeight="bold">30 %</SvgText>
      <SvgText x={40} y={122} fill={tc.svgGray} fontSize={8} opacity={0.7}>IVA</SvgText>
      <Rect x={40} y={126} width={55} height={14} rx={4} fill={tc.svgWhite} stroke={A.teal3} strokeWidth={1} />
      <SvgText x={46} y={137} fill={tc.svgGray} fontSize={8}>16 %</SvgText>
      <SvgText x={103} y={122} fill={tc.svgGray} fontSize={8} opacity={0.7}>Cantidad lote</SvgText>
      <Rect x={103} y={126} width={57} height={14} rx={4} fill={tc.svgWhite} stroke={A.teal3} strokeWidth={1} />
      <SvgText x={109} y={137} fill={tc.svgGray} fontSize={8}>50 unid.</SvgText>
      <Rect x={40} y={150} width={120} height={14} rx={7} fill={A.teal} />
      <SvgText x={100} y={161} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">Siguiente →</SvgText>
    </Svg>
  );
}

function IlluMP({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.amber2} />
      <Rect x={32} y={50} width={136} height={100} rx={10} fill={tc.svgWhite} stroke="#fde68a" strokeWidth={1.5} />
      {([65, 86, 107, 128] as number[]).map((y, i) => (
        <G key={i}>
          <Circle cx={52} cy={y} r={6} fill={i % 2 === 0 ? A.amber : '#fb923c'} />
          <Rect x={64} y={y - 4} width={52} height={7} rx={3} fill={tc.svgGray} opacity={0.3} />
          <SvgText x={156} y={y + 4} textAnchor="end" fill={tc.svgGray} fontSize={10}>${(i + 1) * 2},00</SvgText>
        </G>
      ))}
      <Rect x={62} y={26} width={76} height={18} rx={9} fill={A.amber} />
      <SvgText x={100} y={39} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">INSUMOS</SvgText>
    </Svg>
  );
}

function IlluMO({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.purple2} />
      <Circle cx={100} cy={68} r={22} fill="#ddd6fe" />
      <Circle cx={100} cy={63} r={14} fill={A.purple} opacity={0.9} />
      <Rect x={74} y={90} width={52} height={38} rx={10} fill={A.purple} opacity={0.6} />
      <Circle cx={152} cy={62} r={18} fill={tc.svgWhite} stroke="#ddd6fe" strokeWidth={2} />
      <Line x1={152} y1={57} x2={152} y2={64} stroke={tc.svgGray} strokeWidth={2} strokeLinecap="round" />
      <Line x1={152} y1={64} x2={157} y2={67} stroke={tc.svgGray} strokeWidth={2} strokeLinecap="round" />
      <Rect x={46} y={142} width={108} height={22} rx={11} fill={A.purple} opacity={0.12} />
      <SvgText x={100} y={157} textAnchor="middle" fill={A.purple} fontSize={11} fontWeight="bold">1 hora = $7,00</SvgText>
    </Svg>
  );
}

function IlluCIF({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.orange2} />
      <Rect x={55} y={55} width={90} height={105} rx={6} fill="#fed7aa" stroke="#fb923c" strokeWidth={1.5} />
      {([72, 100] as number[]).map(y =>
        ([68, 96, 124] as number[]).map(x => (
          <Rect key={`${x}-${y}`} x={x} y={y} width={14} height={16} rx={3} fill="#fb923c" opacity={0.6} />
        ))
      )}
      <Rect x={90} y={138} width={20} height={22} rx={3} fill="#c2410c" />
      <Circle cx={152} cy={50} r={16} fill="#fef9c3" stroke="#fbbf24" strokeWidth={1.5} />
      <SvgText x={152} y={55} textAnchor="middle" fill="#b45309" fontSize={12} fontWeight="bold">$</SvgText>
    </Svg>
  );
}

function IlluPrecio({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.green2} />
      <Circle cx={100} cy={85} r={42} fill={A.green3} />
      <Polyline points="80,85 95,102 125,67" fill="none" stroke={A.green}
        strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={22} y={144} width={68} height={24} rx={8} fill={A.blue2} />
      <SvgText x={56} y={160} textAnchor="middle" fill={A.blue} fontSize={10} fontWeight="bold">Costo</SvgText>
      <Rect x={110} y={144} width={68} height={24} rx={8} fill={A.green2} />
      <SvgText x={144} y={160} textAnchor="middle" fill={A.green} fontSize={10} fontWeight="bold">Precio</SvgText>
    </Svg>
  );
}

function IlluCotizacion({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.green2} />
      <Rect x={40} y={30} width={120} height={140} rx={10} fill={tc.svgWhite} stroke={A.green3} strokeWidth={1.5} />
      <Rect x={52} y={44} width={30} height={30} rx={6} fill={A.blue2} stroke={A.blue3} strokeWidth={1} />
      <SvgText x={67} y={63} textAnchor="middle" fill={A.blue} fontSize={9} fontWeight="bold">FC</SvgText>
      <Rect x={88} y={50} width={60} height={6} rx={3} fill={A.blue} opacity={0.6} />
      <Rect x={88} y={62} width={40} height={5} rx={2} fill={tc.svgGray} opacity={0.3} />
      <Rect x={52} y={86} width={96} height={5} rx={2} fill={tc.svgGray} opacity={0.25} />
      <Rect x={52} y={96} width={80} height={5} rx={2} fill={tc.svgGray} opacity={0.2} />
      <Rect x={52} y={112} width={96} height={22} rx={6} fill={A.green2} stroke={A.green3} strokeWidth={1} />
      <SvgText x={100} y={127} textAnchor="middle" fill={A.green} fontSize={10} fontWeight="bold">Total: $320,00</SvgText>
      <Line x1={52} y1={155} x2={148} y2={155} stroke={tc.svgGray} strokeWidth={1} opacity={0.4} />
      <SvgText x={100} y={168} textAnchor="middle" fill={tc.svgGray} fontSize={8} opacity={0.6}>Firma del cliente</SvgText>
    </Svg>
  );
}

function IlluEmpresa({ tc }: { tc: TC }) {
  return (
    <Svg width={SVG_SIZE} height={SVG_SIZE} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={A.blue2} />
      <Rect x={32} y={38} width={58} height={58} rx={12} fill={A.blue} opacity={0.15} stroke={A.blue3} strokeWidth={1.5} />
      <SvgText x={61} y={73} textAnchor="middle" fill={A.blue} fontSize={11} fontWeight="bold">LOGO</SvgText>
      <Rect x={106} y={38} width={62} height={58} rx={8} fill={tc.svgWhite} stroke={A.blue3} strokeWidth={1.5} />
      <Rect x={112} y={50} width={44} height={5} rx={2} fill={A.blue} opacity={0.5} />
      <Rect x={112} y={61} width={36} height={4} rx={2} fill={tc.svgGray} opacity={0.3} />
      <Rect x={112} y={71} width={30} height={4} rx={2} fill={tc.svgGray} opacity={0.2} />
      {([108, 122, 136, 150] as number[]).map((y, i) => (
        <Rect key={i} x={32} y={y} width={136} height={9} rx={4}
          fill={i === 0 ? A.blue : tc.svgGray} opacity={i === 0 ? 0.2 : 0.1} />
      ))}
    </Svg>
  );
}

// ─── Páginas ──────────────────────────────────────────────────────────────────

interface Page {
  Illu: React.ComponentType<{ tc: TC }>;
  accent: string;
  tip: string;
  title: string;
  subtitle: string;
}

const PAGES: Page[] = [
  {
    Illu: IlluBienvenida, accent: A.blue,
    tip: 'Pulsa el botón azul + para crear tu primer presupuesto.',
    title: '¡Bienvenido a FlowCost!',
    subtitle: 'Aquí verás todos tus presupuestos guardados. Podrás buscarlos, filtrarlos y ver cuánto has cotizado en total.',
  },
  {
    Illu: IlluDatosGenerales, accent: A.teal,
    tip: 'La tasa de cambio convierte automáticamente todos tus precios a bolívares.',
    title: 'Primero, los datos base',
    subtitle: 'Ponle nombre al presupuesto, indica cuántas unidades vas a producir (el "lote"), tu porcentaje de ganancia, el IVA y la tasa Bs./$. Todo lo demás se calcula solo.',
  },
  {
    Illu: IlluMP, accent: A.amber,
    tip: 'Si el precio de un insumo cambia, puedes editar el presupuesto después.',
    title: 'Paso 1: ¿Qué necesitas para producir?',
    subtitle: 'Anota cada ingrediente, material o envase que uses. Por ejemplo: harina, tela, frascos. Indica cuánto usas y cuánto cuesta cada uno en dólares.',
  },
  {
    Illu: IlluMO, accent: A.purple,
    tip: '¡Tu propio tiempo tiene valor! No lo regales — ponle precio.',
    title: 'Paso 2: ¿Quién trabaja en esto?',
    subtitle: 'Incluye a todas las personas que participan, incluyéndote a ti. Indica cuánto cobran por hora, día o mes y cuánto tiempo trabajaron en este lote.',
  },
  {
    Illu: IlluCIF, accent: A.orange,
    tip: 'Truco: divide el alquiler mensual entre los lotes que produces ese mes.',
    title: 'Paso 3: Los gastos del negocio',
    subtitle: 'Luz, agua, alquiler, internet — gastos que pagas aunque no estés produciendo. Son parte del costo real de tu producto y deben incluirse.',
  },
  {
    Illu: IlluPrecio, accent: A.green,
    tip: 'El 30% de ganancia es un buen punto de partida si no sabes por dónde empezar.',
    title: 'Paso 4: Tu precio de venta',
    subtitle: 'FlowCost suma todos tus costos, le agrega tu ganancia y calcula automáticamente el precio por unidad con y sin IVA.',
  },
  {
    Illu: IlluCotizacion, accent: A.green,
    tip: 'La cotización no muestra tus costos internos — solo lo que el cliente necesita ver.',
    title: 'Envíale una cotización a tu cliente',
    subtitle: 'Desde el menú de cada presupuesto puedes generar un PDF listo para compartir: con tu logo, precio final y espacio para firma. Sin revelar tus costos.',
  },
  {
    Illu: IlluEmpresa, accent: A.blue,
    tip: 'Pulsa "?" en el inicio para ver este tutorial de nuevo cuando quieras.',
    title: 'Dale tu toque profesional',
    subtitle: 'En la pestaña "Mi Empresa" agrega tu logo, RIF y teléfonos. Aparecerán en todos tus PDFs automáticamente.',
  },
];

// ─── Slide ────────────────────────────────────────────────────────────────────

function Slide({ item, tc }: { item: Page; tc: TC }) {
  const { Illu, accent, tip, title, subtitle } = item;
  return (
    <View style={[s.slide, { backgroundColor: tc.bg }]}>
      <Text style={[s.title, { color: tc.text }]}>{title}</Text>
      <View style={s.illuZone}>
        <Illu tc={tc} />
      </View>
      <View style={[s.tip, { backgroundColor: accent + '18', borderColor: accent + '40' }]}>
        <Text style={[s.tipTxt, { color: accent }]} numberOfLines={3}>
          💡 {tip}
        </Text>
      </View>
      <Text style={[s.subtitle, { color: tc.subtitle }]}>{subtitle}</Text>
    </View>
  );
}

// ─── Dots ─────────────────────────────────────────────────────────────────────

function Dots({ total, current }: { total: number; current: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[
          s.dot,
          i === current
            ? { width: 20, backgroundColor: A.blue }
            : { width: 6,  backgroundColor: A.blue3 },
        ]} />
      ))}
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FlowCostOnboarding() {
  const { markComplete } = useOnboarding();
  const { theme } = useThemeContext();
  const tc = useThemeColors(theme);

  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);
  const isLast = current === PAGES.length - 1;

  const finish = () => markComplete();

  const goNext = () => {
    if (isLast) { finish(); return; }
    const next = current + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrent(next);
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / W);
    setCurrent(index);
  };

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: tc.bg }]}>
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        initialNumToRender={PAGES.length}
        windowSize={PAGES.length}
        getItemLayout={(_, index) => ({ length: W, offset: W * index, index })}
        renderItem={({ item }) => <Slide item={item} tc={tc} />}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />

      <View style={[s.footer, { backgroundColor: tc.footerBg, borderTopColor: tc.border }]}>
        <Pressable onPress={finish} style={s.skipBtn}>
          <Text style={[s.skipTxt, { color: tc.subtitle }]}>Omitir</Text>
        </Pressable>

        <Dots total={PAGES.length} current={current} />

        <Pressable onPress={goNext} style={s.nextBtn}>
          <Text style={s.nextTxt}>{isLast ? '¡Empezar! 🚀' : 'Siguiente →'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  slide: {
    width: W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 8,
    // gap eliminado — usar marginBottom en hijos
  },

  illuZone: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  tip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    // CORREGIDO: era W * 0.30 / 35% — ilegible en web
    maxWidth: W * 0.85,
    width: '100%',
    marginBottom: 16,
  },
  tipTxt: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 19,
    textAlign: 'center',
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 22,
    // CORREGIDO: era W * 0.30 — muy angosto en web
    maxWidth: W * 0.85,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },

  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap no soportado en RN web 0.21 — usar marginRight en dot
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  skipBtn: { paddingVertical: 10, paddingHorizontal: 16, minWidth: 72 },
  skipTxt: { fontSize: 15, fontFamily: 'Inter-Regular', textAlign: 'center' },

  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: A.blue,
    minWidth: 72,
  },
  nextTxt: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});