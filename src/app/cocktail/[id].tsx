import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvailabilityBadge, CocktailTile, useAvailability } from '@/components/cocktail-card';
import { CocktailImage } from '@/components/cocktail-image';
import { Icon, type IconName } from '@/components/icon';
import { Scrim } from '@/components/scrim';
import { useToast } from '@/components/toast';
import { Button, Card, Divider, Empty, HScroll, IconButton, SectionHeader, Segmented, Stars, T } from '@/components/ui';
import { fonts, MAX_WIDTH, radius, space } from '@/constants/theme';
import { BASICS, computeMetrics, formatAmount, hasIngredient, similarCocktails, strengthLabel } from '@/lib/cocktails';
import { confirm } from '@/lib/dialogs';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { MeasurementUnit } from '@/types/cocktail';

const difficultyLabel = ['', 'Facile', 'Modéré', 'Avancé'];
const fmt = (value: number, digits = 1) => Number(value.toFixed(digits)).toLocaleString('fr-FR');

export default function CocktailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const catalog = useCatalog();
  const user = useUser();
  const cocktail = catalog.byId.get(id ?? '');
  const [servings, setServings] = useState(1);
  const [note, setNote] = useState(user.data.notes[id ?? ''] ?? '');

  // Les notes s'enregistrent pendant la frappe : rien n'est perdu si l'app est fermée en cours de saisie.
  const savedNote = user.data.notes[id ?? ''] ?? '';
  const { setNote: persistNote } = user;
  useEffect(() => {
    if (!id || note === savedNote) return;
    const timer = setTimeout(() => persistNote(id, note), 500);
    return () => clearTimeout(timer);
  }, [id, note, persistNote, savedNote]);

  const { markViewed } = user;
  useEffect(() => {
    if (cocktail) markViewed(cocktail.id);
    // Une seule fois par ouverture de fiche.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cocktail?.id]);

  const metrics = useMemo(() => (cocktail ? computeMetrics(cocktail, catalog.ingredientById) : null), [catalog.ingredientById, cocktail]);
  const similar = useMemo(() => (cocktail ? similarCocktails(cocktail, catalog.cocktails) : []), [catalog.cocktails, cocktail]);
  const value = useAvailability(cocktail ?? { ingredients: [] } as never);

  if (!cocktail || !metrics) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + space.xl }]}>
        <Empty icon="search" title="Recette introuvable" text="Elle a peut-être été supprimée." action="Retour aux cocktails" onAction={() => router.replace('/recettes')} />
      </View>
    );
  }

  const isFavorite = user.favorites.has(cocktail.id);
  const isToTry = user.toTry.has(cocktail.id);
  const rating = user.data.ratings[cocktail.id] ?? 0;
  const unit = user.data.settings.unit;
  const base = catalog.baseById.get(cocktail.id);
  const isCustom = user.data.custom.some((item) => item.id === cocktail.id);
  const isOverride = isCustom && !!base;
  const missingIds = value.missing.map((item) => item.id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/recettes'));

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'glass', label: 'Verre', value: cocktail.glass },
    { icon: 'shaker', label: 'Méthode', value: cocktail.method },
    { icon: 'percent', label: 'Degré', value: metrics.abv < 0.5 ? 'Sans alcool' : `≈ ${fmt(metrics.abv, 0)} %` },
    { icon: 'clock', label: 'Niveau', value: difficultyLabel[cocktail.difficulty] },
  ];

  const saveNote = () => {
    if ((user.data.notes[cocktail.id] ?? '') !== note) user.setNote(cocktail.id, note);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={[styles.hero, !cocktail.image && { height: 380 }]}>
            <CocktailImage cocktail={cocktail} style={StyleSheet.absoluteFill} rounded={0} artScale={0.42} />
            {cocktail.image ? <Scrim from={0.45} strength={0.75} /> : null}
            <View style={[styles.heroBar, { top: insets.top + space.sm }]}>
              <IconButton name="chevronLeft" label="Retour" onPress={back} />
              <View style={{ flexDirection: 'row', gap: space.xs }}>
                <IconButton name="bookmark" label={isToTry ? 'Retirer de « À essayer »' : 'À essayer'} filled={isToTry} active={isToTry} onPress={() => { user.toggleToTry(cocktail.id); toast(isToTry ? 'Retiré de « À essayer »' : 'Ajouté à « À essayer »'); }} />
                <IconButton name="heart" label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} filled={isFavorite} active={isFavorite} onPress={() => user.toggleFavorite(cocktail.id)} />
              </View>
            </View>
            <View style={styles.heroText}>
              {cocktail.origin === 'clement' ? <T variant="label" style={{ color: cocktail.image ? '#F3D9A4' : colors.accent }}>Sélection de Clément</T> : null}
              {cocktail.origin === 'perso' ? <T variant="label" style={{ color: cocktail.image ? '#F3D9A4' : colors.accent }}>{isOverride ? 'Ma version' : 'Ma recette'}</T> : null}
              <T variant="hero" style={{ color: cocktail.image ? '#FFFFFF' : colors.ink }}>{cocktail.name}</T>
              {cocktail.tagline ? <T variant="body" style={{ color: cocktail.image ? 'rgba(255,255,255,0.9)' : colors.inkSoft }}>{cocktail.tagline}</T> : null}
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.tags}>
              <Tag label={cocktail.family} />
              {cocktail.iba ? <Tag label={`IBA · ${cocktail.iba}`} /> : null}
              <Tag label={strengthLabel(metrics.abv)} />
              {cocktail.flavors.map((flavor) => <Tag key={flavor} label={flavor} soft />)}
            </View>

            <View style={[styles.facts, { borderColor: colors.line, backgroundColor: colors.surface }]}>
              {facts.map((fact, index) => (
                <View key={fact.label} style={[styles.fact, index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.line }]}>
                  <Icon name={fact.icon} size={18} color={colors.accent} />
                  <T variant="tiny" tone="muted">{fact.label}</T>
                  <T variant="small" style={{ fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>{fact.value}</T>
                </View>
              ))}
            </View>

            <Card style={{ gap: space.sm }}>
              <View style={styles.rowBetween}>
                <T variant="h2">Ingrédients</T>
                <AvailabilityBadge value={value} />
              </View>
              <View style={styles.rowBetween}>
                <View style={styles.stepper}>
                  <Pressable accessibilityLabel="Moins de verres" onPress={() => setServings(Math.max(1, servings - 1))} style={[styles.stepButton, { borderColor: colors.line }]}><Icon name="minus" size={16} color={colors.ink} /></Pressable>
                  <T variant="small" style={{ fontWeight: '700', minWidth: 72, textAlign: 'center' }}>{servings} verre{servings > 1 ? 's' : ''}</T>
                  <Pressable accessibilityLabel="Plus de verres" onPress={() => setServings(Math.min(20, servings + 1))} style={[styles.stepButton, { borderColor: colors.line }]}><Icon name="plus" size={16} color={colors.ink} /></Pressable>
                </View>
                <View style={{ width: 150 }}>
                  <Segmented<MeasurementUnit> value={unit} onChange={(next) => user.updateSettings({ unit: next })} options={[{ value: 'ml', label: 'ml' }, { value: 'cl', label: 'cl' }, { value: 'oz', label: 'oz' }]} />
                </View>
              </View>
              <Divider />
              {cocktail.ingredients.map((item, index) => {
                const ingredient = catalog.ingredientById.get(item.id);
                const owned = hasIngredient(item.id, user.stock, user.data.settings.assumeBasics);
                const name = ingredient?.name ?? item.id;
                const basic = user.data.settings.assumeBasics && BASICS.has(item.id);
                return (
                  <Pressable
                    key={`${item.id}-${index}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: owned }}
                    // Toucher : je l'ai / je ne l'ai plus. Appui long : les recettes avec cet ingrédient.
                    onPress={() => {
                      if (basic) return toast(`${name} : toujours disponible (réglage « basiques »)`);
                      user.toggleStock(item.id);
                      toast(user.stock.has(item.id) ? `${name} retiré de votre bar` : `${name} ajouté à votre bar`);
                    }}
                    onLongPress={() => router.push({ pathname: '/recettes', params: { ingredient: item.id } })}
                    style={({ pressed }) => [styles.ingredient, { opacity: pressed ? 0.6 : 1 }]}>
                    <View style={[styles.dot, { borderColor: owned ? colors.ok : colors.line, backgroundColor: owned ? colors.ok : 'transparent' }]}>
                      {owned ? <Icon name="check" size={12} color={colors.surface} strokeWidth={3.2} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <T variant="body" style={{ fontWeight: '600' }}>
                        {ingredient?.name ?? item.id}
                        {item.optional ? <T variant="small" tone="muted"> (facultatif)</T> : null}
                        {user.data.avoid.includes(item.id) ? <T variant="small" tone="danger"> · à éviter</T> : null}
                      </T>
                      {item.note ? <T variant="tiny" tone="muted">{item.note}</T> : null}
                    </View>
                    <T variant="body" style={{ fontWeight: '700' }}>{formatAmount(item, unit, servings)}</T>
                  </Pressable>
                );
              })}
              <T variant="tiny" tone="muted">Touchez un ingrédient pour le cocher dans votre bar ; appui long : les recettes qui l’utilisent.</T>
              {cocktail.garnish ? (
                <View style={[styles.garnish, { backgroundColor: colors.surfaceAlt }]}>
                  <Icon name="leaf" size={16} color={colors.muted} />
                  <T variant="small" style={{ flex: 1 }}><T variant="small" style={{ fontWeight: '700' }}>Garniture : </T>{cocktail.garnish}</T>
                </View>
              ) : null}
              {!value.ready ? (
                <View style={styles.actionsRow}>
                  <Button
                    label="Aux courses"
                    icon="cart"
                    size="sm"
                    variant="secondary"
                    flex
                    onPress={() => { user.addShopping(missingIds); toast(`${missingIds.length} ingrédient${missingIds.length > 1 ? 's' : ''} ajouté${missingIds.length > 1 ? 's' : ''} aux courses`); }}
                  />
                  <Button label="Je les ai" icon="check" size="sm" variant="secondary" flex onPress={() => { user.setStockMany(missingIds, true); toast('Ajouté à votre bar'); }} />
                </View>
              ) : null}
            </Card>

            <View style={{ gap: space.sm }}>
              <T variant="h2">Préparation</T>
              <T variant="small" tone="muted">{cocktail.method} · {cocktail.ice} · {cocktail.glass}</T>
              {cocktail.steps.map((step, index) => (
                <View key={index} style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}><T variant="small" style={{ color: colors.accentInk, fontWeight: '800' }}>{index + 1}</T></View>
                  <T variant="body" style={{ flex: 1 }}>{step}</T>
                </View>
              ))}
            </View>

            <Card style={{ gap: space.sm }}>
              <T variant="h2">Profil</T>
              <Meter label="Alcool" value={Math.min(1, metrics.abv / 35)} text={metrics.abv < 0.5 ? '0 %' : `${fmt(metrics.abv, 0)} % vol.`} color={colors.accent} />
              <Meter label="Sucre" value={Math.min(1, metrics.sugar / 30)} text={`${fmt(metrics.sugar, 0)} g`} color={colors.gold} />
              <Meter label="Acidité" value={metrics.acidity / 5} text={`${fmt(metrics.acidity)}/5`} color={colors.ok} />
              <Meter label="Amertume" value={metrics.bitterness / 5} text={`${fmt(metrics.bitterness)}/5`} color={colors.warn} />
              <T variant="tiny" tone="muted">Estimations pour un verre, dilution comprise (≈ {fmt(metrics.volume, 0)} ml servis).</T>
            </Card>

            {cocktail.description ? (
              <View style={{ gap: space.xs }}>
                <T variant="h2">L’histoire</T>
                <T variant="body" tone="inkSoft">{cocktail.description}</T>
              </View>
            ) : null}

            <Card style={{ gap: space.sm }}>
              <T variant="h2">Mon avis</T>
              <View style={styles.rowBetween}>
                <Stars value={rating} onChange={(next) => user.setRating(cocktail.id, next)} />
                {rating ? <Pressable onPress={() => user.setRating(cocktail.id, 0)} hitSlop={8}><T variant="small" tone="muted">Effacer</T></Pressable> : null}
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                onBlur={saveNote}
                multiline
                placeholder="Mes notes : dosage préféré, marque utilisée, avec qui…"
                placeholderTextColor={colors.muted}
                style={[styles.note, { color: colors.ink, borderColor: colors.line, backgroundColor: colors.bg }]}
              />
              <T variant="tiny" tone="muted">{note && note === savedNote ? 'Note enregistrée.' : 'Enregistrement automatique.'}</T>
            </Card>

            <View style={{ gap: space.xs }}>
              <Button label={isCustom ? 'Modifier ma recette' : 'Modifier à mon goût'} icon="pencil" variant="secondary" onPress={() => router.push({ pathname: '/editor', params: { id: cocktail.id } })} />
              {isOverride ? (
                <Button
                  label="Revenir à la recette d’origine"
                  icon="refresh"
                  variant="ghost"
                  onPress={async () => { if (await confirm('Revenir à l’original ?', 'Votre version modifiée sera supprimée.', 'Revenir')) { user.removeCustom(cocktail.id); toast('Recette d’origine rétablie'); } }}
                />
              ) : null}
              {isCustom && !base ? (
                <Button
                  label="Supprimer cette recette"
                  icon="trash"
                  variant="danger"
                  onPress={async () => { if (await confirm('Supprimer la recette ?', `« ${cocktail.name} » sera supprimée de cet appareil.`, 'Supprimer')) { user.removeCustom(cocktail.id); back(); } }}
                />
              ) : null}
            </View>

            {similar.length ? (
              <View>
                <SectionHeader title="Dans le même esprit" />
                <HScroll>{similar.map((item) => <CocktailTile key={item.id} cocktail={item} width={136} />)}</HScroll>
              </View>
            ) : null}

            <T variant="tiny" tone="muted" style={{ textAlign: 'center' }}>
              {[cocktail.source?.label, cocktail.imageCredit].filter(Boolean).join(' · ')}
            </T>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Tag({ label, soft }: { label: string; soft?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: soft ? 'transparent' : colors.surfaceAlt, borderColor: colors.line }]}>
      <T variant="tiny" tone={soft ? 'muted' : 'inkSoft'} style={{ fontWeight: '700' }}>{label}</T>
    </View>
  );
}

function Meter({ label, value, text, color }: { label: string; value: number; text: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.meter}>
      <T variant="small" style={{ width: 82 }}>{label}</T>
      <View style={[styles.meterTrack, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.meterFill, { width: `${Math.max(3, value * 100)}%`, backgroundColor: color }]} />
      </View>
      <T variant="small" tone="muted" style={{ width: 70, textAlign: 'right' }}>{text}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  hero: { height: 430, justifyContent: 'flex-end', overflow: 'hidden' },
  heroBar: { position: 'absolute', left: space.md, right: space.md, flexDirection: 'row', justifyContent: 'space-between' },
  heroText: { padding: space.md, paddingBottom: space.lg, gap: 4 },
  body: { padding: space.md, gap: space.lg },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  facts: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, paddingVertical: space.sm },
  fact: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 6 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  garnish: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.sm, padding: space.sm },
  actionsRow: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  step: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  meter: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  meterTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4 },
  note: { minHeight: 84, borderWidth: 1, borderRadius: radius.sm, padding: space.sm, fontFamily: fonts.body, fontSize: 16, textAlignVertical: 'top' },
});
