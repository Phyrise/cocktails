import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CocktailTile, openCocktail } from '@/components/cocktail-card';
import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { InstallHint } from '@/components/install-hint';
import { PageHeader, SettingsButton } from '@/components/page-header';
import { Scrim } from '@/components/scrim';
import { Button, Card, Chip, HScroll, IconButton, Screen, SectionHeader, T } from '@/components/ui';
import { radius, space } from '@/constants/theme';
import { availability, cocktailOfTheDay, containsAvoided, tasteProfile, tasteScore } from '@/lib/cocktails';
import { COLLECTIONS, MOODS } from '@/lib/filters';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5 || hour >= 18) return 'Bonsoir';
  if (hour < 12) return 'Bonjour';
  return 'Bon après-midi';
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const catalog = useCatalog();
  const user = useUser();
  const { cocktails } = catalog;
  const { stock, data } = user;

  const featured = useMemo(() => cocktailOfTheDay(cocktails), [cocktails]);

  // Chaque collection prend en couverture une de ses recettes avec photo (stable d'un jour à l'autre).
  const collections = useMemo(() => COLLECTIONS.map((collection) => {
    const members = cocktails.filter((cocktail) => collection.test(cocktail, catalog.ingredientById));
    const withPhoto = members.filter((cocktail) => cocktail.image);
    return { collection, count: members.length, cover: withPhoto[collection.id.length % Math.max(1, withPhoto.length)] ?? members[0] };
  }).filter((entry) => entry.count >= 3), [catalog.ingredientById, cocktails]);

  const { ready, forYou, hasTaste } = useMemo(() => {
    const profile = tasteProfile(cocktails, { favorites: user.favorites, ratings: data.ratings, likedFlavors: data.likedFlavors, avoid: data.avoid });
    const scored = cocktails
      .filter((cocktail) => !containsAvoided(cocktail, profile.avoid))
      .map((cocktail) => ({ cocktail, value: availability(cocktail, stock, data.settings.assumeBasics), taste: tasteScore(cocktail, profile) }));
    const byTaste = (a: { taste: number; cocktail: Cocktail }, b: { taste: number; cocktail: Cocktail }) => b.taste - a.taste || Number(!!b.cocktail.image) - Number(!!a.cocktail.image);
    return {
      ready: scored.filter((entry) => entry.value.ready).sort(byTaste),
      // Suggestions personnelles : des recettes ni favorites ni encore notées.
      forYou: scored.filter((entry) => !user.favorites.has(entry.cocktail.id) && !data.ratings[entry.cocktail.id] && entry.taste > 0).sort(byTaste).slice(0, 12),
      hasTaste: profile.liked.length > 0 || profile.flavors.length > 0,
    };
  }, [cocktails, data.avoid, data.likedFlavors, data.ratings, data.settings.assumeBasics, stock, user.favorites]);

  const surprise = () => {
    const pool = ready.length ? ready.map((entry) => entry.cocktail) : cocktails;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) openCocktail(pick.id);
  };

  return (
    <Screen>
      <PageHeader
        eyebrow={greeting()}
        title="Arturo et Clémentine"
        right={<SettingsButton />}
      />

      <InstallHint />

      {catalog.updateAvailable ? (
        <Card style={[styles.banner, { backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }]} onPress={() => router.push('/settings')}>
          <Icon name="download" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <T variant="h3">Nouvelles recettes disponibles</T>
            <T variant="small" tone="muted">Touchez pour mettre à jour la base.</T>
          </View>
          <Icon name="chevronRight" size={18} color={colors.accent} />
        </Card>
      ) : null}

      {featured ? (
        <Pressable onPress={() => openCocktail(featured.id)} style={({ pressed }) => [styles.hero, { opacity: pressed ? 0.92 : 1 }]}>
          <CocktailImage cocktail={featured} style={StyleSheet.absoluteFill} rounded={radius.xl} />
          <Scrim from={0.3} />
          <View style={styles.heroText}>
            <T variant="label" style={{ color: '#F3D9A4' }}>Le cocktail du jour</T>
            <T variant="hero" style={{ color: '#FFFFFF' }} numberOfLines={2}>{featured.name}</T>
            <T variant="body" style={{ color: 'rgba(255,255,255,0.88)' }} numberOfLines={2}>{featured.tagline}</T>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.quickRow}>
        <Button
          label={ready.length ? `Que puis-je faire ? · ${ready.length}` : 'Que puis-je faire ?'}
          icon="wine"
          flex
          onPress={() => router.push({ pathname: '/recettes', params: { filter: 'ready' } })}
        />
        <IconButton name="shuffle" label="Cocktail au hasard" onPress={surprise} size={48} />
        <IconButton name="users" label="Préparer une soirée" onPress={() => router.push('/soiree')} size={48} active={data.party.length > 0} />
      </View>

      <View style={styles.moods}>
        <HScroll gap={space.xs}>
          {MOODS.map((mood) => (
            <Chip key={mood.id} label={mood.label} icon={mood.icon} onPress={() => router.push({ pathname: '/recettes', params: { mood: mood.id } })} />
          ))}
        </HScroll>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Avec votre bar"
          subtitle={stock.size ? `${ready.length} cocktail${ready.length > 1 ? 's' : ''} faisable${ready.length > 1 ? 's' : ''} maintenant` : undefined}
          action={ready.length ? 'Tout voir' : undefined}
          onAction={() => router.push({ pathname: '/recettes', params: { filter: 'ready' } })}
        />
        {!stock.size ? (
          <Card onPress={() => router.push('/bar')} style={styles.cta}>
            <View style={[styles.ctaIcon, { backgroundColor: colors.accentSoft }]}><Icon name="wine" size={22} color={colors.accent} /></View>
            <View style={{ flex: 1 }}>
              <T variant="h3">Qu’avez-vous à la maison ?</T>
              <T variant="small" tone="muted">Cochez vos bouteilles : l’app trouve ce que vous pouvez préparer ce soir.</T>
            </View>
            <Icon name="chevronRight" size={18} color={colors.muted} />
          </Card>
        ) : ready.length ? (
          <HScroll>
            {ready.slice(0, 12).map(({ cocktail }) => <CocktailTile key={cocktail.id} cocktail={cocktail} subtitle={cocktail.tagline} />)}
          </HScroll>
        ) : (
          <Card onPress={() => router.push({ pathname: '/bar', params: { tab: 'achats' } })} style={styles.cta}>
            <View style={{ flex: 1 }}>
              <T variant="h3">Rien de complet pour l’instant</T>
              <T variant="small" tone="muted">Voyez quelle bouteille débloquerait le plus de recettes.</T>
            </View>
            <Icon name="chevronRight" size={18} color={colors.muted} />
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Collections" />
        <HScroll>
          {collections.map(({ collection, cover, count }) => (
            <Pressable
              key={collection.id}
              onPress={() => router.push({ pathname: '/recettes', params: { collection: collection.id } })}
              style={({ pressed }) => [styles.collection, { opacity: pressed ? 0.85 : 1 }]}>
              {cover ? <CocktailImage cocktail={cover} style={StyleSheet.absoluteFill} rounded={radius.lg} /> : null}
              <Scrim from={0.15} strength={0.82} />
              <View style={styles.collectionText}>
                <T variant="h3" style={{ color: '#FFFFFF' }} numberOfLines={2}>{collection.title}</T>
                <T variant="tiny" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>{count} recettes · {collection.subtitle}</T>
              </View>
            </Pressable>
          ))}
        </HScroll>
      </View>

      {hasTaste && forYou.length ? (
        <View style={styles.section}>
          <SectionHeader title="Pour vous" subtitle="D’après vos favoris, vos notes et vos goûts" action="Mes goûts" onAction={() => router.push('/settings')} />
          <HScroll>{forYou.map(({ cocktail }) => <CocktailTile key={cocktail.id} cocktail={cocktail} />)}</HScroll>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  hero: { height: 340, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  heroText: { padding: space.lg, gap: 4 },
  quickRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  section: { marginTop: space.xl },
  cta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ctaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  moods: { marginTop: space.sm },
  collection: { width: 168, height: 132, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  collectionText: { padding: space.sm, gap: 2 },
});
