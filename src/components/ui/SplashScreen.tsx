/**
 * SplashScreen.tsx
 * Splash screen animado compatible con web y Android.
 * - useNativeDriver:false en web (el driver nativo no soporta todas las props en RN web)
 * - gap reemplazado por marginBottom para compatibilidad con react-native-web 0.21
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import { useThemeContext } from '../../state/themeContext';

const TITLE  = 'FlowCost';
const SLOGAN = 'Conoce tu costo. Fija tu precio.';

const T_LOGO   = 600;
const T_CHAR   = 70;
const T_SLOGAN = 400;
const T_HOLD   = 400;
const T_OUT    = 300;

// En web, useNativeDriver:true no soporta todas las transformaciones
// y puede causar crashes silenciosos. Usamos false en web.
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

  const logoScale     = useRef(new Animated.Value(0)).current;
  const logoRotate    = useRef(new Animated.Value(0)).current;
  const sloganOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const [displayedTitle, setDisplayedTitle] = useState('');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: USE_NATIVE,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: T_LOGO,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE,
      }),
    ]).start(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setDisplayedTitle(TITLE.slice(0, i));
        if (i >= TITLE.length) {
          clearInterval(interval);
          Animated.timing(sloganOpacity, {
            toValue: 1,
            duration: T_SLOGAN,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE,
          }).start(() => {
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
            <Text style={[s.cursor, { color: '#2563eb' }]}>|</Text>
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
    // gap no funciona en StyleSheet con react-native-web 0.21
    // usamos marginBottom en los hijos en su lugar
  },

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
    marginBottom: 20,  // reemplaza gap
  },

  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2563eb',
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
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,  // reemplaza gap
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
  },

  slogan: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});