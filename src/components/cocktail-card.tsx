import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { T } from '@/components/ui';
import { fonts, radius, space } from '@/constants/theme';
import { availability, type Availability } from '@/lib/cocktails';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

export const openCocktail = (id: string) => router.push({ pathname: '/cocktail/[id]', params: { id } });

export function useAvailability(cocktail: Cocktail) {
  const { stock, data } = useUser();
  return availability(cocktail, stock, data.settings.assumeBasics);
}

export function AvailabilityBadge({ value, compact }: { value: Availability; compact?: boolean }) {
  const { colors } = useTheme();
  const { ingredientById } = useCatalog();
  if (!value.required) return null;
  const ready = value.ready;
  const one = value.missing.length === 1;
  const label = ready ? 'Faisable' : one ? (compact ? 'Manque 1' : `Manque : ${ingredientById.get(value.missing[0].id)?.name ?? value.missing[0].id}`) : `Manque ${value.missing.length}`;
  const fg = ready ? colors.ok : one ? colors.warn : colors.muted;
  const bg = ready ? colors.okSoft : one ? colors.warnSoft : colors.surfaceAlt;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {ready ? <Icon name="check" size={13} color={fg} strokeWidth={3} /> : null}
      <Text numberOfLines={1} style={[styles.badgeLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Ligne de liste : vignette, nom, accroche, disponibilité. */
export function CocktailRow({ cocktail }: { cocktail: Cocktail }) {
  const { colors } = useTheme();
  const { favorites, data } = useUser();
  const { ingredientById } = useCatalog();
  const value = useAvailability(cocktail);
  const rating = data.ratings[cocktail.id];
  const keyIngredients = cocktail.ingredients.filter((item) => !item.optional).slice(0, 4).map((item) => ingredientById.get(item.id)?.name.replace(/ \(.*\)$/, '') ?? item.id).join(' · ');
  return (
    <Pressable onPress={() => openCocktail(cocktail.id)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <CocktailImage cocktail={cocktail} style={styles.rowImage} rounded={14} artScale={0.62} />
      <View style={styles.rowBody}>
        <View style={styles.rowTitle}>
          <T variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{cocktail.name}</T>
          {favorites.has(cocktail.id) ? <Icon name="heart" size={14} color={colors.accent} filled /> : null}
          {cocktail.origin === 'perso' ? <Icon name="pencil" size={13} color={colors.muted} /> : null}
        </View>
        <T variant="small" tone="muted" numberOfLines={1}>{keyIngredients}</T>
        <View style={styles.rowMeta}>
          <AvailabilityBadge value={value} compact />
          {rating ? (
            <View style={styles.rating}>
              <Icon name="star" size={13} color={colors.gold} filled />
              <T variant="tiny" tone="muted">{rating}</T>
            </View>
          ) : null}
          <T variant="tiny" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>{cocktail.family}</T>
        </View>
      </View>
    </Pressable>
  );
}

/** Case de grille : photo carrée, nom, pastille de disponibilité. */
export function CocktailGridItem({ cocktail }: { cocktail: Cocktail }) {
  const { colors } = useTheme();
  const { favorites } = useUser();
  const value = useAvailability(cocktail);
  const one = value.missing.length === 1;
  const dot = value.ready ? colors.ok : one ? colors.warn : colors.line;
  return (
    <Pressable onPress={() => openCocktail(cocktail.id)} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
      <View>
        <CocktailImage cocktail={cocktail} style={styles.gridImage} rounded={radius.md} artScale={0.62} />
        {favorites.has(cocktail.id) ? (
          <View style={[styles.gridHeart, { backgroundColor: colors.surface }]}><Icon name="heart" size={12} color={colors.accent} filled /></View>
        ) : null}
      </View>
      <T variant="small" numberOfLines={2} style={styles.gridName}>{cocktail.name}</T>
      {value.required ? (
        <View style={styles.gridStatus}>
          <View style={[styles.gridDot, { backgroundColor: dot }]} />
          <T variant="tiny" tone={value.ready ? 'ok' : one ? 'warn' : 'muted'} numberOfLines={1} style={{ fontWeight: '700' }}>
            {value.ready ? 'Faisable' : `Manque ${value.missing.length}`}
          </T>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Carte de carrousel : grande image et nom. */
export function CocktailTile({ cocktail, width = 156, subtitle }: { cocktail: Cocktail; width?: number; subtitle?: string }) {
  const value = useAvailability(cocktail);
  return (
    <Pressable onPress={() => openCocktail(cocktail.id)} style={({ pressed }) => [{ width, opacity: pressed ? 0.75 : 1 }]}>
      <CocktailImage cocktail={cocktail} style={{ width, height: width * 1.12 }} rounded={radius.lg} />
      <T variant="h3" numberOfLines={1} style={{ marginTop: space.xs }}>{cocktail.name}</T>
      {subtitle ? <T variant="small" tone="muted" numberOfLines={1}>{subtitle}</T> : <View style={{ marginTop: 4, flexDirection: 'row' }}><AvailabilityBadge value={value} compact /></View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, flexShrink: 1 },
  badgeLabel: { fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs },
  rowImage: { width: 72, height: 72 },
  rowBody: { flex: 1, gap: 3, minWidth: 0 },
  rowTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  gridImage: { width: '100%', aspectRatio: 1 },
  gridHeart: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  gridName: { fontWeight: '700', marginTop: 6, lineHeight: 17 },
  gridStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  gridDot: { width: 7, height: 7, borderRadius: 4 },
});
