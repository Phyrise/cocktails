import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CocktailTile, openCocktail } from '@/components/cocktail-card';
import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { Scrim } from '@/components/scrim';
import { Button, Card, Chip, HScroll, IconButton, Screen, SectionHeader, T } from '@/components/ui';
import { radius, space } from '@/constants/theme';
import { availability, cocktailOfTheDay, containsAvoided, tasteProfile, tasteScore } from '@/lib/cocktails';
import { MOODS } from '@/lib/filters';
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
  const { cocktails, ingredientById } = catalog;
  const { stock, data } = user;

  const featured = useMemo(() => cocktailOfTheDay(cocktails), [cocktails]);

  const { ready, almost, forYou, hasTaste } = useMemo(() => {
    const profile = tasteProfile(cocktails, { favorites: user.favorites, ratings: data.ratings, likedFlavors: data.likedFlavors, avoid: data.avoid });
    const scored = cocktails
      .filter((cocktail) => !containsAvoided(cocktail, profile.avoid))
      .map((cocktail) => ({ cocktail, value: availability(cocktail, stock, data.settings.assumeBasics), taste: tasteScore(cocktail, profile) }));
    const byTaste = (a: { taste: number; cocktail: Cocktail }, b: { taste: number; cocktail: Cocktail }) => b.taste - a.taste || Number(!!b.cocktail.image) - Number(!!a.cocktail.image);
    return {
      ready: scored.filter((entry) => entry.value.ready).sort(byTaste),
      almost: scored.filter((entry) => entry.value.missing.length === 1).sort(byTaste),
      // Suggestions personnelles : des recettes ni favorites ni encore notées.
      forYou: scored.filter((entry) => !user.favorites.has(entry.cocktail.id) && !data.ratings[entry.cocktail.id] && entry.taste > 0).sort(byTaste).slice(0, 12),
      hasTaste: profile.liked.length > 0 || profile.flavors.length > 0,
    };
  }, [cocktails, data.avoid, data.likedFlavors, data.ratings, data.settings.assumeBasics, stock, user.favorites]);

  const recent = data.recent.map((id) => catalog.byId.get(id)).filter((cocktail): cocktail is Cocktail => !!cocktail).slice(0, 10);
  const toTry = cocktails.filter((cocktail) => user.toTry.has(cocktail.id));

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
        right={<IconButton name="settings" label="Réglages" onPress={() => router.push('/settings')} />}
      />

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
        <Button label="Que puis-je faire ?" icon="wine" flex onPress={() => router.push({ pathname: '/cocktails', params: { filter: 'ready' } })} />
        <IconButton name="shuffle" label="Cocktail au hasard" onPress={surprise} size={48} />
      </View>

      <View style={styles.section}>
        <SectionHeader
          title="Avec votre bar"
          subtitle={stock.size ? `${ready.length} cocktail${ready.length > 1 ? 's' : ''} faisable${ready.length > 1 ? 's' : ''} maintenant` : undefined}
          action={ready.length ? 'Tout voir' : undefined}
          onAction={() => router.push({ pathname: '/cocktails', params: { filter: 'ready' } })}
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
          <Card><T variant="small" tone="muted">Rien de complet pour l’instant. Regardez ci-dessous ce qu’il vous manque de peu.</T></Card>
        )}
      </View>

      {almost.length ? (
        <View style={styles.section}>
          <SectionHeader title="À un ingrédient près" action="Tout voir" onAction={() => router.push({ pathname: '/cocktails', params: { filter: 'one' } })} />
          <HScroll>
            {almost.slice(0, 12).map(({ cocktail, value }) => (
              <CocktailTile key={cocktail.id} cocktail={cocktail} subtitle={`Manque : ${ingredientById.get(value.missing[0].id)?.name ?? value.missing[0].id}`} />
            ))}
          </HScroll>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title="Pour vous"
          subtitle={hasTaste ? 'D’après vos favoris, vos notes et vos goûts' : undefined}
          action={hasTaste ? 'Mes goûts' : undefined}
          onAction={() => router.push('/settings')}
        />
        {hasTaste && forYou.length ? (
          <HScroll>{forYou.map(({ cocktail }) => <CocktailTile key={cocktail.id} cocktail={cocktail} />)}</HScroll>
        ) : (
          <Card onPress={() => router.push('/settings')} style={styles.cta}>
            <View style={[styles.ctaIcon, { backgroundColor: colors.accentSoft }]}><Icon name="heart" size={20} color={colors.accent} /></View>
            <View style={{ flex: 1 }}>
              <T variant="h3">Dites-nous ce que vous aimez</T>
              <T variant="small" tone="muted">Saveurs préférées, ingrédients à éviter : les suggestions s’adaptent. Les favoris et les notes comptent aussi.</T>
            </View>
            <Icon name="chevronRight" size={18} color={colors.muted} />
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Envie de…" />
        <View style={styles.moods}>
          {MOODS.map((mood) => (
            <Chip key={mood.id} label={mood.label} icon={mood.icon} onPress={() => router.push({ pathname: '/cocktails', params: { mood: mood.id } })} />
          ))}
        </View>
      </View>

      {toTry.length ? (
        <View style={styles.section}>
          <SectionHeader title="À essayer" action="Ma liste" onAction={() => router.push({ pathname: '/listes', params: { tab: 'essayer' } })} />
          <HScroll>{toTry.slice(0, 12).map((cocktail) => <CocktailTile key={cocktail.id} cocktail={cocktail} />)}</HScroll>
        </View>
      ) : null}

      {recent.length ? (
        <View style={styles.section}>
          <SectionHeader title="Vus récemment" />
          <HScroll>{recent.map((cocktail) => <CocktailTile key={cocktail.id} cocktail={cocktail} width={128} />)}</HScroll>
        </View>
      ) : null}

      <Card style={[styles.section, styles.cta]} onPress={() => router.push('/editor')}>
        <View style={[styles.ctaIcon, { backgroundColor: colors.surfaceAlt }]}><Icon name="pencil" size={20} color={colors.ink} /></View>
        <View style={{ flex: 1 }}>
          <T variant="h3">Créer votre recette</T>
          <T variant="small" tone="muted">Gardez vos créations et vos variantes avec photo.</T>
        </View>
        <Icon name="chevronRight" size={18} color={colors.muted} />
      </Card>

      <T variant="tiny" tone="muted" style={styles.footer}>
        {cocktails.length} recettes · base du {catalog.db ? new Date(catalog.db.generatedAt).toLocaleDateString('fr-FR') : '—'}
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  hero: { height: 380, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'flex-end' },
  heroText: { padding: space.lg, gap: 4 },
  quickRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  section: { marginTop: space.xl },
  cta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ctaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  footer: { textAlign: 'center', marginTop: space.xl },
});
