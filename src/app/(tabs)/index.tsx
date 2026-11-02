import { ImageBackground } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExpertPanel } from '@/components/expert-panel';
import { SettingsButton } from '@/components/settings-button';
import { fonts, palette, radius } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

export default function HomeScreen() {
  const { favorites, toggleFavorite, cocktails } = useAppState();
  const featured = cocktails.find((cocktail) => cocktail.featured) ?? cocktails[0];
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.brandRow}><Text style={styles.brand}>Arturo et Clémentine</Text><SettingsButton /></View>
    <Text style={styles.kicker}>LE COCKTAIL DE LA SEMAINE</Text>
    <ImageBackground source={featured.image} style={styles.hero} imageStyle={styles.heroImage} contentFit="cover" contentPosition="bottom center">
      <View style={styles.heroShade}>
        <Pressable onPress={() => toggleFavorite(featured.slug)} style={styles.favorite}><Text style={styles.favoriteText}>{favorites.has(featured.slug) ? '♥' : '♡'}</Text></Pressable>
        <View style={styles.heroCopy}><View style={styles.pill}><Text style={styles.pillText}>Sélection de Clément</Text></View><Text style={styles.heroTitle}>{featured.name}</Text><Text style={styles.heroSubtitle}>{featured.subtitle}</Text><Link href={{ pathname: '/cocktail/[slug]', params: { slug: featured.slug } }} asChild><Pressable style={styles.heroButton}><Text style={styles.heroButtonText}>Voir la recette  →</Text></Pressable></Link></View>
      </View>
    </ImageBackground>
    <View style={styles.expertWrap}><ExpertPanel /></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: palette.cream }, content: { gap: 11, paddingBottom: 32 }, brandRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 }, brand: { color: palette.ink, fontFamily: fonts.display, fontSize: 21, fontStyle: 'italic', fontWeight: '600' }, kicker: { color: palette.muted, fontFamily: fonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 2, paddingHorizontal: 20 },
  hero: { aspectRatio: 1.18, marginHorizontal: 14 }, heroImage: { borderRadius: radius.lg }, heroShade: { backgroundColor: 'rgba(25,7,8,0.20)', borderRadius: radius.lg, flex: 1, justifyContent: 'space-between', padding: 16 }, favorite: { alignItems: 'center', alignSelf: 'flex-end', backgroundColor: 'rgba(255,249,240,0.9)', borderRadius: 19, height: 38, justifyContent: 'center', width: 38 }, favoriteText: { color: palette.wine, fontSize: 21 }, heroCopy: { gap: 6 }, pill: { alignSelf: 'flex-start', backgroundColor: palette.gold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }, pillText: { color: palette.wineDark, fontFamily: fonts.body, fontSize: 9, fontWeight: '700' }, heroTitle: { color: palette.white, fontFamily: fonts.display, fontSize: 36, fontWeight: '600' }, heroSubtitle: { color: '#F8EDE0', fontFamily: fonts.body, fontSize: 12, lineHeight: 16, maxWidth: 280 }, heroButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: palette.paper, borderRadius: radius.pill, marginTop: 3, paddingHorizontal: 16, paddingVertical: 9 }, heroButtonText: { color: palette.wineDark, fontFamily: fonts.body, fontSize: 11, fontWeight: '700' }, expertWrap: { marginHorizontal: 14, marginTop: 8 },
});
