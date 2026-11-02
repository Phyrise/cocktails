import { createContext, type PropsWithChildren, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, radius, space } from '@/constants/theme';
import { useTheme } from '@/state/store';

const ToastContext = createContext<(message: string) => void>(() => undefined);

/** Petit message éphémère en bas de l'écran (« Ajouté à la liste de courses »…). */
export function ToastProvider({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMessage(null));
    }, 2200);
  }, [opacity]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 92 }]}>
          <Animated.View style={[styles.toast, { backgroundColor: colors.ink, opacity }]}>
            <Text style={[styles.text, { color: colors.bg }]}>{message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: space.lg },
  toast: { borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm, maxWidth: 420 },
  text: { fontFamily: fonts.body, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
