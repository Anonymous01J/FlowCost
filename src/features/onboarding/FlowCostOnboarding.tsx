/**
 * FlowCostOnboarding.tsx
 * Dependencia: npm install react-native-onboarding-swiper
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import Svg, {
  Circle, Rect, Line, Polyline, G, Text as SvgText,
} from 'react-native-svg';
import { useOnboarding } from '../../store/OnboardingContext';

const C = {
  blue:   '#2563eb', blue2:  '#eff6ff', blue3: '#bfdbfe',
  green:  '#16a34a', green2: '#f0fdf4',
  orange: '#ea580c', orange2:'#fff7ed',
  purple: '#7c3aed', purple2:'#faf5ff',
  amber:  '#f59e0b', amber2: '#fef3c7',
  slate:  '#1e293b', gray:   '#64748b', white: '#ffffff',
};

// ─── Ilustraciones SVG ────────────────────────────────────────────────────────

function IlluPresupuestos() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.blue2} />
      <Rect x={28} y={38} width={144} height={52} rx={10} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      <Rect x={40} y={52} width={68} height={8}  rx={4} fill={C.blue}  opacity={0.8} />
      <Rect x={40} y={66} width={44} height={6}  rx={3} fill={C.gray}  opacity={0.4} />
      <SvgText x={158} y={70} textAnchor="end" fill={C.green} fontSize={12} fontWeight="bold">$150</SvgText>
      <Rect x={28} y={100} width={144} height={52} rx={10} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      <Rect x={40} y={114} width={54} height={8}  rx={4} fill={C.blue}  opacity={0.6} />
      <Rect x={40} y={128} width={38} height={6}  rx={3} fill={C.gray}  opacity={0.4} />
      <SvgText x={158} y={132} textAnchor="end" fill={C.green} fontSize={12} fontWeight="bold">$320</SvgText>
      <Circle cx={162} cy={170} r={16} fill={C.blue} />
      <Line x1={154} y1={170} x2={170} y2={170} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={162} y1={162} x2={162} y2={178} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IlluMP() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.amber2} />
      <Rect x={32} y={50} width={136} height={100} rx={10} fill={C.white} stroke="#fde68a" strokeWidth={1.5} />
      {([65,86,107,128] as number[]).map((y, i) => (
        <G key={i}>
          <Circle cx={52} cy={y} r={6} fill={i % 2 === 0 ? C.amber : '#fb923c'} />
          <Rect x={64} y={y-4} width={52} height={7} rx={3} fill={C.gray} opacity={0.3} />
          <SvgText x={156} y={y+4} textAnchor="end" fill={C.slate} fontSize={10}>${(i+1)*2},00</SvgText>
        </G>
      ))}
      <Rect x={62} y={26} width={76} height={18} rx={9} fill={C.amber} />
      <SvgText x={100} y={39} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">INSUMOS</SvgText>
    </Svg>
  );
}

function IlluMO() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.purple2} />
      <Circle cx={100} cy={68} r={22} fill="#ddd6fe" />
      <Circle cx={100} cy={63} r={14} fill={C.purple} opacity={0.9} />
      <Rect x={74} y={90} width={52} height={38} rx={10} fill={C.purple} opacity={0.6} />
      <Circle cx={152} cy={62} r={18} fill={C.white} stroke="#ddd6fe" strokeWidth={2} />
      <Line x1={152} y1={57} x2={152} y2={64} stroke={C.slate} strokeWidth={2} strokeLinecap="round" />
      <Line x1={152} y1={64} x2={157} y2={67} stroke={C.slate} strokeWidth={2} strokeLinecap="round" />
      <Rect x={46} y={142} width={108} height={22} rx={11} fill={C.purple} opacity={0.12} />
      <SvgText x={100} y={157} textAnchor="middle" fill={C.purple} fontSize={11} fontWeight="bold">1 hora = $7,00</SvgText>
    </Svg>
  );
}

function IlluCIF() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.orange2} />
      <Rect x={55} y={55} width={90} height={105} rx={6} fill="#fed7aa" stroke="#fb923c" strokeWidth={1.5} />
      {([72,100] as number[]).map(y => ([68,96,124] as number[]).map(x => (
        <Rect key={`${x}-${y}`} x={x} y={y} width={14} height={16} rx={3} fill="#fb923c" opacity={0.6} />
      )))}
      <Rect x={90} y={138} width={20} height={22} rx={3} fill="#c2410c" />
      <Circle cx={152} cy={50} r={16} fill="#fef9c3" stroke="#fbbf24" strokeWidth={1.5} />
      <SvgText x={152} y={55} textAnchor="middle" fill="#b45309" fontSize={12} fontWeight="bold">$</SvgText>
    </Svg>
  );
}

function IlluResumen() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.green2} />
      <Circle cx={100} cy={92} r={42} fill="#bbf7d0" />
      <Polyline points="80,92 95,109 125,74" fill="none" stroke={C.green}
        strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={28} y={148} width={62} height={24} rx={8} fill={C.blue2} />
      <SvgText x={59} y={164} textAnchor="middle" fill={C.blue} fontSize={10} fontWeight="bold">Costo</SvgText>
      <Rect x={110} y={148} width={62} height={24} rx={8} fill={C.green2} />
      <SvgText x={141} y={164} textAnchor="middle" fill={C.green} fontSize={10} fontWeight="bold">Precio</SvgText>
    </Svg>
  );
}

function IlluEmpresa() {
  return (
    <Svg width={160} height={160} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.blue2} />
      <Rect x={32} y={38} width={58} height={58} rx={12} fill={C.blue} opacity={0.15} stroke={C.blue3} strokeWidth={1.5} />
      <SvgText x={61} y={73} textAnchor="middle" fill={C.blue} fontSize={11} fontWeight="bold">LOGO</SvgText>
      <Rect x={106} y={38} width={62} height={58} rx={8} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      {([110,128,146,164] as number[]).map((y, i) => (
        <Rect key={i} x={32} y={y} width={136} height={10} rx={5}
          fill={i === 0 ? C.blue : C.gray} opacity={i === 0 ? 0.25 : 0.12} />
      ))}
    </Svg>
  );
}

// ─── IlluWithTip: ilustración + burbuja de tip en un solo bloque ──────────────

interface IlluWithTipProps {
  Illu: React.ComponentType;
  tip: string;
  accent: string;
}

function IlluWithTip({ Illu, tip, accent }: IlluWithTipProps) {
  return (
    <View style={s.illuBlock}>
      <Illu />
      <View style={[s.tip, { backgroundColor: accent + '18', borderColor: accent + '40' }]}>
        <Text style={[s.tipTxt, { color: accent }]}>💡 {tip}</Text>
      </View>
    </View>
  );
}

// ─── Botones ──────────────────────────────────────────────────────────────────

function DoneBtn({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={[s.btn, { backgroundColor: C.blue, marginRight: 16 }]} onPress={onPress}>
      <Text style={s.btnTxt}>¡Empezar! 🚀</Text>
    </Pressable>
  );
}

function NextBtn({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={[s.btn, { backgroundColor: C.blue, marginRight: 16 }]} onPress={onPress}>
      <Text style={s.btnTxt}>Siguiente →</Text>
    </Pressable>
  );
}

function SkipBtn({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={[s.btn, { backgroundColor: 'transparent', marginLeft: 16 }]} onPress={onPress}>
      <Text style={[s.btnTxt, { color: C.gray }]}>Omitir</Text>
    </Pressable>
  );
}

// ─── Páginas ──────────────────────────────────────────────────────────────────

const PAGES = [
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluPresupuestos} accent={C.blue}
      tip="Pulsa el botón azul + para crear tu primer presupuesto." />,
    title: 'Tus presupuestos, siempre a mano',
    subtitle: 'Verás todos tus presupuestos guardados. Búscalos, fíltralos y conoce el total cotizado.',
  },
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluMP} accent={C.amber}
      tip="Puedes editar el presupuesto después si el precio de un insumo cambia." />,
    title: 'Paso 1: Ingredientes e insumos',
    subtitle: 'Lista todo lo que necesitas: harina, tela, envases. Indica cantidad y precio en dólares.',
  },
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluMO} accent={C.purple}
      tip="¡Tu propio tiempo también vale! Ponle un precio a tu trabajo." />,
    title: 'Paso 2: Tu trabajo y el de tu equipo',
    subtitle: 'Registra cargo, tipo de pago (hora/día/mes) y tiempo invertido en el lote.',
  },
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluCIF} accent={C.orange}
      tip="Divide el gasto mensual entre los lotes que produces ese mes." />,
    title: 'Paso 3: Gastos del negocio',
    subtitle: 'Luz, agua, alquiler, transporte — costos que no van al producto pero sí al precio.',
  },
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluResumen} accent={C.green}
      tip="El 30% de utilidad es un buen punto de partida para empezar." />,
    title: 'Paso 4: Tu precio de venta',
    subtitle: 'La app calcula costo unitario, utilidad, precio sin IVA y precio final al cliente.',
  },
  {
    backgroundColor: C.white,
    image: <IlluWithTip Illu={IlluEmpresa} accent={C.blue}
      tip='Pulsa "?" en el inicio para ver este tutorial de nuevo cuando lo necesites.' />,
    title: 'Ponle tu sello profesional',
    subtitle: 'En "Mi Empresa" agrega logo, RIF y teléfonos. Aparecen en el encabezado del PDF.',
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FlowCostOnboarding() {
  const { markComplete } = useOnboarding();
  const finish = async () => { await markComplete(); };

  return (
    <View style={s.screen}>
      <Onboarding
        pages={PAGES}
        onDone={finish}
        onSkip={finish}
        DoneButtonComponent={DoneBtn}
        NextButtonComponent={NextBtn}
        SkipButtonComponent={SkipBtn}
        showSkip
        bottomBarColor={C.white}
        dotColor={C.blue3}
        activeDotColor={C.blue}
        titleStyles={s.title}
        subTitleStyles={s.subtitle}
        containerStyles={s.container}
        imageContainerStyles={s.imageContainer}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: C.white },
  container:      { alignItems: 'center', paddingHorizontal: 24 },
  imageContainer: { paddingBottom: 0, paddingTop: 0 },

  // IlluWithTip
  illuBlock: { alignItems: 'center', gap: 12 },
  tip: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    maxWidth: 300,
  },
  tipTxt: {
    fontSize: 13, fontFamily: 'Inter-Regular',
    lineHeight: 20, textAlign: 'center',
  },

  // Texto
  title: {
    fontSize: 21, fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: C.slate, textAlign: 'center',
    marginBottom: 8, lineHeight: 28,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 15, color: C.gray,
    fontFamily: 'Inter-Regular',
    textAlign: 'center', lineHeight: 23,
    paddingHorizontal: 16,
  },

  // Botones
  btn: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 12, minWidth: 90, alignItems: 'center',
  },
  btnTxt: {
    fontSize: 15, fontWeight: '700',
    fontFamily: 'Inter-Bold', color: C.white,
  },
});