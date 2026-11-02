import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, type ScrollViewProps, type StyleProp, StyleSheet, Text, type TextProps, type TextStyle, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { fonts, MAX_WIDTH, radius, space, type } from '@/constants/theme';
import { useTheme } from '@/state/store';

type Variant = keyof typeof type;
type Tone = 'ink' | 'inkSoft' | 'muted' | 'accent' | 'ok' | 'warn' | 'danger' | 'accentInk' | 'gold';

export function T({ variant = 'body', tone = 'ink', style, ...props }: TextProps & { variant?: Variant; tone?: Tone }) {
  const { colors } = useTheme();
  return <Text {...props} style={[type[variant] as TextStyle, { color: colors[tone] }, style]} />;
}

/** Conteneur d'écran : fond, marges de sécurité, largeur maximale centrée. */
export function Screen({ children, scroll = true, padded = true, contentStyle, header, ...props }: PropsWithChildren<ScrollViewProps & { scroll?: boolean; padded?: boolean; contentStyle?: ViewStyle; header?: ReactNode }>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const inner = <View style={[styles.inner, padded && styles.padded, contentStyle]}>{children}</View>;
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {header}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.xxl + insets.bottom }} {...props}>
          {inner}
        </ScrollView>
      ) : inner}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  flex?: boolean;
};

export function Button({ label, onPress, icon, variant = 'primary', size = 'md', disabled, loading, style, flex }: ButtonProps) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.accent, fg: colors.accentInk, border: colors.accent },
    secondary: { bg: colors.surface, fg: colors.ink, border: colors.line },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.line },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        flex && { flex: 1 },
        style,
      ]}>
      {loading ? <ActivityIndicator color={palette.fg} size="small" /> : icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={palette.fg} /> : null}
      <Text numberOfLines={1} style={[styles.buttonLabel, size === 'sm' && { fontSize: 14 }, { color: palette.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ name, onPress, label, active, filled, tone, size = 40, style }: { name: IconName; onPress?: () => void; label: string; active?: boolean; filled?: boolean; tone?: string; size?: number; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, backgroundColor: active ? colors.accentSoft : colors.surface, borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
        style,
      ]}>
      <Icon name={name} size={Math.round(size * 0.48)} color={tone ?? (active ? colors.accent : colors.ink)} filled={filled} />
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, icon, count, style }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; count?: number; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? colors.ink : colors.surface, borderColor: selected ? colors.ink : colors.line, opacity: pressed ? 0.75 : 1 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={15} color={selected ? colors.bg : colors.inkSoft} /> : null}
      <Text style={[styles.chipLabel, { color: selected ? colors.bg : colors.inkSoft }]}>{label}</Text>
      {count != null ? <Text style={[styles.chipCount, { color: selected ? colors.bg : colors.muted }]}>{count}</Text> : null}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; onPress?: () => void }>) {
  const { colors } = useTheme();
  const base = [styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return <Pressable onPress={onPress} style={({ pressed }) => [...base, { opacity: pressed ? 0.85 : 1 }]}>{children}</Pressable>;
}

export function SectionHeader({ title, action, onAction, subtitle }: { title: string; action?: string; onAction?: () => void; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <T variant="h2">{title}</T>
        {subtitle ? <T variant="small" tone="muted" style={{ marginTop: 2 }}>{subtitle}</T> : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.sectionAction}>
          <Text style={[styles.sectionActionLabel, { color: colors.accent }]}>{action}</Text>
          <Icon name="chevronRight" size={16} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string; count?: number }[]; value: T; onChange: (value: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceAlt }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.segment, active && { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <Text numberOfLines={1} style={[styles.segmentLabel, { color: active ? colors.ink : colors.muted }]}>
              {option.label}{option.count ? ` · ${option.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Empty({ icon, title, text, action, onAction }: { icon: IconName; title: string; text?: string; action?: string; onAction?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accentSoft }]}><Icon name={icon} size={26} color={colors.accent} /></View>
      <T variant="h3" style={{ textAlign: 'center' }}>{title}</T>
      {text ? <T variant="small" tone="muted" style={{ textAlign: 'center', maxWidth: 300 }}>{text}</T> : null}
      {action ? <Button label={action} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: space.xs }} /> : null}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }, style]} />;
}

export function HScroll({ children, gap = space.sm }: PropsWithChildren<{ gap?: number }>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hscroll} contentContainerStyle={{ gap, paddingHorizontal: space.md }}>
      {children}
    </ScrollView>
  );
}

export function Stars({ value, onChange, size = 26 }: { value: number; onChange?: (value: number) => void; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} disabled={!onChange} hitSlop={4} accessibilityLabel={`${star} étoile${star > 1 ? 's' : ''}`} onPress={() => onChange?.(star)}>
          <Icon name="star" size={size} color={star <= value ? colors.gold : colors.line} filled={star <= value} />
        </Pressable>
      ))}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  padded: { paddingHorizontal: space.md },
  button: { minHeight: 48, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs },
  buttonSm: { minHeight: 38, paddingHorizontal: space.md },
  buttonLabel: { fontFamily: fonts.body, fontSize: 16, fontWeight: '700' },
  iconButton: { borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
  chipLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: '600' },
  chipCount: { fontFamily: fonts.body, fontSize: 13, fontWeight: '600' },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: space.md, ...Platform.select({ web: { boxShadow: '0 1px 2px rgba(0,0,0,0.04)' } as object, default: {} }) },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginBottom: space.sm },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingBottom: 3 },
  sectionActionLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  segment: { flex: 1, minHeight: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 6 },
  segmentLabel: { fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', gap: space.xs, paddingVertical: space.xl, paddingHorizontal: space.lg },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  hscroll: { marginHorizontal: -space.md },
});
