import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CocktailCard } from '@/components/cocktail-card';
import { SettingsButton } from '@/components/settings-button';
import { availability } from '@/data/cocktails';
import { fonts, palette, radius } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

export default function LibraryScreen() {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ingredientId, setIngredientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { stock, cocktails, pantryItems } = useAppState();
  const selectedFilters = useMemo(() => filter === 'ready' ? [...new Set([...activeFilters, 'Réalisables'])] : activeFilters, [activeFilters, filter]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('fr');
    if (normalized.length < 2 || ingredientId) return [];
    const idsInRecipes = new Set(cocktails.flatMap((cocktail) => cocktail.ingredients.map((item) => item.ingredientId)));
    return pantryItems.filter((item) => idsInRecipes.has(item.id) && item.name.toLocaleLowerCase('fr').startsWith(normalized)).slice(0, 4);
  }, [cocktails, ingredientId, pantryItems, query]);

  const filtered = useMemo(() => cocktails.filter((cocktail) => {
    const normalized = query.trim().toLocaleLowerCase('fr');
    const searchable = `${cocktail.name} ${cocktail.flavors.join(' ')} ${cocktail.method} ${cocktail.type} ${cocktail.ingredients.map((item) => item.name).join(' ')}`.toLocaleLowerCase('fr');
    const matchesQuery = ingredientId ? cocktail.ingredients.some((item) => item.ingredientId === ingredientId) : !normalized || searchable.includes(normalized);
    const matchesFilter = selectedFilters.every((selectedFilter) =>
      (selectedFilter === 'Réalisables' && availability(cocktail, stock).percentage === 100)
      || (selectedFilter === 'Sour' && cocktail.type === 'Sour')
      || (selectedFilter === 'Amer' && cocktail.flavors.includes('Amer'))
      || (selectedFilter === 'Au verre' && cocktail.method === 'Au verre')
      || (selectedFilter === 'Shaker' && cocktail.method === 'Shaker'));
    return matchesQuery && matchesFilter;
  }), [cocktails, ingredientId, query, selectedFilters, stock]);

  const selectIngredient = (id: string, name: string) => {
    setIngredientId(id);
    setQuery(name);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setIngredientId(null);
  };

  const toggleFilter = (nextFilter: string) => {
    router.setParams({ filter: '' });
    setActiveFilters((current) => current.includes(nextFilter) ? current.filter((item) => item !== nextFilter) : [...current, nextFilter]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.titleRow}><Text style={styles.title}>LA BIBLIOTHÈQUE</Text><SettingsButton /></View>
      <Text style={styles.subtitle}>Des recettes choisies, testées et racontées par Arturo et Clément.</Text>
      <View style={styles.searchWrap}>
        <TextInput value={query} onChangeText={updateQuery} placeholder="Un alcool, une saveur, un cocktail…" placeholderTextColor={palette.muted} style={styles.search} autoCorrect spellCheck autoCapitalize="sentences" />
        {query ? <Pressable accessibilityLabel="Effacer la recherche" onPress={() => updateQuery('')} style={styles.clear}><Text style={styles.clearText}>×</Text></Pressable> : null}
      </View>
      {suggestions.length ? <View style={styles.suggestions}>
        <Text style={styles.suggestionLabel}>INGRÉDIENTS RECONNUS</Text>
        {suggestions.map((item) => <Pressable key={item.id} onPress={() => selectIngredient(item.id, item.name)} style={styles.suggestion}>
          <Text style={styles.suggestionEmoji}>{item.emoji}</Text><Text style={styles.suggestionName}>{item.name}</Text><Text style={styles.suggestionAction}>Choisir  ›</Text>
        </Pressable>)}
      </View> : null}
      {ingredientId ? <View style={styles.selectedIngredient}><Text style={styles.selectedIngredientText}>✓ Ingrédient : {query}</Text></View> : null}
      <View style={styles.filterArea}><Pressable onPress={() => setFiltersOpen((open) => !open)} style={[styles.filterTrigger, selectedFilters.length > 0 && styles.filterTriggerActive]}><Text style={[styles.filterTriggerText, selectedFilters.length > 0 && styles.filterTextActive]}>☷  Filtres{selectedFilters.length ? ` (${selectedFilters.length})` : ''}</Text><Text style={[styles.chevron, selectedFilters.length > 0 && styles.filterTextActive]}>{filtersOpen ? '⌃' : '⌄'}</Text></Pressable>
        {filtersOpen ? <View style={styles.filterPanel}>{['Réalisables', 'Sour', 'Amer', 'Au verre', 'Shaker'].map((filterName) => { const active = selectedFilters.includes(filterName); return <Pressable key={filterName} onPress={() => toggleFilter(filterName)} style={[styles.filter, active && styles.filterActive]}><Text style={styles.checkbox}>{active ? '✓' : ''}</Text><Text style={[styles.filterText, active && styles.filterTextActive]}>{filterName}</Text></Pressable>; })}{selectedFilters.length ? <Pressable onPress={() => { router.setParams({ filter: '' }); setActiveFilters([]); }} style={styles.clearFilters}><Text style={styles.clearFiltersText}>Tout effacer</Text></Pressable> : null}</View> : null}
      </View>
      <View style={styles.countRow}>
        <Text style={styles.count}>{filtered.length} cocktail{filtered.length > 1 ? 's' : ''}</Text>
        <View style={styles.viewToggle}>
          <Pressable accessibilityLabel="Affichage en liste" onPress={() => setViewMode('list')} style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}><Text style={[styles.viewIcon, viewMode === 'list' && styles.viewIconActive]}>☷</Text></Pressable>
          <Pressable accessibilityLabel="Affichage en galerie" onPress={() => setViewMode('grid')} style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}><Text style={[styles.viewIcon, viewMode === 'grid' && styles.viewIconActive]}>▦</Text></Pressable>
        </View>
      </View>
      <View style={[styles.list, viewMode === 'grid' && styles.grid]}>{filtered.map((cocktail) => (
        <View key={cocktail.slug} style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
          <CocktailCard cocktail={cocktail} layout={viewMode} percentage={availability(cocktail, stock).percentage} />
        </View>
      ))}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: palette.cream }, content: { paddingBottom: 32, paddingTop: 58 },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }, title: { color: palette.wine, flex: 1, fontFamily: fonts.body, fontSize: 23, fontWeight: '800', letterSpacing: 2.2 }, subtitle: { color: palette.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 340, paddingHorizontal: 20 },
  searchWrap: { marginHorizontal: 20, marginTop: 18 }, search: { backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.md, borderWidth: 1, color: palette.ink, fontFamily: fonts.body, paddingHorizontal: 16, paddingRight: 45, paddingVertical: 14 }, clear: { alignItems: 'center', height: 44, justifyContent: 'center', position: 'absolute', right: 4, top: 2, width: 40 }, clearText: { color: palette.muted, fontSize: 24 },
  suggestions: { backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.md, borderWidth: 1, marginHorizontal: 20, marginTop: 7, overflow: 'hidden' }, suggestionLabel: { color: palette.muted, fontFamily: fonts.body, fontSize: 9, fontWeight: '800', letterSpacing: 1.4, paddingHorizontal: 14, paddingTop: 11 }, suggestion: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12 }, suggestionEmoji: { fontSize: 19, width: 30 }, suggestionName: { color: palette.ink, flex: 1, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' }, suggestionAction: { color: palette.wine, fontFamily: fonts.body, fontSize: 11, fontWeight: '700' },
  selectedIngredient: { alignSelf: 'flex-start', backgroundColor: '#DDE9DF', borderRadius: radius.pill, marginHorizontal: 20, marginTop: 9, paddingHorizontal: 12, paddingVertical: 7 }, selectedIngredientText: { color: palette.success, fontFamily: fonts.body, fontSize: 11, fontWeight: '700' },
  filterArea: { marginHorizontal: 20, marginTop: 12 }, filterTrigger: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 18, paddingHorizontal: 14, paddingVertical: 9 }, filterTriggerActive: { backgroundColor: palette.wine, borderColor: palette.wine }, filterTriggerText: { color: palette.wine, fontFamily: fonts.body, fontSize: 12, fontWeight: '800' }, chevron: { color: palette.wine, fontSize: 14 }, filterPanel: { backgroundColor: palette.paper, borderColor: palette.line, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 7, padding: 10 }, filter: { alignItems: 'center', borderColor: palette.line, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 7 }, filterActive: { backgroundColor: palette.wine, borderColor: palette.wine }, checkbox: { borderColor: palette.line, borderRadius: 4, borderWidth: 1, color: palette.white, fontSize: 9, height: 15, lineHeight: 13, textAlign: 'center', width: 15 }, filterText: { color: palette.muted, fontFamily: fonts.body, fontSize: 11 }, filterTextActive: { color: palette.white, fontWeight: '700' }, clearFilters: { justifyContent: 'center', paddingHorizontal: 8 }, clearFiltersText: { color: palette.wine, fontFamily: fonts.body, fontSize: 10, fontWeight: '700' },
  countRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 }, count: { color: palette.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  viewToggle: { backgroundColor: '#EADFD3', borderRadius: 9, flexDirection: 'row', padding: 2 }, viewButton: { alignItems: 'center', borderRadius: 7, height: 30, justifyContent: 'center', width: 34 }, viewButtonActive: { backgroundColor: palette.paper }, viewIcon: { color: palette.muted, fontSize: 17 }, viewIconActive: { color: palette.wine, fontWeight: '800' },
  list: { gap: 7, paddingHorizontal: 20 }, listItem: { width: '100%' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, gridItem: { width: '31.9%' },
});
