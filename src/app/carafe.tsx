import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { CocktailImage } from '@/components/cocktail-image';
import { Icon } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Divider, Empty, Screen, Segmented, T } from '@/components/ui';
import { radius, space } from '@/constants/theme';
import { batchPlan, deName, formatAmount, methodDilution } from '@/lib/cocktails';
import { useCatalog, useTheme, useUser } from '@/state/store';
import type { MeasurementUnit } from '@/types/cocktail';

const MIN = 2;
const MAX = 60;

/** Un cocktail préparé à l'avance pour plusieurs verres : doses, eau de dilution, contenant, service. */
export default function CarafeScreen() {
  const params = useLocalSearchParams<{ id: string; glasses?: string }>();
  const { colors } = useTheme();
  const catalog = useCatalog();
  const user = useUser();
  const toast = useToast();
  const cocktail = catalog.byId.get(params.id ?? '');
  const [glasses, setGlasses] = useState(() => Math.max(MIN, Math.min(MAX, Number(params.glasses) || 8)));
  // Remué : on dilue d'avance et on sert directement. Shaker : on garde l'eau pour le shaker, sauf choix contraire.
  const [dilute, setDilute] = useState(cocktail?.method === 'Verre à mélange');

  if (!cocktail) {
    return (
      <Screen>
        <PageHeader title="Carafe" back />
        <Empty icon="search" title="Recette introuvable" action="Retour aux cocktails" onAction={() => router.replace('/recettes')} />
      </Screen>
    );
  }

  const unit = user.data.settings.unit;
  const plan = batchPlan(cocktail, catalog.ingredientById, glasses, unit, dilute);
  const dilution = methodDilution(cocktail);
  const ml = (amount: number) => formatAmount({ id: '', amount: amount >= 100 ? Math.round(amount / 5) * 5 : Math.round(amount), unit: 'ml' }, unit);
  const liters = (amount: number) => `${(amount / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} L`;
  const inParty = user.data.party.some((entry) => entry.id === cocktail.id);

  const list = (lines: typeof plan.atService) => lines.map((line) => `${line.perGlass} ${deName(line.name.toLowerCase())}`).join(', ');
  const extras = plan.atService.filter((line) => !line.sparkling);
  const bubbles = plan.atService.filter((line) => line.sparkling);
  const serving: string[] = [];
  // Œuf, crème, herbes… : au shaker, ils imposent de secouer chaque portion, même si la carafe est diluée.
  if (cocktail.method === 'Shaker' && (!dilute || extras.length)) {
    serving.push(`Pour chaque verre : ${ml(plan.perGlassMl)} de mélange dans le shaker${extras.length ? ` avec ${list(extras)}` : ''} et de la glace, secouez, puis filtrez.`);
    serving.push('Astuce : on peut secouer 2 ou 3 portions à la fois dans un grand shaker.');
  } else if (cocktail.method === 'Blender') {
    serving.push(`Mixez la base par 2 à 4 portions avec de la glace (${ml(plan.perGlassMl)} de base${extras.length ? ` et ${list(extras)}` : ''} par verre).`);
  } else if (dilute) {
    serving.push('Gardez la carafe au réfrigérateur au moins 2 heures (ou 1 heure au congélateur pour une recette sans jus).');
    serving.push(`Versez ${ml(plan.perGlassMl)} par verre${cocktail.ice === 'Sans glace' ? ', bien froid' : ` (${cocktail.ice.toLowerCase()})`} : c’est prêt, sans shaker ni cuillère.`);
  } else {
    serving.push(`Remplissez les verres de glace (${cocktail.ice.toLowerCase()}) puis versez ${ml(plan.perGlassMl)} de mélange par verre.`);
  }
  if (extras.length && cocktail.method !== 'Shaker' && cocktail.method !== 'Blender') serving.unshift(`Dans chaque verre, avant de verser : ${list(extras)}.`);
  if (bubbles.length) serving.push(`Complétez chaque verre avec ${list(bubbles)}.`);
  if (cocktail.garnish) serving.push(`Garniture : ${cocktail.garnish}.`);

  return (
    <Screen>
      <PageHeader eyebrow="En carafe" title={cocktail.name} subtitle="Tout préparer à l’avance, servir en quelques secondes." back />

      <Card style={{ gap: space.sm }}>
        <View style={styles.row}>
          <CocktailImage cocktail={cocktail} style={styles.thumb} rounded={radius.sm} artScale={0.7} />
          <View style={{ flex: 1 }}>
            <T variant="h3">Verres</T>
            <T variant="tiny" tone="muted">{cocktail.method} · {cocktail.glass}</T>
          </View>
          <View style={styles.stepper}>
            <Pressable accessibilityLabel="Moins de verres" onPress={() => setGlasses(Math.max(MIN, glasses - 1))} style={[styles.stepButton, { borderColor: colors.line }]}>
              <Icon name="minus" size={16} color={colors.ink} />
            </Pressable>
            <T variant="h2" style={{ minWidth: 36, textAlign: 'center' }}>{glasses}</T>
            <Pressable accessibilityLabel="Plus de verres" onPress={() => setGlasses(Math.min(MAX, glasses + 1))} style={[styles.stepButton, { borderColor: colors.line }]}>
              <Icon name="plus" size={16} color={colors.ink} />
            </Pressable>
          </View>
        </View>
        {dilution ? (
          <>
            <Divider />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <T variant="body" style={{ fontWeight: '600' }}>Diluer à l’avance</T>
                <T variant="tiny" tone="muted">
                  Ajoute l’eau que la glace apporterait ({Math.round(dilution * 100)} %) : la carafe se sert telle quelle, bien froide.
                </T>
              </View>
              <Switch value={dilute} onValueChange={setDilute} trackColor={{ true: colors.ok, false: colors.line }} />
            </View>
          </>
        ) : null}
        <View style={{ alignSelf: 'flex-end', width: 150 }}>
          <Segmented<MeasurementUnit> value={unit} onChange={(next) => user.updateSettings({ unit: next })} options={[{ value: 'ml', label: 'ml' }, { value: 'cl', label: 'cl' }, { value: 'oz', label: 'oz' }]} />
        </View>
      </Card>

      <View style={styles.section}>
        <T variant="h2">Dans la carafe</T>
        <Card style={{ paddingVertical: space.xs }}>
          {plan.batch.map((line, index) => (
            <View key={line.id}>
              {index ? <Divider /> : null}
              <View style={styles.line}>
                <T variant="body" style={{ flex: 1, fontWeight: '600' }}>{line.name}</T>
                <T variant="body" style={{ fontWeight: '700' }}>{line.text}</T>
              </View>
            </View>
          ))}
          {plan.waterMl ? (
            <>
              <Divider />
              <View style={styles.line}>
                <View style={{ flex: 1 }}>
                  <T variant="body" style={{ fontWeight: '600' }}>Eau fraîche</T>
                  <T variant="tiny" tone="muted">Remplace la fonte de la glace</T>
                </View>
                <T variant="body" style={{ fontWeight: '700' }}>{ml(plan.waterMl)}</T>
              </View>
            </>
          ) : null}
          <View style={[styles.total, { backgroundColor: colors.surfaceAlt }]}>
            <Icon name="carafe" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <T variant="h3">≈ {liters(plan.totalMl)} au total</T>
              <T variant="small" tone="muted">Prévoir {plan.container}, soit {ml(plan.perGlassMl)} par verre.</T>
            </View>
          </View>
        </Card>
      </View>

      {plan.atService.length ? (
        <View style={styles.section}>
          <T variant="h2">Au moment de servir</T>
          <Card style={{ paddingVertical: space.xs }}>
            {plan.atService.map((line, index) => (
              <View key={line.id}>
                {index ? <Divider /> : null}
                <View style={styles.line}>
                  <View style={{ flex: 1 }}>
                    <T variant="body" style={{ fontWeight: '600' }}>{line.name}</T>
                    <T variant="tiny" tone="muted">{line.perGlass} par verre</T>
                  </View>
                  <T variant="body" style={{ fontWeight: '700' }}>{line.total}</T>
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <T variant="h2">Service</T>
        <View style={{ gap: space.sm }}>
          {serving.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}><T variant="small" style={{ color: colors.accentInk, fontWeight: '800' }}>{index + 1}</T></View>
              <T variant="body" style={{ flex: 1 }}>{step}</T>
            </View>
          ))}
        </View>
      </View>

      {plan.warnings.length ? (
        <Card style={[styles.warnings, { backgroundColor: colors.warnSoft, borderColor: colors.warnSoft }]}>
          {plan.warnings.map((warning) => (
            <View key={warning} style={styles.row}>
              <Icon name="info" size={18} color={colors.warn} />
              <T variant="small" style={{ flex: 1 }}>{warning}</T>
            </View>
          ))}
        </Card>
      ) : null}

      <View style={styles.section}>
        <Button
          label={inParty ? `Mettre ${glasses} verres dans ma soirée` : `Ajouter à ma soirée (${glasses} verres)`}
          icon="users"
          variant="secondary"
          onPress={() => {
            if (!inParty) user.addToParty(cocktail.id);
            user.setPartyGlasses(cocktail.id, glasses);
            toast(`Soirée : ${glasses} verres de ${cocktail.name}`);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  thumb: { width: 48, height: 48 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: space.lg, gap: space.sm },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  total: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.md, padding: space.sm, marginVertical: space.xs },
  step: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  stepNumber: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  warnings: { gap: space.sm, marginTop: space.lg },
});
