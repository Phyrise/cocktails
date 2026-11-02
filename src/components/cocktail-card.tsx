import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius } from '@/constants/theme';
import type { Cocktail } from '@/types/cocktail';

export function CocktailCard({ cocktail, percentage, layout = 'list' }: { cocktail: Cocktail; percentage?: number; layout?: 'grid' | 'list' }) {
  const router = useRouter();
  const isGrid = layout === 'grid';
  return (
      <Pressable onPress={() => router.push({ pathname: '/cocktail/[slug]', params: { slug: cocktail.slug } })} style={({ pressed }) => [styles.card, isGrid && styles.gridCard, pressed && styles.pressed]}>
        <View style={[styles.monogram, isGrid && styles.gridMonogram]}><Text style={styles.monogramText}>{cocktail.name.slice(0, 1)}</Text></View>
        <View style={[styles.copy, isGrid && styles.gridCopy]}>
          <Text numberOfLines={isGrid ? 2 : 1} style={[styles.name, isGrid && styles.gridName]}>{cocktail.name}</Text>
          <Text numberOfLines={1} style={[styles.meta, isGrid && styles.gridMeta]}>{cocktail.type} · {cocktail.method}</Text>
          {!isGrid ? <View style={styles.tags}>{cocktail.flavors.slice(0, 2).map((flavor) => <Text key={flavor} style={styles.tag}>{flavor}</Text>)}</View> : null}
        </View>
        {percentage !== undefined ? (
          <View style={[styles.score, isGrid && styles.gridScore, percentage === 100 && styles.scoreReady]}><Text numberOfLines={1} adjustsFontSizeToFit style={[styles.scoreText, isGrid && styles.gridScoreText, percentage === 100 && styles.scoreTextReady]}>{percentage}%</Text></View>
        ) : <Text style={styles.arrow}>›</Text>}
      </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: 14, padding: 12, width: '100%' },
  gridCard: { alignItems: 'flex-start', flexDirection: 'column', gap: 5, padding: 6, width: '100%' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  monogram: { alignItems: 'center', backgroundColor: palette.wineDark, borderRadius: 14, height: 64, justifyContent: 'center', width: 58 },
  gridMonogram: { borderRadius: 10, height: 62, width: '100%' },
  monogramText: { color: palette.gold, fontFamily: fonts.display, fontSize: 26 },
  copy: { flex: 1, gap: 3 }, gridCopy: { flex: 0, width: '100%' }, name: { color: palette.ink, fontFamily: fonts.display, fontSize: 19, fontWeight: '600' }, gridName: { fontSize: 13, lineHeight: 15 },
  meta: { color: palette.muted, fontFamily: fonts.body, fontSize: 12 }, gridMeta: { fontSize: 8 }, tags: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tag: { backgroundColor: '#F1E7D9', borderRadius: radius.pill, color: palette.wine, fontFamily: fonts.body, fontSize: 10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
  arrow: { color: palette.wine, fontSize: 30 }, score: { alignItems: 'center', backgroundColor: '#F0E4D4', borderRadius: radius.pill, height: 46, justifyContent: 'center', width: 46 },
  gridScore: { height: 29, position: 'absolute', right: 10, top: 10, width: 29 },
  scoreReady: { backgroundColor: '#DDE9DF' }, scoreText: { color: palette.wine, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' }, gridScoreText: { fontSize: 8, lineHeight: 10 }, scoreTextReady: { color: palette.success },
});
