import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { palette } from '@/constants/theme';
import { AppStateProvider } from '@/state/app-state';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.cream } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cocktail/[slug]" options={{ presentation: 'card' }} />
        <Stack.Screen name="cocktail/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
    </AppStateProvider>
  );
}
