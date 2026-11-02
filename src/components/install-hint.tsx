import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, T } from '@/components/ui';
import { space } from '@/constants/theme';
import { useTheme, useUser } from '@/state/store';

/** Sur le web, tant que l'app n'est pas installée : comment l'ajouter à l'écran d'accueil (masquable). */
export function InstallHint() {
  const { colors } = useTheme();
  const { data, updateSettings } = useUser();
  if (Platform.OS !== 'web' || data.settings.installHintDismissed) return null;
  const nav = globalThis.navigator as (Navigator & { standalone?: boolean }) | undefined;
  const standalone = globalThis.matchMedia?.('(display-mode: standalone)').matches || nav?.standalone;
  const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
  if (standalone || !touch) return null;
  const ios = /iPhone|iPad|iPod/.test(nav?.userAgent ?? '');
  return (
    <Card style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt }]}>
      <Icon name="download" size={20} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <T variant="h3">Installer l’app</T>
        <T variant="small" tone="muted">
          {ios ? 'Touchez Partager puis « Sur l’écran d’accueil » : plein écran et hors ligne.' : 'Menu du navigateur (trois points) puis « Installer l’application » : plein écran et hors ligne.'}
        </T>
      </View>
      <Pressable accessibilityLabel="Masquer" hitSlop={10} onPress={() => updateSettings({ installHintDismissed: true })}>
        <Icon name="x" size={18} color={colors.muted} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
});
