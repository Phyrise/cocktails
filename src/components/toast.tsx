import { createContext, type PropsWithChildren, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, radius, space } from '@/constants/theme';
import { useTheme } from '@/state/store';

export type ToastAction = { label: string; onPress: () => void };
type Toast = { text: string; action?: ToastAction };

const ToastContext = createContext<(message: string, action?: ToastAction) => void>(() => undefined);

/**
 * Petit message éphémère en bas de l'écran (« Ajouté à la liste de courses »…).
 * Avec une action (« Annuler »), il reste affiché plus longtemps et devient touchable.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback((text: string, action?: ToastAction) => {
    setToast({ text, action });
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    timer.current = setTimeout(hide, action ? 5000 : 2200);
  }, [hide, opacity]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 92 }]}>
          <Animated.View pointerEvents={toast.action ? 'auto' : 'none'} style={[styles.toast, { backgroundColor: colors.ink, opacity }]}>
            <Text style={[styles.text, { color: colors.bg }]}>{toast.text}</Text>
            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => { toast.action?.onPress(); hide(); }}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Text style={[styles.text, styles.action, { color: colors.bg }]}>{toast.action.label}</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: space.lg },
  toast: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm, maxWidth: 420 },
  text: { fontFamily: fonts.body, fontSize: 15, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  action: { fontWeight: '800', textTransform: 'uppercase', fontSize: 14, letterSpacing: 0.5, textDecorationLine: 'underline' },
});
