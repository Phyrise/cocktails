import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius } from '@/constants/theme';
import { useAppState } from '@/state/app-state';
import type { MeasurementUnit } from '@/types/cocktail';

export default function SettingsScreen() {
  const router = useRouter();
  const { measurementUnit, setMeasurementUnit, customCocktails, cocktails } = useAppState();
  const units: { id: MeasurementUnit; label: string; detail: string }[] = [
    { id: 'ml', label: 'Millilitres', detail: 'Format de référence des recettes de Clément' },
    { id: 'oz', label: 'Onces liquides', detail: 'Conversion automatique pour le service' },
  ];
  return <View style={styles.screen}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.eyebrow}>PRÉFÉRENCES</Text></View>
    <Text style={styles.title}>Réglages</Text>
    <Text style={styles.subtitle}>Choisissez l’unité utilisée sur toutes les fiches cocktail.</Text>
    <View style={styles.card}>
      {units.map((unit) => <Pressable key={unit.id} onPress={() => setMeasurementUnit(unit.id)} style={[styles.unit, measurementUnit === unit.id && styles.unitActive]}>
        <View style={styles.radio}>{measurementUnit === unit.id ? <View style={styles.radioDot} /> : null}</View>
        <View style={{ flex: 1 }}><Text style={styles.unitTitle}>{unit.label}</Text><Text style={styles.unitDetail}>{unit.detail}</Text></View>
        <Text style={styles.unitCode}>{unit.id}</Text>
      </Pressable>)}
    </View>
    <View style={styles.summary}><Text style={styles.summaryNumber}>{cocktails.length}</Text><Text style={styles.summaryText}>recettes dans la bibliothèque, dont {customCocktails.length} expérimentale{customCocktails.length > 1 ? 's' : ''}.</Text></View>
    <Text style={styles.note}>1 oz = 29,57 ml. Les traits, gouttes, pièces et garnitures ne sont pas convertis.</Text>
  </View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: palette.cream, flex: 1, padding: 20, paddingTop: 56 }, header: { alignItems: 'center', flexDirection: 'row', gap: 12 }, back: { alignItems: 'center', backgroundColor: palette.paper, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }, backText: { color: palette.wine, fontSize: 34, lineHeight: 36 }, eyebrow: { color: palette.wine, fontFamily: fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 2.2 }, title: { color: palette.ink, fontFamily: fonts.display, fontSize: 40, marginTop: 20 }, subtitle: { color: palette.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 6 },
  card: { backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.lg, borderWidth: 1, gap: 9, marginTop: 28, padding: 10 }, unit: { alignItems: 'center', borderRadius: radius.md, flexDirection: 'row', gap: 12, padding: 14 }, unitActive: { backgroundColor: '#F1E3DD' }, radio: { alignItems: 'center', borderColor: palette.wine, borderRadius: 11, borderWidth: 1.5, height: 22, justifyContent: 'center', width: 22 }, radioDot: { backgroundColor: palette.wine, borderRadius: 6, height: 12, width: 12 }, unitTitle: { color: palette.ink, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' }, unitDetail: { color: palette.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 3 }, unitCode: { color: palette.wine, fontFamily: fonts.display, fontSize: 21 },
  summary: { alignItems: 'center', backgroundColor: palette.wineDark, borderRadius: radius.md, flexDirection: 'row', gap: 14, marginTop: 24, padding: 18 }, summaryNumber: { color: palette.gold, fontFamily: fonts.display, fontSize: 36 }, summaryText: { color: palette.white, flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 18 }, note: { color: palette.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 18 },
});
