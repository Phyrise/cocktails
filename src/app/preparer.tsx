import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { Button, Empty, IconButton, Stars, T } from '@/components/ui';
import { fonts, MAX_WIDTH, radius, space } from '@/constants/theme';
import { formatAmount, normalize } from '@/lib/cocktails';
import { useKeepScreenOn } from '@/lib/wake-lock';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Ingredient, RecipeIngredient } from '@/types/cocktail';

// Mots trop génériques pour rattacher un ingrédient à une étape (« jus », « sirop »…).
const GENERIC = new Set(['jus', 'sirop', 'creme', 'liqueur', 'de', 'du', 'des', 'la', 'le', 'blanc', 'rouge', 'frais', 'fraiche', 'sec', 'eau']);

function ingredientsOfStep(step: string, items: RecipeIngredient[], byId: Map<string, Ingredient>) {
  const text = normalize(step);
  // « Verser tous les ingrédients… » : on rappelle toutes les doses.
  if (/\bingredients\b/.test(text)) return items;
  return items.filter((item) => {
    const words = normalize((byId.get(item.id)?.name ?? item.id).replace(/\(.*\)/, '')).split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !GENERIC.has(word));
    return words.some((word) => text.includes(word));
  });
}

/** Préparation guidée : on rassemble les ingrédients, puis une étape par écran, en grand, écran allumé. */
export default function PrepareScreen() {
  const { id, servings: servingsParam } = useLocalSearchParams<{ id: string; servings?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const catalog = useCatalog();
  const user = useUser();
  const cocktail = catalog.byId.get(id ?? '');
  const servings = Math.max(1, Math.min(20, Number(servingsParam) || 1));
  const [index, setIndex] = useState(0);
  const [gathered, setGathered] = useState<Set<number>>(new Set());
  useKeepScreenOn();

  const close = () => (router.canGoBack() ? router.back() : router.replace({ pathname: '/cocktail/[id]', params: { id: id ?? '' } }));

  if (!cocktail) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + space.xl }]}>
        <Empty icon="search" title="Recette introuvable" action="Fermer" onAction={close} />
      </View>
    );
  }

  const unit = user.data.settings.unit;
  const steps = cocktail.steps.length ? cocktail.steps : ['Assembler les ingrédients et servir.'];
  // Écran 0 : rassembler ; écrans 1..n : étapes ; dernier : servir.
  const total = steps.length + 2;
  const last = index === total - 1;
  const rating = user.data.ratings[cocktail.id] ?? 0;

  const toggleGathered = (position: number) => setGathered((current) => {
    const next = new Set(current);
    if (next.has(position)) next.delete(position);
    else next.add(position);
    return next;
  });

  const doses = (items: RecipeIngredient[]) => (
    <View style={styles.doses}>
      {items.map((item, position) => (
        <View key={`${item.id}-${position}`} style={[styles.dose, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <T variant="h3" style={{ flex: 1 }}>{catalog.ingredientById.get(item.id)?.name ?? item.id}</T>
          <T variant="h3" tone="accent">{formatAmount(item, unit, servings)}</T>
        </View>
      ))}
    </View>
  );

  let content;
  if (index === 0) {
    content = (
      <View style={{ gap: space.md }}>
        <T variant="label" tone="accent">Rassemblez</T>
        <T variant="h1">{cocktail.name}</T>
        <T variant="body" tone="muted">{servings} verre{servings > 1 ? 's' : ''} · {cocktail.glass} · {cocktail.ice} · {cocktail.method}</T>
        <View style={{ gap: space.xs }}>
          {cocktail.ingredients.map((item, position) => {
            const done = gathered.has(position);
            return (
              <Pressable
                key={`${item.id}-${position}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                onPress={() => toggleGathered(position)}
                style={[styles.gatherRow, { backgroundColor: done ? colors.okSoft : colors.surface, borderColor: done ? colors.ok : colors.line }]}>
                <View style={[styles.check, { borderColor: done ? colors.ok : colors.line, backgroundColor: done ? colors.ok : 'transparent' }]}>
                  {done ? <Icon name="check" size={14} color={colors.surface} strokeWidth={3.2} /> : null}
                </View>
                <T variant="h3" style={{ flex: 1, opacity: done ? 0.7 : 1 }}>
                  {catalog.ingredientById.get(item.id)?.name ?? item.id}
                  {item.optional ? <T variant="small" tone="muted"> (facultatif)</T> : null}
                </T>
                <T variant="h3" tone="accent">{formatAmount(item, unit, servings)}</T>
              </Pressable>
            );
          })}
        </View>
        {cocktail.garnish ? <T variant="body" tone="muted">Garniture : {cocktail.garnish}</T> : null}
      </View>
    );
  } else if (!last) {
    const step = steps[index - 1];
    const related = ingredientsOfStep(step, cocktail.ingredients, catalog.ingredientById);
    content = (
      <View style={{ gap: space.lg }}>
        <T variant="label" tone="accent">Étape {index} sur {steps.length}</T>
        <T style={[styles.stepText, { color: colors.ink }]}>{step}</T>
        {related.length ? doses(related) : null}
      </View>
    );
  } else {
    content = (
      <View style={{ gap: space.md, alignItems: 'center' }}>
        <CocktailImage cocktail={cocktail} style={styles.final} rounded={radius.xl} />
        <T variant="hero" style={{ textAlign: 'center' }}>Santé !</T>
        {cocktail.garnish ? <T variant="body" tone="muted" style={{ textAlign: 'center' }}>Finition : {cocktail.garnish}</T> : null}
        <T variant="body" style={{ marginTop: space.sm }}>Alors, qu’en pensez-vous ?</T>
        <Stars value={rating} onChange={(value) => user.setRating(cocktail.id, value)} size={34} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.top}>
        <IconButton name="x" label="Fermer" onPress={close} />
        <View style={styles.progress}>
          {Array.from({ length: total }, (_, position) => (
            <View key={position} style={[styles.progressPart, { backgroundColor: position <= index ? colors.accent : colors.line }]} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.inner}>{content}</View>
      </ScrollView>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + space.md, borderTopColor: colors.line }]}>
        <Button label="Précédent" icon="chevronLeft" variant="secondary" disabled={index === 0} onPress={() => setIndex(index - 1)} flex />
        {last ? (
          <Button label="Terminer" icon="check" onPress={close} flex />
        ) : (
          <Button label={index === 0 ? 'C’est parti' : 'Suivant'} icon="chevronRight" onPress={() => setIndex(index + 1)} flex />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  progress: { flex: 1, flexDirection: 'row', gap: 4 },
  progressPart: { flex: 1, height: 5, borderRadius: 3 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: space.xl },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space.lg },
  stepText: { fontFamily: fonts.display, fontSize: 30, lineHeight: 40 },
  doses: { gap: space.xs },
  dose: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm },
  gatherRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.md, padding: space.md },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  final: { width: 200, height: 200 },
  bottom: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
});
