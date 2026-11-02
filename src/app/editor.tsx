import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { useToast } from '@/components/toast';
import { Button, Chip, Divider, IconButton, T } from '@/components/ui';
import { fonts, MAX_WIDTH, radius, space } from '@/constants/theme';
import { normalize, slugify } from '@/lib/cocktails';
import { compressImage } from '@/lib/files';
import { FAMILIES, FLAVORS, GLASSES, ICES, METHODS } from '@/lib/filters';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { CategoryId, Cocktail, Family, Ingredient, IngredientUnit, Method, RecipeIngredient } from '@/types/cocktail';

const UNITS: IngredientUnit[] = ['ml', 'trait', 'goutte', 'pièce', 'tranche', 'cuillère', 'pincée'];
const COLORS = ['#C0392B', '#E67E22', '#F1C40F', '#F5E6C8', '#8E44AD', '#2E86C1', '#48C9B0', '#27AE60', '#6E2C00', '#1B1B1B', '#F8C8DC', '#FFFFFF'];
const CATEGORY_LABELS: { id: CategoryId; label: string }[] = [
  { id: 'spiritueux', label: 'Spiritueux' }, { id: 'liqueur', label: 'Liqueur' }, { id: 'aperitif_vermouth', label: 'Apéritif' },
  { id: 'vin_bulles', label: 'Vin / bulles' }, { id: 'jus', label: 'Jus' }, { id: 'soft_bulle', label: 'Soda' },
  { id: 'sirop', label: 'Sirop' }, { id: 'bitter_arome', label: 'Bitter' }, { id: 'frais_garniture', label: 'Frais / épicerie' },
];

type Row = RecipeIngredient & { key: string; amountText: string };

const blank = (): Cocktail => ({
  id: '', name: '', tagline: '', description: '', family: 'Sour', method: 'Shaker', glass: 'Coupe', ice: 'Sans glace',
  ingredients: [], garnish: '', steps: [''], flavors: [], difficulty: 1, color: '#E67E22', origin: 'perso',
});

export default function EditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const catalog = useCatalog();
  const user = useUser();
  const source = params.id ? catalog.byId.get(params.id) : undefined;
  const [draft, setDraft] = useState<Cocktail>(() => (source ? { ...source, steps: source.steps.length ? source.steps : [''] } : blank()));
  const [rows, setRows] = useState<Row[]>(() => (source?.ingredients ?? []).map((item, index) => ({ ...item, key: `${index}`, amountText: String(item.amount).replace('.', ',') })));
  const [picker, setPicker] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof Cocktail>(key: K, value: Cocktail[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const setRow = (key: string, patch: Partial<Row>) => setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const suggestions = useMemo(() => {
    const q = normalize(picker.trim());
    if (!q) return [];
    return catalog.ingredients.filter((item) => normalize(item.name).includes(q) || item.id.includes(slugify(q))).slice(0, 6);
  }, [catalog.ingredients, picker]);

  const addIngredient = (ingredient: Ingredient) => {
    const unit: IngredientUnit = ['bitter_arome'].includes(ingredient.category) ? 'trait' : ingredient.category === 'frais_garniture' ? 'pièce' : 'ml';
    const amount = unit === 'ml' ? 30 : 1;
    setRows((current) => [...current, { id: ingredient.id, amount, unit, key: `${Date.now()}`, amountText: String(amount) }]);
    setPicker('');
    setNewCategory(null);
  };

  const createIngredient = (category: CategoryId) => {
    const name = picker.trim();
    const ingredient: Ingredient = {
      id: `perso-${slugify(name)}`, name, category, emoji: '•',
      abv: category === 'spiritueux' ? 40 : category === 'liqueur' ? 20 : category === 'aperitif_vermouth' ? 16 : category === 'vin_bulles' ? 12 : 0,
      sugar: category === 'sirop' ? 600 : category === 'liqueur' ? 250 : 0, acidity: category === 'jus' ? 3 : 0, bitterness: category === 'bitter_arome' ? 4 : 0,
    };
    user.addIngredient(ingredient);
    addIngredient(ingredient);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    try {
      set('image', await compressImage(result.assets[0].uri));
    } catch {
      toast('Photo illisible, essayez-en une autre');
    }
  };

  const save = () => {
    const ingredients: RecipeIngredient[] = rows.map(({ key: _key, amountText, ...row }) => ({ ...row, amount: Number(amountText.replace(',', '.')) || 0 }));
    const problems = [];
    if (!draft.name.trim()) problems.push('Donnez un nom à la recette.');
    if (!ingredients.length) problems.push('Ajoutez au moins un ingrédient.');
    if (ingredients.some((item) => !(item.amount > 0))) problems.push('Chaque ingrédient doit avoir une quantité.');
    setErrors(problems);
    if (problems.length) return;
    const id = draft.id || `perso-${slugify(draft.name)}-${Date.now().toString(36).slice(-4)}`;
    const cocktail: Cocktail = {
      ...draft,
      id,
      name: draft.name.trim(),
      tagline: draft.tagline.trim(),
      ingredients,
      steps: draft.steps.map((step) => step.trim()).filter(Boolean),
      origin: 'perso',
      basedOn: source && catalog.baseById.has(source.id) ? source.id : draft.basedOn,
      source: { label: source && catalog.baseById.has(source.id) ? `Ma version de la recette « ${catalog.baseById.get(source.id)?.name} »` : 'Recette personnelle' },
    };
    user.saveCocktail(cocktail);
    toast('Recette enregistrée');
    if (draft.id) router.back();
    else router.replace({ pathname: '/cocktail/[id]', params: { id } });
  };

  const field = [styles.input, { color: colors.ink, borderColor: colors.line, backgroundColor: colors.surface }];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.line }]}>
        <IconButton name="x" label="Fermer" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <T variant="h3" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>{source ? 'Modifier la recette' : 'Nouvelle recette'}</T>
        <Button label="Enregistrer" size="sm" onPress={save} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {source && catalog.baseById.has(source.id) ? (
            <T variant="small" tone="muted">Vos modifications créent votre version personnelle. La recette d’origine reste récupérable.</T>
          ) : null}

          <View style={styles.photoRow}>
            <Pressable onPress={pickPhoto}>
              <CocktailImage cocktail={draft} style={{ width: 112, height: 112 }} rounded={radius.lg} artScale={0.6} />
              <View style={[styles.photoBadge, { backgroundColor: colors.ink }]}><Icon name="image" size={14} color={colors.bg} /></View>
            </Pressable>
            <View style={{ flex: 1, gap: space.xs }}>
              <TextInput value={draft.name} onChangeText={(text) => set('name', text)} placeholder="Nom du cocktail" placeholderTextColor={colors.muted} style={[...field, styles.nameInput]} />
              <TextInput value={draft.tagline} onChangeText={(text) => set('tagline', text)} placeholder="Accroche (facultatif)" placeholderTextColor={colors.muted} style={field} maxLength={70} />
              {draft.image ? <Pressable onPress={() => set('image', null)}><T variant="tiny" tone="accent">Retirer la photo</T></Pressable> : null}
            </View>
          </View>

          <Section title="Ingrédients">
            {rows.map((row) => {
              const ingredient = catalog.ingredientById.get(row.id);
              return (
                <View key={row.key} style={[styles.ingredientCard, { borderColor: colors.line, backgroundColor: colors.surface }]}>
                  <View style={styles.rowCenter}>
                    <T style={{ fontSize: 18 }}>{ingredient?.emoji ?? '•'}</T>
                    <T variant="h3" style={{ flex: 1 }} numberOfLines={1}>{ingredient?.name ?? row.id}</T>
                    <Pressable accessibilityLabel="Retirer l’ingrédient" hitSlop={8} onPress={() => setRows(rows.filter((item) => item.key !== row.key))}>
                      <Icon name="trash" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                  <View style={styles.rowCenter}>
                    <TextInput value={row.amountText} onChangeText={(text) => setRow(row.key, { amountText: text })} keyboardType="decimal-pad" style={[...field, styles.amount]} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {UNITS.map((unit) => <Chip key={unit} label={unit} selected={row.unit === unit} onPress={() => setRow(row.key, { unit })} />)}
                    </ScrollView>
                  </View>
                  <View style={styles.rowCenter}>
                    <TextInput value={row.note ?? ''} onChangeText={(text) => setRow(row.key, { note: text || undefined })} placeholder="Précision (facultatif)" placeholderTextColor={colors.muted} style={[...field, { flex: 1, minHeight: 38 }]} />
                    <Chip label="Facultatif" selected={!!row.optional} onPress={() => setRow(row.key, { optional: !row.optional || undefined })} />
                  </View>
                </View>
              );
            })}
            <View style={[styles.picker, { borderColor: colors.line, backgroundColor: colors.surface }]}>
              <Icon name="plus" size={18} color={colors.accent} />
              <TextInput value={picker} onChangeText={(text) => { setPicker(text); setNewCategory(null); }} placeholder="Ajouter un ingrédient…" placeholderTextColor={colors.muted} style={[styles.pickerInput, { color: colors.ink }]} autoCorrect={false} />
            </View>
            {picker.trim() ? (
              <View style={[styles.suggestions, { borderColor: colors.line, backgroundColor: colors.surface }]}>
                {suggestions.map((item, index) => (
                  <View key={item.id}>
                    {index ? <Divider /> : null}
                    <Pressable onPress={() => addIngredient(item)} style={styles.suggestion}>
                      <T style={{ fontSize: 16 }}>{item.emoji}</T>
                      <T variant="body" style={{ flex: 1 }}>{item.name}</T>
                    </Pressable>
                  </View>
                ))}
                {suggestions.length ? <Divider /> : null}
                <View style={{ padding: space.sm, gap: space.xs }}>
                  <T variant="small" tone="muted">Créer « {picker.trim()} » dans la catégorie :</T>
                  <View style={styles.wrap}>
                    {CATEGORY_LABELS.map((category) => (
                      <Chip key={category.id} label={category.label} selected={newCategory === category.id} onPress={() => createIngredient(category.id)} />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          </Section>

          <Section title="Préparation">
            <ChipRow values={METHODS} value={draft.method} onChange={(value) => set('method', value as Method)} />
            {draft.steps.map((step, index) => (
              <View key={index} style={styles.rowCenter}>
                <View style={[styles.stepNumber, { backgroundColor: colors.surfaceAlt }]}><T variant="small" style={{ fontWeight: '800' }}>{index + 1}</T></View>
                <TextInput value={step} onChangeText={(text) => set('steps', draft.steps.map((item, i) => (i === index ? text : item)))} placeholder="Étape…" placeholderTextColor={colors.muted} multiline style={[...field, { flex: 1 }]} />
                {draft.steps.length > 1 ? (
                  <Pressable hitSlop={8} accessibilityLabel="Supprimer l’étape" onPress={() => set('steps', draft.steps.filter((_, i) => i !== index))}><Icon name="x" size={18} color={colors.muted} /></Pressable>
                ) : null}
              </View>
            ))}
            <Button label="Ajouter une étape" icon="plus" variant="ghost" size="sm" onPress={() => set('steps', [...draft.steps, ''])} style={{ alignSelf: 'flex-start' }} />
          </Section>

          <Section title="Service">
            <T variant="label" tone="muted">Verre</T>
            <ChipRow values={GLASSES} value={draft.glass} onChange={(value) => set('glass', value)} />
            <T variant="label" tone="muted">Glace</T>
            <ChipRow values={ICES} value={draft.ice} onChange={(value) => set('ice', value)} />
            <TextInput value={draft.garnish} onChangeText={(text) => set('garnish', text)} placeholder="Garniture (zeste, menthe…)" placeholderTextColor={colors.muted} style={field} />
          </Section>

          <Section title="Profil">
            <T variant="label" tone="muted">Famille</T>
            <ChipRow values={FAMILIES} value={draft.family} onChange={(value) => set('family', value as Family)} />
            <T variant="label" tone="muted">Saveurs</T>
            <View style={styles.wrap}>
              {FLAVORS.map((flavor) => (
                <Chip key={flavor} label={flavor} selected={draft.flavors.includes(flavor)} onPress={() => set('flavors', draft.flavors.includes(flavor) ? draft.flavors.filter((item) => item !== flavor) : [...draft.flavors, flavor])} />
              ))}
            </View>
            <T variant="label" tone="muted">Difficulté</T>
            <View style={styles.wrap}>
              {([1, 2, 3] as const).map((level) => <Chip key={level} label={['', 'Facile', 'Modéré', 'Avancé'][level]} selected={draft.difficulty === level} onPress={() => set('difficulty', level)} />)}
            </View>
            <T variant="label" tone="muted">Couleur de la boisson</T>
            <View style={styles.wrap}>
              {COLORS.map((color) => (
                <Pressable key={color} accessibilityLabel={`Couleur ${color}`} onPress={() => set('color', color)} style={[styles.swatch, { backgroundColor: color, borderColor: draft.color === color ? colors.ink : colors.line, borderWidth: draft.color === color ? 3 : 1 }]} />
              ))}
            </View>
          </Section>

          <Section title="Histoire & notes">
            <TextInput value={draft.description} onChangeText={(text) => set('description', text)} placeholder="D’où vient cette recette, pourquoi vous l’aimez…" placeholderTextColor={colors.muted} multiline style={[...field, { minHeight: 96, textAlignVertical: 'top' }]} />
          </Section>

          {errors.length ? (
            <View style={[styles.errors, { backgroundColor: colors.accentSoft }]}>
              {errors.map((error) => <T key={error} variant="small" tone="danger">{error}</T>)}
            </View>
          ) : null}
          <Button label="Enregistrer la recette" icon="check" onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <T variant="h2">{title}</T>
      {children}
    </View>
  );
}

function ChipRow({ values, value, onChange }: { values: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <View style={styles.wrap}>{values.map((item) => <Chip key={item} label={item} selected={value === item} onPress={() => onChange(item)} />)}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', padding: space.md, gap: space.xl },
  photoRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  photoBadge: { position: 'absolute', right: 6, bottom: 6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: space.sm, paddingVertical: 10, fontFamily: fonts.body, fontSize: 16 },
  nameInput: { fontFamily: fonts.display, fontSize: 22 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  ingredientCard: { borderWidth: 1, borderRadius: radius.md, padding: space.sm, gap: space.sm },
  amount: { width: 72, textAlign: 'center' },
  picker: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.md, borderStyle: 'dashed', paddingHorizontal: space.sm, minHeight: 48 },
  pickerInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 10, outlineStyle: 'none' } as object,
  suggestions: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  errors: { borderRadius: radius.md, padding: space.sm, gap: 4 },
});
