/**
 * FlowCostOnboarding.tsx
 * Instalar: npm install @blazejkustra/react-native-onboarding
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Onboarding from '@blazejkustra/react-native-onboarding';
import Svg, {
  Circle, Rect, Path, Line, Polyline, G, Defs, LinearGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useOnboarding } from '../../store/OnboardingContext';

const C = {
  blue:   '#2563eb', blue2:  '#eff6ff', blue3: '#bfdbfe',
  green:  '#16a34a', green2: '#f0fdf4',
  orange: '#ea580c', orange2:'#fff7ed',
  purple: '#7c3aed', purple2:'#faf5ff',
  slate:  '#1e293b', gray:   '#64748b', white: '#ffffff',
};

// ─── Ilustraciones ────────────────────────────────────────────────────────────

function IlluWelcome() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="gr1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={C.blue2} />
          <Stop offset="1" stopColor={C.purple2} />
        </LinearGradient>
      </Defs>
      <Rect x={10} y={10} width={180} height={180} rx={24} fill="url(#gr1)" />
      <Rect x={70} y={48} width={60} height={60} rx={14} fill={C.blue} />
      <SvgText x={100} y={90} textAnchor="middle" fill="white" fontSize={28} fontWeight="bold">FC</SvgText>
      <SvgText x={100} y={138} textAnchor="middle" fill={C.slate} fontSize={15} fontWeight="bold">FlowCost</SvgText>
      <SvgText x={100} y={158} textAnchor="middle" fill={C.gray} fontSize={11}>Tu asistente de costos</SvgText>
    </Svg>
  );
}

function IlluPresupuestos() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.blue2} />
      <Rect x={28} y={38} width={144} height={52} rx={10} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      <Rect x={40} y={52} width={68} height={8} rx={4} fill={C.blue} opacity={0.8} />
      <Rect x={40} y={66} width={44} height={6} rx={3} fill={C.gray} opacity={0.4} />
      <SvgText x={158} y={70} textAnchor="end" fill={C.green} fontSize={12} fontWeight="bold">$150</SvgText>
      <Rect x={28} y={100} width={144} height={52} rx={10} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      <Rect x={40} y={114} width={54} height={8} rx={4} fill={C.blue} opacity={0.6} />
      <Rect x={40} y={128} width={38} height={6} rx={3} fill={C.gray} opacity={0.4} />
      <SvgText x={158} y={132} textAnchor="end" fill={C.green} fontSize={12} fontWeight="bold">$320</SvgText>
      <Circle cx={162} cy={170} r={16} fill={C.blue} />
      <Line x1={154} y1={170} x2={170} y2={170} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={162} y1={162} x2={162} y2={178} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

function IlluMP() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill="#fef3c7" />
      <Rect x={32} y={50} width={136} height={100} rx={10} fill={C.white} stroke="#fde68a" strokeWidth={1.5} />
      {[65,86,107,128].map((y, i) => (
        <G key={i}>
          <Circle cx={52} cy={y} r={6} fill={i%2===0?'#f59e0b':'#fb923c'} />
          <Rect x={64} y={y-4} width={52} height={7} rx={3} fill={C.gray} opacity={0.3} />
          <SvgText x={156} y={y+4} textAnchor="end" fill={C.slate} fontSize={10}>${(i+1)*2},00</SvgText>
        </G>
      ))}
      <Rect x={62} y={26} width={76} height={18} rx={9} fill="#f59e0b" />
      <SvgText x={100} y={39} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">INSUMOS</SvgText>
    </Svg>
  );
}

function IlluMO() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
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
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.orange2} />
      <Rect x={55} y={55} width={90} height={105} rx={6} fill="#fed7aa" stroke="#fb923c" strokeWidth={1.5} />
      {[72,100].map(y => [68,96,124].map(x => (
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
    <Svg width={180} height={180} viewBox="0 0 200 200">
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
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Rect x={10} y={10} width={180} height={180} rx={24} fill={C.blue2} />
      <Rect x={32} y={38} width={58} height={58} rx={12} fill={C.blue} opacity={0.15} stroke={C.blue3} strokeWidth={1.5} />
      <SvgText x={61} y={73} textAnchor="middle" fill={C.blue} fontSize={11} fontWeight="bold">LOGO</SvgText>
      <Rect x={106} y={38} width={62} height={58} rx={8} fill={C.white} stroke={C.blue3} strokeWidth={1.5} />
      <SvgText x={137} y={66} textAnchor="middle" fill={C.blue} fontSize={14}>🏢</SvgText>
      {[110,128,146,164].map((y,i) => (
        <Rect key={i} x={32} y={y} width={136} height={10} rx={5}
          fill={i===0?C.blue:C.gray} opacity={i===0?0.25:0.12} />
      ))}
    </Svg>
  );
}

// ─── Step base ────────────────────────────────────────────────────────────────

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isLast?: boolean;
  Illustration: React.ComponentType;
  title: string;
  description: string;
  tip?: string;
  accent?: string;
}

function Step({ onNext, onBack, onSkip, isLast, Illustration, title, description, tip, accent = C.blue }: StepProps) {
  return (
    <View style={s.step}>
      {!isLast && (
        <Pressable style={s.skipWrap} onPress={onSkip}>
          <Text style={s.skipTxt}>Omitir</Text>
        </Pressable>
      )}
      <View style={s.illuWrap}><Illustration /></View>
      <View style={s.body}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.desc}>{description}</Text>
        {tip && (
          <View style={[s.tip, { backgroundColor: accent + '15', borderColor: accent + '35' }]}>
            <Text style={[s.tipTxt, { color: accent }]}>💡 {tip}</Text>
          </View>
        )}
      </View>
      <View style={s.nav}>
        {onBack
          ? <Pressable style={s.back} onPress={onBack}><Text style={s.backTxt}>← Atrás</Text></Pressable>
          : <View style={{ width: 80 }} />
        }
        <Pressable style={[s.next, { backgroundColor: accent }]} onPress={onNext}>
          <Text style={s.nextTxt}>{isLast ? '¡Empezar! 🚀' : 'Siguiente →'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FlowCostOnboarding() {
  const { markComplete } = useOnboarding();
  const finish = async () => { await markComplete(); };

  const steps = [
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluPresupuestos} accent={C.blue}
          title="Tus presupuestos, siempre a mano"
          description="En la pantalla principal verás todos tus presupuestos guardados. Puedes buscarlos, filtrarlos y ver cuánto dinero has cotizado en total."
          tip="Pulsa el botón azul + para crear tu primer presupuesto." />
      ),
    },
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluMP} accent="#f59e0b"
          title="Paso 1: Ingredientes e insumos"
          description="Lista todo lo que necesitas para producir: harina, tela, pintura, envases. Indica la cantidad y el precio en dólares — la app calcula el total solo."
          tip="Puedes editar el presupuesto después si el precio cambia." />
      ),
    },
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluMO} accent={C.purple}
          title="Paso 2: Tu trabajo y el de tu equipo"
          description="Registra el tiempo que dedican a producir. Indica el cargo, cuánto se paga por hora o día, y cuántas horas trabajan en este lote."
          tip="¡Tu propio tiempo también vale! Ponle un precio a tu trabajo." />
      ),
    },
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluCIF} accent={C.orange}
          title="Paso 3: Gastos del negocio"
          description="Luz, agua, alquiler, gas, transporte — son costos que no van al producto directamente pero sí deben incluirse. Usa los accesos rápidos para añadirlos fácilmente."
          tip="Divide el gasto mensual entre los lotes que produces ese mes." />
      ),
    },
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluResumen} accent={C.green}
          title="Paso 4: Tu precio de venta"
          description="La app suma todo y calcula: cuánto te cuesta producir, cuánto cobrar para ganar, y el precio final con IVA. Todo en dólares y bolívares."
          tip="El 30% de utilidad es un buen punto de partida para empezar." />
      ),
    },
    {
      component: ({ onNext, onBack, onSkip, isLast }: any) => (
        <Step onNext={onNext} onBack={onBack} onSkip={onSkip} isLast={isLast}
          Illustration={IlluEmpresa} accent={C.blue}
          title="Ponle tu sello profesional"
          description='En la pestaña "Mi Empresa" agrega tu logo, nombre, RIF y teléfonos. Estos datos aparecerán en el PDF del presupuesto, dándole un aspecto profesional.'
          tip='Pulsa "?" en el inicio para ver este tutorial de nuevo cuando lo necesites.' />
      ),
    },
  ];

  return (
    <View style={s.screen}>
      <Onboarding
        introPanel={{
          title: '¡Bienvenido a FlowCost!',
          subtitle: 'Te explicamos en 6 pasos cómo calcular el precio correcto para lo que produces o vendes — sin necesitar conocimientos de contabilidad.',
          button: 'Ver cómo funciona →',
          image: require('../../../assets/icon.png'),
        }}
        fonts={{
          introTitle:      'Inter-Bold',
          introSubtitle:   'Inter-Regular',
          stepTitle:       'Inter-SemiBold',
          stepDescription: 'Inter-Regular',
          primaryButton:   'Inter-Medium',
        }}
        steps={steps}
        onComplete={finish}
        onSkip={finish}
        skipButton={({ onPress }: { onPress: () => void }) => (
          <Pressable style={s.topSkip} onPress={onPress}>
            <Text style={s.topSkipTxt}>Omitir</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: C.white },
  step:     { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20, backgroundColor: C.white },
  skipWrap: { alignSelf: 'flex-end', padding: 8 },
  skipTxt:  { fontSize: 14, color: C.gray, fontFamily: 'Inter-Regular' },
  illuWrap: { marginVertical: 12, alignItems: 'center' },
  body:     { flex: 1, width: '100%', alignItems: 'center' },
  title:    { fontSize: 21, fontWeight: '700', fontFamily: 'Inter-Bold', textAlign: 'center', color: C.slate, marginBottom: 10, lineHeight: 28 },
  desc:     { fontSize: 15, color: C.gray, textAlign: 'center', lineHeight: 23, fontFamily: 'Inter-Regular', marginBottom: 14 },
  tip:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, width: '100%' },
  tipTxt:   { fontSize: 13, fontFamily: 'Inter-Regular', lineHeight: 20, textAlign: 'center' },
  nav:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 14 },
  back:     { width: 80, paddingVertical: 10 },
  backTxt:  { fontSize: 15, color: C.gray, fontFamily: 'Inter-Regular' },
  next:     { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  nextTxt:  { fontSize: 15, fontWeight: '700', color: C.white, fontFamily: 'Inter-Bold' },
  topSkip:  { paddingHorizontal: 16, paddingVertical: 8 },
  topSkipTxt: { fontSize: 14, color: C.gray, fontFamily: 'Inter-Regular' },
});