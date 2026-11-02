import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Chip, Divider, Empty, Screen, Segmented, T } from '@/components/ui';
import { fonts, radius, space } from '@/constants/theme';
import { availability, BASICS, bestPurchases, normalize } from '@/lib/cocktails';
import { confirm } from '@/lib/dialogs';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { CategoryId } from '@/types/cocktail';

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'spiritueux', label: 'Spiritueux' },
  { id: 'aperitif_vermouth', label: 'Apéritifs, vermouths & amers' },
  { id: 'liqueur', label: 'Liqueurs & crèmes' },
  { id: 'vin_bulles', label: 'Vins, bulles & bière' },
  { id: 'jus', label: 'Jus & purées' },
  { id: 'soft_bulle', label: 'Sodas & allongeurs' },
  { id: 'sirop', label: 'Sirops & sucres' },
  { id: 'bitter_arome', label: 'Bitters & condiments' },
  { id: 'frais_garniture', label: 'Frais & épicerie' },
];

export default function BarScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { cocktails, ingredients, ingredientById } = useCatalog();
  const user = useUser();
  const { stock, shopping, data } = user;
  const [tab, setTab] = useState<'bar' | 'courses'>(params.tab === 'courses' ? 'courses' : 'bar');
  const [query, setQuery] = useState('');
  const [onlyOwned, setOnlyOwned] = useState(false);

  // Nombre de recettes qui utilisent chaque ingrédient : sert à trier et à masquer l'inutile.
  const usage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cocktail of cocktails) for (const item of cocktail.ingredients) counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
    return counts;
  }, [cocktails]);

  const readyCount = useMemo(() => cocktails.filter((cocktail) => availability(cocktail, stock, data.settings.assumeBasics).ready).length, [cocktails, data.settings.assumeBasics, stock]);
  const purchases = useMemo(() => bestPurchases(cocktails, stock, data.settings.assumeBasics).slice(0, 6), [cocktails, data.settings.assumeBasics, stock]);

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    return CATEGORIES.map((category) => ({
      ...category,
      items: ingredients
        .filter((item) => item.category === category.id && (usage.get(item.id) ?? 0) > 0)
        .filter((item) => !q || normalize(item.name).includes(q))
        .filter((item) => !onlyOwned || stock.has(item.id))
        .sort((a, b) => (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0) || a.name.localeCompare(b.name, 'fr')),
    })).filter((group) => group.items.length);
  }, [ingredients, onlyOwned, query, stock, usage]);

  const shoppingItems = [...shopping].map((id) => ingredientById.get(id)).filter((item) => !!item);

  const copyList = async () => {
    const text = `Courses cocktails :\n${shoppingItems.map((item) => `• ${item.name}`).join('\n')}`;
    try {
      const nav = globalThis.navigator as Navigator | undefined;
      if (Platform.OS === 'web' && nav?.share && matchMedia('(pointer: coarse)').matches) await nav.share({ text });
      else await nav?.clipboard?.writeText(text);
      toast('Liste copiée');
    } catch {
      // Partage annulé.
    }
  };

  return (
    <Screen>
      <PageHeader
        title="Mon bar"
        subtitle={`${stock.size} ingrédient${stock.size > 1 ? 's' : ''} · ${readyCount} cocktail${readyCount > 1 ? 's' : ''} faisable${readyCount > 1 ? 's' : ''}`}
      />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[{ value: 'bar', label: 'Mes ingrédients' }, { value: 'courses', label: 'Courses', count: shopping.size }]}
      />

      {tab === 'bar' ? (
        <View style={{ gap: space.lg, marginTop: space.md }}>
          {purchases.length ? (
            <Card style={{ gap: space.sm }}>
              <View style={styles.rowCenter}>
                <Icon name="sparkles" size={18} color={colors.gold} />
                <T variant="h3" style={{ flex: 1 }}>Le meilleur achat</T>
              </View>
              <T variant="small" tone="muted">Chaque bouteille ci-dessous complète d’un coup plusieurs recettes.</T>
              {purchases.map(({ id, cocktails: unlocked }, index) => {
                const item = ingredientById.get(id);
                return (
                  <View key={id}>
                    {index ? <Divider style={{ marginBottom: space.sm }} /> : null}
                    <View style={styles.rowCenter}>
                      <T style={{ fontSize: 22 }}>{item?.emoji ?? '•'}</T>
                      <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: '/cocktails', params: { ingredient: id } })}>
                        <T variant="h3" numberOfLines={1}>{item?.name ?? id}</T>
                        <T variant="small" tone="muted" numberOfLines={1}>+{unlocked.length} : {unlocked.slice(0, 3).map((cocktail) => cocktail.name).join(', ')}{unlocked.length > 3 ? '…' : ''}</T>
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
                        onPress={() => user.toggleStock(id)}
                        style={[styles.smallAction, { borderColor: colors.line, backgroundColor: colors.surface }]}>
                        <Icon name="plus" size={17} color={colors.ink} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Card>
          ) : null}

          <View style={{ gap: space.sm }}>
            <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
              <Icon name="search" size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Chercher un ingrédient"
                placeholderTextColor={colors.muted}
                style={[styles.searchInput, { color: colors.ink }]}
                autoCorrect={false}
              />
              {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Icon name="x" size={18} color={colors.muted} /></Pressable> : null}
            </View>
            <View style={styles.rowCenter}>
              <Chip label="Seulement ce que j’ai" selected={onlyOwned} onPress={() => setOnlyOwned(!onlyOwned)} />
              {stock.size ? (
                <Pressable
                  hitSlop={6}
                  style={{ marginLeft: 'auto' }}
                  onPress={async () => { if (await confirm('Vider le bar ?', 'Tous les ingrédients seront décochés.', 'Vider')) user.setStockMany([...stock], false); }}>
                  <T variant="small" tone="muted" style={{ fontWeight: '600' }}>Tout décocher</T>
                </Pressable>
              ) : null}
            </View>
            {data.settings.assumeBasics ? (
              <T variant="tiny" tone="muted">Sucre, sel, poivre et eau gazeuse sont considérés comme toujours disponibles (modifiable dans les réglages).</T>
            ) : null}
          </View>

          {groups.map((group) => {
            const owned = group.items.filter((item) => stock.has(item.id)).length;
            return (
              <View key={group.id} style={{ gap: space.sm }}>
                <View style={styles.rowCenter}>
                  <T variant="label" tone="muted" style={{ flex: 1 }}>{group.label}</T>
                  <T variant="tiny" tone="muted">{owned}/{group.items.length}</T>
                </View>
                <View style={styles.wrap}>
                  {group.items.map((item) => {
                    const selected = stock.has(item.id) || (data.settings.assumeBasics && BASICS.has(item.id));
                    return (
                      <Pressable
                        key={item.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        onPress={() => user.toggleStock(item.id)}
                        style={({ pressed }) => [
                          styles.ingredient,
                          { borderColor: selected ? colors.ok : colors.line, backgroundColor: selected ? colors.okSoft : colors.surface, opacity: pressed ? 0.7 : 1 },
                        ]}>
                        <T style={{ fontSize: 16 }}>{item.emoji}</T>
                        <T variant="small" style={{ fontWeight: selected ? '700' : '500', color: selected ? colors.ok : colors.ink }} numberOfLines={1}>{item.name}</T>
                        {selected ? <Icon name="check" size={14} color={colors.ok} strokeWidth={3} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
          {!groups.length ? <Empty icon="search" title="Aucun ingrédient trouvé" /> : null}
        </View>
      ) : (
        <View style={{ gap: space.md, marginTop: space.md }}>
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
            <Empty icon="cart" title="Liste de courses vide" text="Depuis une recette, ajoutez les ingrédients manquants en un geste." />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  smallAction: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, minHeight: 46 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 10, outlineStyle: 'none' } as object,
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 38, maxWidth: '100%' },
});
