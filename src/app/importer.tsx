import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Divider, Screen, T } from '@/components/ui';
import { radius, space } from '@/constants/theme';
import { formatAmount, sanitizeCocktail, sanitizeIngredient, sanitizeList } from '@/lib/cocktails';
import { decodeRecipe, extractRecipeCode, type RecipeCard } from '@/lib/recipe-link';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

const web = Platform.OS === 'web' && typeof window !== 'undefined';

/** Sur iPhone, l'app de l'écran d'accueil ne s'ouvre pas depuis un lien : il arrive dans Safari, qui a ses propres données. */
const iosBrowser = (() => {
  if (!web) return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  const ios = /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  const standalone = nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches;
  return ios && !standalone;
})();

const canPaste = web && typeof navigator.clipboard?.readText === 'function';

/** Nouvel id pour garder la recette reçue à côté de la vôtre. */
const copyId = (id: string) => `${id}-${Date.now().toString(36).slice(-4)}`;

const sameRecipe = (a: Cocktail, b: Cocktail) =>
  a.name === b.name && JSON.stringify(a.ingredients) === JSON.stringify(b.ingredients) && JSON.stringify(a.steps) === JSON.stringify(b.steps);

/** Importer une fiche reçue d'un ami : depuis le lien (…/importer#r=…) ou le message collé. */
export default function ImportScreen() {
  const { colors } = useTheme();
  const catalog = useCatalog();
  const user = useUser();
  const toast = useToast();
  const [fromLink] = useState(() => (web ? extractRecipeCode(window.location.hash) : null));
  const [code, setCode] = useState<string | null>(fromLink);
  const [input, setInput] = useState('');
  const [card, setCard] = useState<RecipeCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let alive = true;
    decodeRecipe(code).then((raw) => {
      if (!alive) return;
      const cocktail = raw ? sanitizeCocktail(raw.cocktail) : null;
      if (!raw || !cocktail) {
        setCard(null);
        setError('Cette fiche est incomplète : le lien a peut-être été coupé. Demandez à votre ami de la renvoyer.');
        return;
      }
      setError(null);
      setCard({ cocktail: { ...cocktail, origin: 'perso' }, ingredients: sanitizeList(raw.ingredients, sanitizeIngredient) });
    });
    return () => { alive = false; };
  }, [code]);

  const read = (text: string) => {
    setInput(text);
    const found = extractRecipeCode(text);
    if (found) setCode(found);
    else if (text.trim()) setError('Aucune fiche dans ce texte : collez le message reçu en entier, ou le lien.');
    else setError(null);
  };

  const paste = async () => {
    try {
      read(await navigator.clipboard.readText());
    } catch {
      toast('Collez le message dans le champ ci-dessous');
    }
  };

  const unit = user.data.settings.unit;
  const ingredientName = (id: string) => catalog.ingredientById.get(id)?.name ?? card?.ingredients.find((item) => item.id === id)?.name ?? id;
  const newIngredients = card ? card.ingredients.filter((item) => !catalog.ingredientById.has(item.id)) : [];
  const existing = card ? catalog.byId.get(card.cocktail.id) : undefined;
  const mine = card ? user.data.custom.find((item) => item.id === card.cocktail.id) : undefined;
  const identical = !!card && !!existing && sameRecipe(existing, card.cocktail);

  const save = (cocktail: Cocktail) => {
    for (const ingredient of newIngredients) user.addIngredient(ingredient);
    user.saveCocktail(cocktail);
    if (user.archived.has(cocktail.id)) user.setArchived([cocktail.id], false);
    toast(`« ${cocktail.name} » ajoutée à vos recettes`);
    router.replace({ pathname: '/cocktail/[id]', params: { id: cocktail.id } });
  };
  const replace = () => card && save({ ...card.cocktail, basedOn: catalog.baseById.has(card.cocktail.id) ? card.cocktail.id : card.cocktail.basedOn });
  const addCopy = () => card && save({ ...card.cocktail, id: copyId(card.cocktail.id), name: `${card.cocktail.name} (copie)`, basedOn: undefined });

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <PageHeader eyebrow="Recette reçue" title="Importer une fiche" back />

      {iosBrowser && fromLink ? (
        <Card style={[styles.notice, { backgroundColor: colors.warnSoft, borderColor: colors.warnSoft }]}>
          <View style={styles.row}>
            <Icon name="info" size={18} color={colors.warn} />
            <T variant="small" style={{ flex: 1 }}>
              L’app est sur votre écran d’accueil ? Sur iPhone, elle ne s’ouvre pas depuis un lien. Copiez ce lien, ouvrez l’app, puis
              Mes listes › Perso › Importer.
            </T>
          </View>
          <Button label="Copier le lien" icon="share" size="sm" variant="secondary" onPress={async () => {
            try { await navigator.clipboard.writeText(window.location.href); toast('Lien copié'); } catch { toast('Copie impossible : sélectionnez l’adresse'); }
          }} />
        </Card>
      ) : null}

      {card ? (
        <>
          <Card style={{ gap: space.sm }}>
            <View style={styles.row}>
              <CocktailImage cocktail={card.cocktail} style={styles.thumb} rounded={radius.md} artScale={0.6} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T variant="h2" numberOfLines={2}>{card.cocktail.name}</T>
                {card.cocktail.tagline ? <T variant="small" tone="muted">{card.cocktail.tagline}</T> : null}
                <T variant="tiny" tone="muted" style={{ marginTop: 2 }}>{card.cocktail.family} · {card.cocktail.method} · {card.cocktail.glass}</T>
              </View>
            </View>
            <Divider />
            {card.cocktail.ingredients.map((item) => (
              <View key={item.id} style={styles.line}>
                <T variant="body" style={{ flex: 1 }}>{ingredientName(item.id)}{item.optional ? ' (facultatif)' : ''}</T>
                <T variant="body" style={{ fontWeight: '700' }}>{formatAmount(item, unit)}</T>
              </View>
            ))}
            <T variant="tiny" tone="muted">
              {card.cocktail.steps.length} étape{card.cocktail.steps.length > 1 ? 's' : ''} de préparation
              {newIngredients.length ? ` · ingrédient${newIngredients.length > 1 ? 's' : ''} ajouté${newIngredients.length > 1 ? 's' : ''} à votre liste : ${newIngredients.map((item) => item.name).join(', ')}` : ''}
              {' · '}la photo ne voyage pas avec la fiche.
            </T>
          </Card>

          <View style={styles.actions}>
            {identical ? (
              <>
                <T variant="small" tone="muted" style={{ textAlign: 'center' }}>Vous avez déjà cette recette, à l’identique.</T>
                <Button label="Voir la fiche" icon="chevronRight" onPress={() => router.replace({ pathname: '/cocktail/[id]', params: { id: card.cocktail.id } })} />
              </>
            ) : existing ? (
              <>
                <T variant="small" tone="muted" style={{ textAlign: 'center' }}>
                  Vous avez déjà « {existing.name} »{mine ? ' dans vos recettes perso' : ''}.
                </T>
                <Button label={mine ? 'Remplacer la mienne' : 'En faire ma version'} icon="refresh" onPress={replace} />
                <Button label="Ajouter en copie" icon="plus" variant="secondary" onPress={addCopy} />
              </>
            ) : (
              <Button label="Ajouter à mes recettes" icon="plus" onPress={replace} />
            )}
            <Button label="Importer une autre fiche" variant="ghost" size="sm" onPress={() => { setCard(null); setCode(null); setInput(''); }} />
          </View>
        </>
      ) : (
        <Card style={{ gap: space.sm }}>
          <T variant="body">
            Un ami vous a envoyé une fiche ? Collez ici son message (ou juste le lien) : la recette s’ajoute à vos recettes perso.
          </T>
          {canPaste ? <Button label="Coller le message reçu" icon="download" onPress={paste} /> : null}
          <TextInput
            value={input}
            onChangeText={read}
            placeholder="…ou collez-le ici"
            placeholderTextColor={colors.muted}
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            style={[styles.input, { color: colors.ink, borderColor: colors.line, backgroundColor: colors.surfaceAlt }]}
          />
          {code && !error ? <T variant="small" tone="muted">Lecture de la fiche…</T> : null}
          {error ? <T variant="small" tone="warn">{error}</T> : null}
          <T variant="tiny" tone="muted">Pour envoyer une des vôtres : bouton Partager sur sa fiche, puis « La fiche, à ajouter dans l’app ».</T>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  thumb: { width: 72, height: 72 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 2 },
  notice: { gap: space.sm, marginBottom: space.md },
  actions: { marginTop: space.md, gap: space.sm },
  input: { minHeight: 90, borderWidth: 1, borderRadius: radius.md, padding: space.sm, textAlignVertical: 'top', fontSize: 15 },
});
