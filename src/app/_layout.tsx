// Import ciblé des deux graisses utilisées : l'index du paquet embarquerait les 18 variantes (~1,5 Mo).
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogProvider } from '@/components/dialog';
import { ToastProvider } from '@/components/toast';
import { Button, T } from '@/components/ui';
import { space } from '@/constants/theme';
import { parseDatabaseFile, defaultDbUrl } from '@/lib/database';
import { pickJsonFile } from '@/lib/files';
import { AppProvider, useCatalog, useTheme } from '@/state/store';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Gate() {
  const { colors, scheme } = useTheme();
  const catalog = useCatalog();

  useEffect(() => {
    if (catalog.status !== 'loading') SplashScreen.hideAsync().catch(() => undefined);
  }, [catalog.status]);

  if (catalog.status === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <T variant="h1" tone="accent">Arturo et Clémentine</T>
        <ActivityIndicator color={colors.accent} style={{ marginTop: space.md }} />
        {catalog.progress ? <T variant="small" tone="muted" style={{ marginTop: space.xs }}>Téléchargement de la base · {catalog.progress.label}</T> : null}
      </View>
    );
  }

  if (catalog.status === 'error' && !catalog.db) {
    const importFile = async () => {
      const data = await pickJsonFile().catch(() => null);
      const db = parseDatabaseFile(data, defaultDbUrl());
      if (db) await catalog.replaceDatabase(db);
    };
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, gap: space.sm }]}>
        <T variant="h2" style={{ textAlign: 'center' }}>Impossible de charger les recettes</T>
        <T variant="small" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
          Vérifiez la connexion pour le premier téléchargement. Ensuite, l’app fonctionne hors ligne.
        </T>
        {catalog.error ? <T variant="tiny" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>{catalog.error}</T> : null}
        <Button label="Réessayer" icon="refresh" onPress={() => catalog.downloadLatest().catch(() => undefined)} />
        <Button label="Importer un fichier de base" icon="upload" variant="secondary" onPress={importFile} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cocktail/[id]" />
        <Stack.Screen name="editor" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="preparer" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="soiree" />
        <Stack.Screen name="archives" />
        <Stack.Screen name="carafe" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ToastProvider>
          <DialogProvider>
            <Gate />
          </DialogProvider>
        </ToastProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
});
