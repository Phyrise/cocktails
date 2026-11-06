import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { openCocktail } from '@/components/cocktail-card';
import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Divider, Empty, Screen, T } from '@/components/ui';
import { fonts, radius, space } from '@/constants/theme';
import { hasIngredient, matchesQuery, partyShopping } from '@/lib/cocktails';
import { confirm } from '@/lib/dialogs';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

/** Prépare une soirée : quelques cocktails, un nombre de verres, et la liste de tout ce qu'il faut acheter. */
export default function PartyScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const catalog = useCatalog();
  const user = useUser();
  const { data } = user;
  const [query, setQuery] = useState('');

  const entries = data.party
    .map((entry) => ({ cocktail: catalog.byId.get(entry.id), glasses: entry.glasses }))
    .filter((entry): entry is { cocktail: Cocktail; glasses: number } => !!entry.cocktail);
  const totalGlasses = entries.reduce((sum, entry) => sum + entry.glasses, 0);
  const lines = useMemo(() => partyShopping(entries, catalog.ingredientById), [catalog.ingredientById, entries]);
  const missing = lines.filter((line) => !hasIngredient(line.id, user.stock, data.settings.assumeBasics));

  const suggestions = query.trim()
    ? catalog.cocktails.filter((cocktail) => !data.party.some((entry) => entry.id === cocktail.id) && matchesQuery(cocktail, catalog.searchIndex.get(cocktail.id) ?? '', query)).slice(0, 6)
    : [];
  // Sans recherche : les favoris, pour composer vite.
  const quickPicks = catalog.cocktails.filter((cocktail) => user.favorites.has(cocktail.id) && !data.party.some((entry) => entry.id === cocktail.id)).slice(0, 8);

  return (
    <Screen>
      <PageHeader title="Soirée" subtitle="Choisissez les cocktails, l’app calcule les courses." back />

      <Card style={styles.guests}>
        <Icon name="users" size={22} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <T variant="h3">Invités</T>
          <T variant="tiny" tone="muted">Nombre de verres proposé pour chaque nouveau cocktail.</T>
        </View>
        <Stepper value={data.guests} onChange={user.setGuests} />
      </Card>

      <View style={styles.section}>
        <T variant="h2">Au menu</T>
        {entries.length ? (
          <Card style={{ paddingVertical: space.xs }}>
            {entries.map(({ cocktail, glasses }, index) => (
              <View key={cocktail.id}>
                {index ? <Divider /> : null}
                <View style={styles.menuRow}>
                  <Pressable onPress={() => openCocktail(cocktail.id)} style={styles.menuInfo}>
                    <CocktailImage cocktail={cocktail} style={styles.thumb} rounded={radius.sm} artScale={0.7} />
                    <T variant="h3" numberOfLines={2} style={{ flex: 1 }}>{cocktail.name}</T>
                  </Pressable>
                  <Stepper value={glasses} onChange={(value) => user.setPartyGlasses(cocktail.id, value)} suffix="verres" />
                  <Pressable accessibilityLabel={`Préparer ${cocktail.name} en carafe`} hitSlop={8} onPress={() => router.push({ pathname: '/carafe', params: { id: cocktail.id, glasses: String(glasses) } })}>
                    <Icon name="carafe" size={19} color={colors.accent} />
                  </Pressable>
                  <Pressable accessibilityLabel={`Retirer ${cocktail.name}`} hitSlop={8} onPress={() => user.removeFromParty(cocktail.id)}>
                    <Icon name="x" size={18} color={colors.muted} />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <T variant="small" tone="muted">Aucun cocktail pour l’instant : ajoutez-en ci-dessous, ou depuis une fiche (« Ajouter à ma soirée »).</T>
        )}

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Icon name="plus" size={18} color={colors.accent} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ajouter un cocktail…"
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.ink }]}
            autoCorrect={false}
          />
          {query ? <Pressable onPress={() => setQuery('')} hitSlop={8}><Icon name="x" size={18} color={colors.muted} /></Pressable> : null}
        </View>
        {(query.trim() ? suggestions : quickPicks).length ? (
          <View style={styles.picks}>
            {!query.trim() ? <T variant="label" tone="muted">Vos favoris</T> : null}
            {(query.trim() ? suggestions : quickPicks).map((cocktail) => (
              <Pressable
                key={cocktail.id}
                onPress={() => { user.addToParty(cocktail.id); setQuery(''); }}
                style={({ pressed }) => [styles.pick, { borderColor: colors.line, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
                <CocktailImage cocktail={cocktail} style={styles.pickThumb} rounded={radius.xs} artScale={0.7} />
                <T variant="body" style={{ flex: 1 }} numberOfLines={1}>{cocktail.name}</T>
                <Icon name="plus" size={18} color={colors.accent} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {entries.length ? (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <T variant="h2">À prévoir</T>
            <T variant="small" tone="muted">{totalGlasses} verres</T>
          </View>
          <Card style={{ paddingVertical: space.xs }}>
            {lines.map((line, index) => {
              const owned = hasIngredient(line.id, user.stock, data.settings.assumeBasics);
              return (
                <View key={line.id}>
                  {index ? <Divider /> : null}
                  <View style={styles.lineRow}>
                    <View style={[styles.dot, { borderColor: owned ? colors.ok : colors.line, backgroundColor: owned ? colors.ok : 'transparent' }]}>
                      {owned ? <Icon name="check" size={11} color={colors.surface} strokeWidth={3.2} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <T variant="body" style={{ fontWeight: '600' }}>{line.name}</T>
                      {line.detail ? <T variant="tiny" tone="muted">{line.detail}</T> : null}
                    </View>
                    <T variant="body" style={{ fontWeight: '700' }}>{line.text}</T>
                  </View>
                </View>
              );
            })}
            <Divider />
            <View style={styles.lineRow}>
              <T style={{ fontSize: 18 }}>🧊</T>
              <T variant="body" style={{ flex: 1, fontWeight: '600' }}>Glaçons</T>
              <T variant="body" style={{ fontWeight: '700' }}>≈ {Math.max(1, Math.ceil(totalGlasses * 0.3))} kg</T>
            </View>
          </Card>
          <T variant="tiny" tone="muted">Coche verte : déjà dans votre bar (la quantité n’est pas vérifiée). Glaçons : environ 300 g par verre, pour préparer et servir.</T>
          <View style={styles.actions}>
            <Button
              label={missing.length ? `Ajouter ${missing.length} manquant${missing.length > 1 ? 's' : ''} aux courses` : 'Rien ne manque dans votre bar'}
              icon="cart"
              disabled={!missing.length}
              onPress={() => { user.addShopping(missing.map((line) => line.id)); toast('Ajouté à la liste de courses'); }}
            />
            <View style={styles.rowBetween}>
              <Button label="Voir les courses" variant="ghost" size="sm" onPress={() => router.push({ pathname: '/bar', params: { tab: 'courses' } })} />
              <Button
                label="Vider le menu"
                variant="ghost"
                size="sm"
                onPress={async () => { if (await confirm('Vider le menu ?', 'Les cocktails choisis pour la soirée seront retirés.', 'Vider')) user.clearParty(); }}
              />
            </View>
          </View>
        </View>
      ) : (
        <Empty icon="users" title="Une soirée à préparer ?" text="Ajoutez quelques cocktails et le nombre de verres : vous obtenez les bouteilles, les citrons et les glaçons à prévoir." />
      )}
    </Screen>
  );
}

function Stepper({ value, onChange, suffix }: { value: number; onChange: (value: number) => void; suffix?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityLabel="Moins" hitSlop={4} onPress={() => onChange(value - 1)} style={[styles.stepButton, { borderColor: colors.line }]}>
        <Icon name="minus" size={14} color={colors.ink} />
      </Pressable>
      <View style={{ alignItems: 'center', minWidth: 30 }}>
        <T variant="h3">{value}</T>
        {suffix ? <T variant="tiny" tone="muted" style={{ marginTop: -2 }}>{suffix}</T> : null}
      </View>
      <Pressable accessibilityLabel="Plus" hitSlop={4} onPress={() => onChange(value + 1)} style={[styles.stepButton, { borderColor: colors.line }]}>
        <Icon name="plus" size={14} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  guests: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  section: { marginTop: space.xl, gap: space.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  menuInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  thumb: { width: 44, height: 44 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, minHeight: 46 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 10, outlineStyle: 'none' } as object,
  picks: { gap: space.xs },
  pick: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.md, padding: space.xs, paddingRight: space.sm },
  pickThumb: { width: 36, height: 36 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: space.xs, marginTop: space.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepButton: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
