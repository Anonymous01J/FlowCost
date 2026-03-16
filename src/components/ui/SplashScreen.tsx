/**
 * FlowCostSplash.tsx
 * Splash screen animado:
 *  1. Logo FC entra girando + scale (0 → 1, 0° → 360°) — 600ms
 *  2. Título "FlowCost" escribe letra a letra — 800ms
 *  3. Slogan aparece con fade — 400ms
 *  4. Todo sale con fade out — 300ms
 *  Total visible: ~2.5s
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
} from 'react-native';
import { useThemeContext } from '../../state/themeContext';

const TITLE    = 'FlowCost';
const SLOGAN   = 'Conoce tu costo. Fija tu precio.';

// Duración de cada fase (ms)
const T_LOGO   = 600;   // logo entra girando
const T_PAUSE  = 100;   // pausa antes de escribir
const T_CHAR   = 70;    // ms por carácter del título
const T_SLOGAN = 400;   // fade del slogan
const T_HOLD   = 400;   // tiempo de espera antes del fade out
const T_OUT    = 300;   // fade out total

interface Props {
  onFinish: () => void;
}

export default function FlowCostSplash({ onFinish }: Props) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  // Colores adaptados al tema
  const bg         = isDark ? '#0f172a' : '#ffffff';
  const textColor  = isDark ? '#f1f5f9' : '#1e293b';
  const subtleColor = isDark ? '#64748b' : '#94a3b8';

  // ─── Valores animados ───────────────────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoRotate  = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Estado para el texto que se va "escribiendo"
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [showSlogan, setShowSlogan]         = useState(false);

  // ─── Secuencia de animación ─────────────────────────────────────────────────
  useEffect(() => {
    // Fase 1: Logo entra girando (scale 0→1 + rotación 0→360°)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: T_LOGO,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fase 2: Escribir el título letra a letra
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayedTitle(TITLE.slice(0, i));
        if (i >= TITLE.length) {
          clearInterval(interval);

          // Fase 3: Fade in del slogan
          setShowSlogan(true);
          Animated.timing(sloganOpacity, {
            toValue: 1,
            duration: T_SLOGAN,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            // Fase 4: Hold + fade out de toda la pantalla
            setTimeout(() => {
              Animated.timing(screenOpacity, {
                toValue: 0,
                duration: T_OUT,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
              }).start(() => onFinish());
            }, T_HOLD);
          });
        }
      }, T_CHAR);
    });
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[s.screen, { backgroundColor: bg, opacity: screenOpacity }]}>

      {/* Logo FC */}
      <Animated.View style={[
        s.logoWrap,
        { transform: [{ scale: logoScale }, { rotate }] },
      ]}>
        {/* Sombra sutil */}
        <View style={[s.logoShadow, isDark && s.logoShadowDark]} />
        {/* Badge principal */}
        <View style={s.logoBadge}>
          <Text style={s.logoText}>FC</Text>
        </View>
      </Animated.View>

      {/* Título letra a letra */}
      <View style={s.titleRow}>
        <Text style={[s.title, { color: textColor }]}>
          {displayedTitle}
          {/* Cursor parpadeante mientras escribe */}
          {displayedTitle.length < TITLE.length && (
            <Text style={[s.cursor, { color: '#2563eb' }]}>|</Text>
          )}
        </Text>
      </View>

      {/* Slogan con fade */}
      <Animated.Text style={[s.slogan, { color: subtleColor, opacity: sloganOpacity }]}>
        {SLOGAN}
      </Animated.Text>

    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  // Sombra debajo del logo para dar profundidad
  logoShadow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    opacity: 0.15,
    transform: [{ translateY: 6 }],
  },
  logoShadowDark: {
    opacity: 0.3,
  },

  logoWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    // Borde interno sutil
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  logoText: {
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'Inter-ExtraBold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },

  titleRow: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Inter-ExtraBold',
    letterSpacing: -1,
  },

  cursor: {
    fontSize: 36,
    fontWeight: '300',
    // El cursor parpadea visualmente porque React re-renderiza
    // mientras displayedTitle cambia — no requiere animación extra
  },

  slogan: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: -8,
  },
});