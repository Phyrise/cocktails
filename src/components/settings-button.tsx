import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette } from '@/constants/theme';

export function SettingsButton({ light = false }: { light?: boolean }) {
  const router = useRouter();
  return <Pressable accessibilityLabel="Ouvrir les réglages" onPress={() => router.push('/settings' as never)} style={[styles.button, light && styles.light]}><Text style={[styles.icon, light && styles.lightIcon]}>⚙</Text></Pressable>;
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: '#FFF9F0', borderColor: '#E8DCCE', borderRadius: 20, borderWidth: 1, height: 40, justifyContent: 'center', width: 40 },
  light: { backgroundColor: 'rgba(255,249,240,0.92)', borderColor: 'transparent' }, icon: { color: palette.wine, fontSize: 17 }, lightIcon: { color: palette.wineDark },
});
