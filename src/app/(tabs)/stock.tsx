import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { availability } from '@/data/cocktails';
import { fonts, palette, radius } from '@/constants/theme';
import { SettingsButton } from '@/components/settings-button';
import { categoryDefinitions } from '@/data/ingredient-profiles';
import { useAppState } from '@/state/app-state';
import type { CategoryId } from '@/types/cocktail';

export default function StockScreen() {
  const router = useRouter();
  const { stock, toggleStock, cocktails, pantryItems } = useAppState();
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryId>>(() => new Set(categoryDefinitions.map((category) => category.id)));
  const ready = cocktails.filter((cocktail) => availability(cocktail, stock).percentage === 100).length;
  const toggleCategory = (id: CategoryId) => setExpandedCategories((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}><View><Text style={styles.eyebrow}>INVENTAIRE PERSONNEL</Text><Text style={styles.title}>Mon bar</Text></View><SettingsButton /></View>
      <Text style={styles.subtitle}>{"Touchez simplement ce que vous avez. On s'occupe du reste."}</Text>
      <View style={styles.summary}>
        <View style={styles.summaryCell}><Text style={styles.summaryNumber}>{stock.size}</Text><Text style={styles.summaryLabel}>ingrédients</Text></View>
        <View style={styles.divider} />
          <Pressable accessibilityLabel="Voir les cocktails prêts" onPress={() => router.push({ pathname: '/(tabs)/bibliotheque', params: { filter: 'ready' } })} style={({ pressed }) => [styles.summaryCell, styles.summaryAction, pressed && styles.summaryPressed]}>
            <Text style={styles.summaryNumber}>{ready}</Text><Text style={styles.summaryLabel}>cocktails prêts</Text><Text style={styles.summaryHint}>Voir les recettes  ›</Text>
          </Pressable>
      </View>
      {categoryDefinitions.map((category) => (
        <View key={category.id} style={styles.category}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: expandedCategories.has(category.id) }} onPress={() => toggleCategory(category.id)} style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{category.emoji}  {category.label.toUpperCase()}</Text>
            <Text style={styles.categoryToggle}>{expandedCategories.has(category.id) ? '−' : '+'}</Text>
          </Pressable>
          {expandedCategories.has(category.id) ? <View style={styles.grid}>
            {pantryItems.filter((item) => item.category === category.id).map((item) => {
              const selected = stock.has(item.id);
              const recipeCount = cocktails.filter((cocktail) => cocktail.ingredients.some((ingredient) => ingredient.ingredientId === item.id)).length;
              return <Pressable key={item.id} onPress={() => toggleStock(item.id)} style={[styles.item, selected && styles.itemSelected]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text numberOfLines={2} style={[styles.itemText, selected && styles.itemTextSelected]}>{item.name}</Text>
                <Text style={styles.recipeCount}>{recipeCount} recette{recipeCount > 1 ? 's' : ''}</Text>
                <View style={[styles.check, selected && styles.checkSelected]}><Text style={[styles.checkText, selected && styles.checkTextSelected]}>{selected ? '✓' : '+'}</Text></View>
              </Pressable>;
            })}
          </View> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: palette.cream }, content: { paddingBottom: 38, paddingHorizontal: 20, paddingTop: 58 }, titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, eyebrow: { color: palette.wine, fontFamily: fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 2.5 },
  title: { color: palette.ink, fontFamily: fonts.display, fontSize: 38, fontWeight: '600' }, subtitle: { color: palette.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 5 },
  summary: { backgroundColor: palette.wineDark, borderRadius: radius.md, flexDirection: 'row', marginTop: 22, paddingVertical: 12 }, summaryCell: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 72 }, summaryAction: { borderRadius: radius.sm }, summaryPressed: { backgroundColor: 'rgba(255,255,255,0.08)' }, summaryNumber: { color: palette.gold, fontFamily: fonts.display, fontSize: 32, textAlign: 'center' }, summaryLabel: { color: palette.white, fontFamily: fonts.body, fontSize: 11 }, summaryHint: { color: '#D8C6BE', fontFamily: fonts.body, fontSize: 9, marginTop: 4 }, divider: { backgroundColor: '#8C5260', width: 1 },
  category: { marginTop: 18 }, categoryHeader: { alignItems: 'center', borderBottomColor: palette.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, minHeight: 36, paddingBottom: 7 }, categoryTitle: { color: palette.wine, flex: 1, fontFamily: fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, categoryToggle: { color: palette.wine, fontFamily: fonts.body, fontSize: 21, lineHeight: 22, textAlign: 'center', width: 28 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  item: { backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.md, borderWidth: 1, minHeight: 103, padding: 9, width: '31.8%' }, itemSelected: { backgroundColor: '#F4E9E3', borderColor: '#C99AA5' }, emoji: { fontSize: 21 }, itemText: { color: palette.ink, fontFamily: fonts.body, fontSize: 11, fontWeight: '700', lineHeight: 14, marginTop: 5, paddingRight: 10 }, itemTextSelected: { color: palette.wineDark }, recipeCount: { color: palette.muted, fontFamily: fonts.body, fontSize: 8, marginTop: 3 },
  check: { alignItems: 'center', borderColor: palette.line, borderRadius: 10, borderWidth: 1, height: 20, justifyContent: 'center', position: 'absolute', right: 6, top: 6, width: 20 }, checkSelected: { backgroundColor: palette.success, borderColor: palette.success }, checkText: { color: palette.muted, fontFamily: fonts.body, fontSize: 12 }, checkTextSelected: { color: palette.white, fontWeight: '800' },
});
