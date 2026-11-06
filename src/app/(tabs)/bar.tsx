import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PageHeader, SettingsButton } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Divider, Empty, Screen, Segmented, T } from '@/components/ui';
import { fonts, radius, space } from '@/constants/theme';
import { availability, BASICS, bestPurchases, normalize } from '@/lib/cocktails';
import { confirm } from '@/lib/dialogs';
import { shareText } from '@/lib/share';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { CategoryId, Ingredient } from '@/types/cocktail';

const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: 'spiritueux', label: 'Spiritueux', emoji: '🥃' },
  { id: 'aperitif_vermouth', label: 'Apéritifs, vermouths & amers', emoji: '🍷' },
  { id: 'liqueur', label: 'Liqueurs & crèmes', emoji: '🍸' },
  { id: 'vin_bulles', label: 'Vins, bulles & bière', emoji: '🍾' },
  { id: 'jus', label: 'Jus & purées', emoji: '🍋' },
  { id: 'soft_bulle', label: 'Sodas & allongeurs', emoji: '🥤' },
  { id: 'sirop', label: 'Sirops & sucres', emoji: '🍯' },
  { id: 'bitter_arome', label: 'Bitters & condiments', emoji: '🧪' },
  { id: 'frais_garniture', label: 'Frais & épicerie', emoji: '🌿' },
];

type Tab = 'bar' | 'achats' | 'courses';
const TABS: Tab[] = ['bar', 'achats', 'courses'];

export default function BarScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { cocktails, ingredients, ingredientById } = useCatalog();
  const user = useUser();
  const { stock, shopping, data } = user;
  const [tab, setTab] = useState<Tab>('bar');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Set<CategoryId>>(new Set());

  // Les liens (« Rien de complet » sur l'accueil…) peuvent ouvrir directement un onglet.
  const [appliedTab, setAppliedTab] = useState<string | undefined>();
  if (params.tab !== appliedTab) {
    setAppliedTab(params.tab);
    if (params.tab && TABS.includes(params.tab as Tab)) setTab(params.tab as Tab);
  }
  useEffect(() => {
    if (params.tab) router.setParams({ tab: undefined });
  }, [params.tab]);

  // Nombre de recettes qui utilisent chaque ingrédient : sert à trier et à masquer l'inutile.
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cocktail of cocktails) for (const item of cocktail.ingredients) counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
    return counts;
  }, [cocktails]);

  const readyCount = useMemo(() => cocktails.filter((cocktail) => availability(cocktail, stock, data.settings.assumeBasics).ready).length, [cocktails, data.settings.assumeBasics, stock]);
  const purchases = useMemo(() => bestPurchases(cocktails, stock, data.settings.assumeBasics).slice(0, 10), [cocktails, data.settings.assumeBasics, stock]);

  const searching = !!query.trim();
  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return CATEGORIES.map((category) => ({
      ...category,
      items: ingredients
        .filter((item) => item.category === category.id && (usage.get(item.id) ?? 0) > 0)
        .filter((item) => !q || normalize(item.name).includes(q))
        .sort((a, b) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0) || a.name.localeCompare(b.name, 'fr')),
    })).filter((group) => group.items.length);
  }, [ingredients, query, usage]);

  const owned = [...stock].map((id) => ingredientById.get(id)).filter((item): item is Ingredient => !!item).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const shoppingItems = [...shopping].map((id) => ingredientById.get(id)).filter((item): item is Ingredient => !!item);
  const allOpen = groups.every((group) => open.has(group.id));

  const toggleSection = (id: CategoryId) => setOpen((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const copyList = async () => {
    const text = `Courses cocktails :\n${shoppingItems.map((item) => `• ${item.name}`).join('\n')}`;
    const result = await shareText(text, 'Courses cocktails');
    if (result === 'copied') toast('Liste copiée');
    if (result === 'unavailable') toast('Copie indisponible ici (connexion non sécurisée)');
  };

  return (
    <Screen>
      <PageHeader
        title="Mon bar"
        right={<SettingsButton />}
        subtitle={`${stock.size} ingrédient${stock.size > 1 ? 's' : ''} · ${readyCount} cocktail${readyCount > 1 ? 's' : ''} faisable${readyCount > 1 ? 's' : ''}`}
      />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[{ value: 'bar', label: 'Mon bar' }, { value: 'achats', label: 'Idées d’achat' }, { value: 'courses', label: 'Courses', count: shoppingItems.length }]}
      />

      {tab === 'bar' ? (
        <View style={styles.tabBody}>
          <Card style={{ gap: space.sm }}>
            <View style={styles.rowCenter}>
              <T variant="h3" style={{ flex: 1 }}>Ce que j’ai</T>
              {stock.size ? (
                <Pressable hitSlop={6} onPress={async () => { if (await confirm('Vider le bar ?', 'Tous les ingrédients seront décochés.', 'Vider')) user.setStockMany([...stock], false); }}>
                  <T variant="small" tone="muted" style={{ fontWeight: '600' }}>Tout retirer</T>
                </Pressable>
              ) : null}
            </View>
            {owned.length ? (
              <View style={styles.wrap}>
                {owned.map((item) => <IngredientChip key={item.id} item={item} selected onPress={() => user.toggleStock(item.id)} />)}
              </View>
            ) : (
              <T variant="small" tone="muted">Votre bar est vide. Ouvrez une catégorie ci-dessous et touchez ce que vous avez.</T>
            )}
          </Card>

          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Ajouter un ingrédient…"
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.ink }]}
              autoCorrect={false}
            />
            {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Icon name="x" size={18} color={colors.muted} /></Pressable> : null}
          </View>

          <View>
            {!searching ? (
              <Pressable hitSlop={6} style={styles.expandAll} onPress={() => setOpen(allOpen ? new Set() : new Set(groups.map((group) => group.id)))}>
                <T variant="small" tone="accent" style={{ fontWeight: '700' }}>{allOpen ? 'Tout replier' : 'Tout déplier'}</T>
              </Pressable>
            ) : null}
            <Card style={{ paddingVertical: 0 }}>
              {groups.map((group, index) => {
                const count = group.items.filter((item) => stock.has(item.id)).length;
                const expanded = searching || open.has(group.id);
                return (
                  <View key={group.id}>
                    {index ? <Divider /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() => toggleSection(group.id)}
                      style={({ pressed }) => [styles.sectionHeader, { opacity: pressed ? 0.6 : 1 }]}>
                      <T style={{ fontSize: 20 }}>{group.emoji}</T>
                      <T variant="body" style={{ flex: 1, fontWeight: '600' }} numberOfLines={1}>{group.label}</T>
                      {count ? (
                        <View style={[styles.countBadge, { backgroundColor: colors.okSoft }]}><T variant="tiny" tone="ok" style={{ fontWeight: '800' }}>{count}</T></View>
                      ) : null}
                      <T variant="tiny" tone="muted">{group.items.length}</T>
                      <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
                        <Icon name="chevronDown" size={18} color={colors.muted} />
                      </View>
                    </Pressable>
                    {expanded ? (
                      <View style={[styles.wrap, styles.sectionBody]}>
                        {group.items.map((item) => {
                          const basic = data.settings.assumeBasics && BASICS.has(item.id);
                          return (
                            <IngredientChip
                              key={item.id}
                              item={item}
                              selected={stock.has(item.id) || basic}
                              onPress={() => (basic ? toast(`${item.name} : toujours disponible (réglage « basiques »)`) : user.toggleStock(item.id))}
                            />
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </Card>
            {!groups.length ? <Empty icon="search" title="Aucun ingrédient trouvé" /> : null}
          </View>

          {data.settings.assumeBasics ? (
            <T variant="tiny" tone="muted">Eau, eau gazeuse, sucre, sel et poivre comptent toujours comme disponibles (modifiable dans les réglages).</T>
          ) : null}
        </View>
      ) : null}

      {tab === 'achats' ? (
        <View style={styles.tabBody}>
          <T variant="small" tone="muted">
            {stock.size ? 'Les bouteilles qui complètent le plus de recettes avec ce que vous avez déjà.' : 'Les ingrédients les plus utiles pour commencer un bar.'}
          </T>
          {purchases.length ? (
            <Card style={{ paddingVertical: space.xs }}>
              {purchases.map(({ id, unlocked, uses }, index) => {
                const item = ingredientById.get(id);
                const detail = unlocked.length
                  ? `+${unlocked.length} recette${unlocked.length > 1 ? 's' : ''} : ${unlocked.slice(0, 3).map((cocktail) => cocktail.name).join(', ')}${unlocked.length > 3 ? '…' : ''}`
                  : `Rapproche de ${uses} recette${uses > 1 ? 's' : ''}`;
                return (
                  <View key={id}>
                    {index ? <Divider /> : null}
                    <View style={[styles.rowCenter, { paddingVertical: space.sm }]}>
                      <T style={{ fontSize: 22 }}>{item?.emoji ?? '•'}</T>
                      <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/recettes', params: { ingredient: id } })}>
                        <T variant="h3" numberOfLines={1}>{item?.name ?? id}</T>
                        <T variant="small" tone="muted" numberOfLines={2}>{detail}</T>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Ajouter à la liste de courses"
                        hitSlop={6}
                        onPress={() => { user.addShopping([id]); toast(`${item?.name ?? id} ajouté aux courses`); }}
                        style={[styles.smallAction, { borderColor: colors.line, backgroundColor: shopping.has(id) ? colors.accentSoft : colors.surface }]}>
                        <Icon name="cart" size={17} color={shopping.has(id) ? colors.accent : colors.ink} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Je l'ai déjà"
                        hitSlop={6}
                        onPress={() => { user.toggleStock(id); toast(`${item?.name ?? id} ajouté à votre bar`); }}
                        style={[styles.smallAction, { borderColor: colors.line, backgroundColor: colors.surface }]}>
                        <Icon name="plus" size={17} color={colors.ink} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Card>
          ) : (
            <Empty icon="sparkles" title="Rien à suggérer" text="Votre bar couvre déjà toutes les recettes à un ingrédient près." />
          )}
          <T variant="tiny" tone="muted">Panier : ajouter à la liste de courses · + : je l’ai déjà.</T>
        </View>
      ) : null}

      {tab === 'courses' ? (
        <View style={styles.tabBody}>
          {shoppingItems.length ? (
            <>
              <Card style={{ paddingVertical: space.xs }}>
                {shoppingItems.map((item, index) => (
                  <View key={item.id}>
                    {index ? <Divider /> : null}
                    <View style={[styles.rowCenter, { paddingVertical: space.sm }]}>
                      <T style={{ fontSize: 20 }}>{item.emoji}</T>
                      <T variant="body" style={{ flex: 1 }}>{item.name}</T>
                      <Button label="Acheté" size="sm" variant="secondary" icon="check" onPress={() => { user.setStockMany([item.id], true); toast(`${item.name} ajouté à votre bar`); }} />
                      <Pressable accessibilityLabel="Retirer" hitSlop={8} onPress={() => user.toggleShopping(item.id)}>
                        <Icon name="x" size={18} color={colors.muted} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </Card>
              <View style={styles.rowCenter}>
                <Button label="Copier la liste" icon="list" variant="secondary" flex onPress={copyList} />
                <Button label="Tout vider" icon="trash" variant="danger" onPress={async () => { if (await confirm('Vider la liste ?', 'La liste de courses sera effacée.', 'Vider')) user.clearShopping(); }} />
              </View>
            </>
          ) : (
            <Empty icon="cart" title="Liste de courses vide" text="Ajoutez les ingrédients manquants depuis une recette, ou depuis « Idées d’achat »." />
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function IngredientChip({ item, selected, onPress }: { item: Ingredient; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ingredient,
        { borderColor: selected ? colors.ok : colors.line, backgroundColor: selected ? colors.okSoft : colors.surface, opacity: pressed ? 0.7 : 1 },
      ]}>
      <T style={{ fontSize: 16 }}>{item.emoji}</T>
      <T variant="small" style={{ fontWeight: selected ? '700' : '500', color: selected ? colors.ok : colors.ink }} numberOfLines={1}>{item.name}</T>
      {selected ? <Icon name="check" size={14} color={colors.ok} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBody: { gap: space.md, marginTop: space.md },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  smallAction: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, minHeight: 46 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 10, outlineStyle: 'none' } as object,
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 38, maxWidth: '100%' },
  expandAll: { alignSelf: 'flex-end', marginBottom: space.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 54 },
  sectionBody: { paddingBottom: space.md },
  countBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
