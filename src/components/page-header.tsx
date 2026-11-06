import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, T } from '@/components/ui';
import { space } from '@/constants/theme';

/** Accès aux réglages, en haut à droite de chaque onglet. */
export function SettingsButton() {
  return <IconButton name="settings" label="Réglages" onPress={() => router.push('/settings')} />;
}

export function PageHeader({ title, subtitle, right, back, eyebrow }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean; eyebrow?: string }) {
  return (
    <View style={styles.header}>
      {back ? <IconButton name="chevronLeft" label="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {eyebrow ? <T variant="label" tone="accent" style={{ marginBottom: 2 }}>{eyebrow}</T> : null}
        <T variant="h1" numberOfLines={1}>{title}</T>
        {subtitle ? <T variant="small" tone="muted" style={{ marginTop: 2 }}>{subtitle}</T> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingTop: space.md, paddingBottom: space.md },
  right: { flexDirection: 'row', gap: space.xs },
});
