/**
 * SplashScreen.tsx
 * Fix: reemplaza Animated.spring por Animated.timing con duración fija.
 * Spring no tiene duración garantizada — el callback .start() puede
 * dispararse antes de que la animación termine visualmente en móvil,
 * haciendo que el título no se escriba completo.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import { useThemeContext } from '../../state/themeContext';

const TITLE  = 'FlowCost';
const SLOGAN = 'Conoce tu costo. Fija tu precio.';

// Duraciones fijas — garantizan que el callback de cada fase
// siempre dispara en el momento correcto en Android, iOS y web
const T_LOGO   = 650;   // logo entra (scale + rotate)
const T_CHAR   = 75;    // ms por carácter  (8 letras × 75 = 600ms)
const T_SLOGAN = 400;   // fade in del slogan
const T_HOLD   = 500;   // pausa antes de salir
const T_OUT    = 350;   // fade out

// useNativeDriver:true no soporta todas las props en RN web
const USE_NATIVE = Platform.OS !== 'web';

interface Props {
  onFinish: () => void;
}

export default function FlowCostSplash({ onFinish }: Props) {
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const bg          = isDark ? '#0f172a' : '#ffffff';
  const textColor   = isDark ? '#f1f5f9' : '#1e293b';
  const subtleColor = isDark ? '#64748b' : '#94a3b8';

  // Valores animados
  const logoScale     = useRef(new Animated.Value(0)).current;
  const logoRotate    = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const [displayedTitle, setDisplayedTitle] = useState('');
  // Ref para limpiar el interval si el componente se desmonta
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // ── Fase 1: Logo entra con timing fijo (no spring) ────────────────────
    // Timing garantiza que .start() dispara exactamente a T_LOGO ms.
    // Spring no tiene duración fija — puede variar según la carga del hilo.
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: T_LOGO,
        easing: Easing.out(Easing.back(1.5)),  // efecto "rebote" sin spring
        useNativeDriver: USE_NATIVE,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: T_LOGO,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE,
      }),
    ]).start(() => {
      // ── Fase 2: Escribir título letra a letra ───────────────────────────
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayedTitle(TITLE.slice(0, i));

        if (i >= TITLE.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          // ── Fase 3: Fade in del slogan ──────────────────────────────────
          Animated.timing(sloganOpacity, {
            toValue: 1,
            duration: T_SLOGAN,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE,
          }).start(() => {
            // ── Fase 4: Hold + fade out ─────────────────────────────────
            setTimeout(() => {
              Animated.timing(screenOpacity, {
                toValue: 0,
                duration: T_OUT,
                easing: Easing.in(Easing.quad),
                useNativeDriver: USE_NATIVE,
              }).start(() => onFinish());
            }, T_HOLD);
          });
        }
      }, T_CHAR);
    });

    // Limpieza si el componente se desmonta antes de terminar
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const rotate = logoRotate.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[s.screen, { backgroundColor: bg, opacity: screenOpacity }]}>

      <Animated.View style={[
        s.logoWrap,
        { transform: [{ scale: logoScale }, { rotate }] },
      ]}>
        <View style={[s.logoShadow, isDark && s.logoShadowDark]} />
        <View style={s.logoBadge}>
          <Text style={s.logoText}>FC</Text>
        </View>
      </Animated.View>

      <View style={s.titleRow}>
        <Text style={[s.title, { color: textColor }]}>
          {displayedTitle}
          {displayedTitle.length < TITLE.length && (
            <Text style={[s.cursor, { color: '#0091ff' }]}>|</Text>
          )}
        </Text>
      </View>

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
  },

  logoShadow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#0091ff',
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
    marginBottom: 20,
  },

  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0091ff',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Inter-ExtraBold',
    letterSpacing: -1,
  },

  cursor: {
    fontSize: 36,
    fontWeight: '200',
  },

  slogan: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});