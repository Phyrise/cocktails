import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CocktailGridItem, CocktailRow } from '@/components/cocktail-card';
import { Icon } from '@/components/icon';
import { Chip, Divider, Empty, IconButton, T } from '@/components/ui';
import { fonts, MAX_WIDTH, radius, space } from '@/constants/theme';
import { availability, type Availability, computeMetrics, containsAvoided, isAlcoholFree, matchesQuery, tasteProfile, tasteScore } from '@/lib/cocktails';
import { BASES, FAMILIES, FLAVORS, METHODS, MOODS, SORTS, type SortKey } from '@/lib/filters';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

type Quick = 'ready' | 'one' | 'nojo' | 'fav';
const QUICK: { id: Quick; label: string }[] = [
  { id: 'ready', label: 'Faisable' },
  { id: 'one', label: 'Manque 1' },
  { id: 'nojo', label: 'Sans alcool' },
  { id: 'fav', label: 'Favoris' },
];

const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

export default function CocktailsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; filter?: string; mood?: string; family?: string; ingredient?: string }>();
  const { cocktails, ingredientById, searchIndex } = useCatalog();
  const { stock, favorites, data, updateSettings } = useUser();
  const layout = data.settings.layout ?? 'list';

  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState<Quick[]>([]);
  const [mood, setMood] = useState<string | null>(null);
  const [families, setFamilies] = useState<string[]>([]);
  const [bases, setBases] = useState<string[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [ingredient, setIngredient] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('dispo');
  const [panel, setPanel] = useState(false);

  // Les liens de l'accueil (« Que puis-je faire ? », humeurs…) pré-remplissent les filtres.
  const incoming = [params.filter, params.mood, params.family, params.ingredient, params.q];
  const incomingKey = incoming.join('|');
  const [appliedKey, setAppliedKey] = useState('');
  if (incomingKey !== appliedKey) {
    setAppliedKey(incomingKey);
    if (incoming.some(Boolean)) {
      setQuick(params.filter && QUICK.some((item) => item.id === params.filter) ? [params.filter as Quick] : []);
      setMood(params.mood ?? null);
      setFamilies(params.family ? [params.family] : []);
      setIngredient(params.ingredient ?? null);
      setQuery(params.q ?? '');
      setPanel(false);
    }
  }
  useEffect(() => {
    if (incomingKey.replace(/\|/g, '')) router.setParams({ filter: undefined, mood: undefined, family: undefined, ingredient: undefined, q: undefined });
  }, [incomingKey]);

  const [showAvoided, setShowAvoided] = useState(false);
  const profile = tasteProfile(cocktails, { favorites, ratings: data.ratings, likedFlavors: data.likedFlavors, avoid: data.avoid });
  const hiddenCount = showAvoided || query.trim() ? 0 : cocktails.filter((cocktail) => containsAvoided(cocktail, profile.avoid)).length;
  const results = (() => {
    const moodDef = MOODS.find((item) => item.id === mood);
    const rows: { cocktail: Cocktail; value: Availability; relevance: number }[] = [];
    for (const cocktail of cocktails) {
      const relevance = query.trim() ? matchesQuery(cocktail, searchIndex.get(cocktail.id) ?? '', query) : 1;
      if (!relevance) continue;
      if (hiddenCount && containsAvoided(cocktail, profile.avoid)) continue;
      const value = availability(cocktail, stock, data.settings.assumeBasics);
      if (quick.includes('ready') && !value.ready) continue;
      if (quick.includes('one') && value.missing.length !== 1) continue;
      if (quick.includes('nojo') && !isAlcoholFree(cocktail, ingredientById)) continue;
      if (quick.includes('fav') && !favorites.has(cocktail.id)) continue;
      if (moodDef && !moodDef.test(cocktail, ingredientById)) continue;
      if (families.length && !families.includes(cocktail.family)) continue;
      if (methods.length && !methods.includes(cocktail.method)) continue;
      if (flavors.length && !flavors.every((flavor) => cocktail.flavors.includes(flavor))) continue;
      if (bases.length && !bases.some((base) => cocktail.ingredients.some((item) => BASES.find((b) => b.id === base)?.match(item.id)))) continue;
      if (ingredient && !cocktail.ingredients.some((item) => item.id === ingredient)) continue;
      rows.push({ cocktail, value, relevance });
    }
    const byName = (a: (typeof rows)[number], b: (typeof rows)[number]) => a.cocktail.name.localeCompare(b.cocktail.name, 'fr');
    if (query.trim()) return rows.sort((a, b) => b.relevance - a.relevance || byName(a, b)).map((row) => row.cocktail);
    if (sort === 'dispo') rows.sort((a, b) => a.value.missing.length - b.value.missing.length || byName(a, b));
    else if (sort === 'note') rows.sort((a, b) => (data.ratings[b.cocktail.id] ?? 0) - (data.ratings[a.cocktail.id] ?? 0) || byName(a, b));
    else if (sort === 'force') {
      const abv = new Map(rows.map((row) => [row.cocktail.id, computeMetrics(row.cocktail, ingredientById).abv]));
      rows.sort((a, b) => (abv.get(b.cocktail.id) ?? 0) - (abv.get(a.cocktail.id) ?? 0));
    } else if (sort === 'gouts') {
      const taste = new Map(rows.map((row) => [row.cocktail.id, tasteScore(row.cocktail, profile)]));
      rows.sort((a, b) => (taste.get(b.cocktail.id) ?? 0) - (taste.get(a.cocktail.id) ?? 0) || byName(a, b));
    } else rows.sort(byName);
    return rows.map((row) => row.cocktail);
  })();

  const advancedCount = families.length + bases.length + flavors.length + methods.length + (mood ? 1 : 0) + (ingredient ? 1 : 0);
  // En grille, la dernière rangée est complétée par des cases vides pour garder trois colonnes égales.
  const gridData: (Cocktail | null)[] = [...results, ...Array.from({ length: (3 - (results.length % 3)) % 3 }, () => null)];

  const resetAll = () => {
    setQuery(''); setQuick([]); setMood(null); setFamilies([]); setBases([]); setFlavors([]); setMethods([]); setIngredient(null);
  };
  const moodLabel = MOODS.find((item) => item.id === mood)?.label;

  const header = (
    <View style={styles.headerInner}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <T variant="h1">Cocktails</T>
          <T variant="small" tone="muted">{results.length === cocktails.length ? `${cocktails.length} recettes` : `${results.length} sur ${cocktails.length}`}</T>
        </View>
        <View style={[styles.layoutSwitch, { backgroundColor: colors.surfaceAlt }]}>
          {(['list', 'grid'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={value === 'list' ? 'Affichage en liste' : 'Affichage en grille'}
              accessibilityState={{ selected: layout === value }}
              onPress={() => updateSettings({ layout: value })}
              style={[styles.layoutButton, layout === value && { backgroundColor: colors.surface }]}>
              <Icon name={value} size={18} color={layout === value ? colors.ink : colors.muted} />
            </Pressable>
          ))}
        </View>
      </View>
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Icon name="search" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nom, ingrédient, saveur…"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.ink }]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query ? <Pressable hitSlop={8} onPress={() => setQuery('')} accessibilityLabel="Effacer"><Icon name="x" size={18} color={colors.muted} /></Pressable> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={styles.quickRow} keyboardShouldPersistTaps="handled">
        <Chip label={advancedCount ? `Filtres · ${advancedCount}` : 'Filtres'} icon="sliders" selected={panel || advancedCount > 0} onPress={() => setPanel(!panel)} />
        {QUICK.map((item) => <Chip key={item.id} label={item.label} selected={quick.includes(item.id)} onPress={() => setQuick(toggleIn(quick, item.id))} />)}
      </ScrollView>
      {hiddenCount || showAvoided ? (
        <Pressable onPress={() => setShowAvoided(!showAvoided)} hitSlop={6}>
          <T variant="small" tone="muted">
            {showAvoided ? 'Les recettes avec vos ingrédients évités sont affichées. ' : `${hiddenCount} recette${hiddenCount > 1 ? 's' : ''} masquée${hiddenCount > 1 ? 's' : ''} (ingrédients évités). `}
            <T variant="small" tone="accent" style={{ fontWeight: '700' }}>{showAvoided ? 'Les masquer' : 'Afficher'}</T>
          </T>
        </Pressable>
      ) : null}
      {(moodLabel || ingredient) && !panel ? (
        <View style={styles.chips}>
          {moodLabel ? <Chip label={`Envie : ${moodLabel}`} icon="x" selected onPress={() => setMood(null)} /> : null}
          {ingredient ? <Chip label={`Avec : ${ingredientById.get(ingredient)?.name ?? ingredient}`} icon="x" selected onPress={() => setIngredient(null)} /> : null}
        </View>
      ) : null}
      {panel ? (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <FilterGroup title="Trier par">
            {SORTS.map((item) => <Chip key={item.id} label={item.label} selected={sort === item.id} onPress={() => setSort(item.id)} />)}
          </FilterGroup>
          <FilterGroup title="Envie">
            {MOODS.map((item) => <Chip key={item.id} label={item.label} selected={mood === item.id} onPress={() => setMood(mood === item.id ? null : item.id)} />)}
          </FilterGroup>
          <FilterGroup title="Alcool de base">
            {BASES.map((item) => <Chip key={item.id} label={item.label} selected={bases.includes(item.id)} onPress={() => setBases(toggleIn(bases, item.id))} />)}
          </FilterGroup>
          <FilterGroup title="Famille">
            {FAMILIES.map((item) => <Chip key={item} label={item} selected={families.includes(item)} onPress={() => setFamilies(toggleIn(families, item))} />)}
          </FilterGroup>
          <FilterGroup title="Saveurs">
            {FLAVORS.map((item) => <Chip key={item} label={item} selected={flavors.includes(item)} onPress={() => setFlavors(toggleIn(flavors, item))} />)}
          </FilterGroup>
          <FilterGroup title="Préparation">
            {METHODS.map((item) => <Chip key={item} label={item} selected={methods.includes(item)} onPress={() => setMethods(toggleIn(methods, item))} />)}
          </FilterGroup>
          {ingredient ? (
            <FilterGroup title="Ingrédient">
              <Chip label={ingredientById.get(ingredient)?.name ?? ingredient} icon="x" selected onPress={() => setIngredient(null)} />
            </FilterGroup>
          ) : null}
          <View style={styles.panelActions}>
            <Pressable onPress={resetAll} hitSlop={8}><T variant="small" tone="accent" style={{ fontWeight: '700' }}>Tout effacer</T></Pressable>
            <Pressable onPress={() => setPanel(false)} style={[styles.panelDone, { backgroundColor: colors.ink }]}>
              <T variant="small" style={{ color: colors.bg, fontWeight: '700' }}>Voir {results.length} résultat{results.length > 1 ? 's' : ''}</T>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <FlatList<Cocktail | null>
        key={layout}
        data={layout === 'grid' ? gridData : results}
        numColumns={layout === 'grid' ? 3 : 1}
        keyExtractor={(item, index) => item?.id ?? `vide-${index}`}
        columnWrapperStyle={layout === 'grid' ? styles.gridRow : undefined}
        renderItem={({ item }) => layout === 'grid'
          ? <View style={styles.gridCell}>{item ? <CocktailGridItem cocktail={item} /> : null}</View>
          : item ? <View style={styles.item}><CocktailRow cocktail={item} /></View> : null}
        ItemSeparatorComponent={layout === 'grid' ? undefined : () => <View style={styles.item}><Divider style={{ marginLeft: 84 }} /></View>}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Empty
            icon="search"
            title="Aucun cocktail ne correspond"
            text={quick.includes('ready') && !stock.size ? 'Votre bar est vide : indiquez d’abord vos bouteilles.' : 'Essayez d’enlever un filtre ou de changer la recherche.'}
            action={quick.includes('ready') && !stock.size ? 'Remplir mon bar' : 'Effacer les filtres'}
            onAction={quick.includes('ready') && !stock.size ? () => router.push('/bar') : resetAll}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: space.xxl + insets.bottom }}
        initialNumToRender={14}
        windowSize={11}
      />
      <View pointerEvents="box-none" style={[styles.fab, { bottom: space.md }]}>
        <IconButton name="plus" label="Créer une recette" onPress={() => router.push('/editor')} size={52} style={{ backgroundColor: colors.accent, borderColor: colors.accent }} tone={colors.accentInk} />
      </View>
    </View>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.xs }}>
      <T variant="label" tone="muted">{title}</T>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerInner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.sm, gap: space.sm },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, minHeight: 48 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 10, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  quickScroll: { marginHorizontal: -space.md, flexGrow: 0 },
  quickRow: { gap: space.xs, paddingHorizontal: space.md },
  panel: { borderWidth: 1, borderRadius: radius.lg, padding: space.md, gap: space.md },
  panelActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelDone: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 10 },
  item: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  layoutSwitch: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  layoutButton: { width: 38, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  gridRow: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.md, gap: 10, marginBottom: space.md },
  gridCell: { flex: 1, minWidth: 0 },
  fab: { position: 'absolute', right: space.md },
});
