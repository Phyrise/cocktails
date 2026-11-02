import Constants from 'expo-constants';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Chip, Divider, Screen, Segmented, T } from '@/components/ui';
import { fonts, radius, space } from '@/constants/theme';
import { normalize } from '@/lib/cocktails';
import { FLAVORS } from '@/lib/filters';
import { databaseFile, defaultDbUrl, isNewerVersion, parseDatabaseFile, prefetchImages } from '@/lib/database';
import { ask, confirm } from '@/lib/dialogs';
import { pickJsonFile, saveJsonFile } from '@/lib/files';
import { emptyUserData, mergeUserData, parseBackupFile, type ThemeChoice, useCatalog, useTheme, useUser } from '@/state/store';
import type { MeasurementUnit } from '@/types/cocktail';

const today = () => new Date().toISOString().slice(0, 10);

export default function SettingsScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const catalog = useCatalog();
  const user = useUser();
  const { settings } = user.data;
  const [busy, setBusy] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState<string | null>(null);
  const db = catalog.db;
  const [avoidQuery, setAvoidQuery] = useState('');
  const avoidMatches = avoidQuery.trim()
    ? catalog.ingredients.filter((item) => !user.data.avoid.includes(item.id) && normalize(item.name).includes(normalize(avoidQuery.trim()))).slice(0, 8)
    : [];

  const run = async (key: string, task: () => Promise<void>) => {
    setBusy(key);
    try {
      await task();
    } catch (error) {
      toast((error as Error).message || 'Une erreur est survenue');
    } finally {
      setBusy(null);
    }
  };

  const checkUpdate = () => run('check', async () => {
    const version = await catalog.checkForUpdate();
    if (db?.source === 'file' && version !== db.version) toast('Base importée : « Retélécharger » pour revenir à la base publiée');
    else toast(isNewerVersion(version, db) ? 'Une nouvelle version est disponible' : 'Votre base est à jour');
  });

  const update = () => run('update', async () => {
    const fresh = await catalog.downloadLatest();
    toast(`Base mise à jour : ${fresh.cocktails.length} recettes`);
  });

  const downloadImages = () => run('images', async () => {
    if (!db) return;
    const result = await prefetchImages(db, (done, total) => setImageProgress(`${done}/${total}`));
    setImageProgress(null);
    toast(result.failed ? `${result.total - result.failed} photos enregistrées, ${result.failed} en échec` : `${result.total} photos disponibles hors ligne`);
  });

  const importAny = () => run('import', async () => {
    const data = await pickJsonFile();
    if (!data) return;
    const importedDb = parseDatabaseFile(data, db?.imageBase ?? defaultDbUrl());
    if (importedDb) {
      if (!(await confirm('Remplacer la base ?', `Le fichier contient ${importedDb.cocktails.length} recettes (version ${importedDb.version}). Vos favoris, notes et créations sont conservés.`, 'Remplacer'))) return;
      await catalog.replaceDatabase(importedDb);
      toast('Base importée');
      return;
    }
    const backup = parseBackupFile(data);
    if (backup) {
      const choice = await ask('Importer la sauvegarde', 'Fusionner ajoute le contenu du fichier à vos données actuelles (rien n’est perdu). Remplacer efface vos données actuelles.', [
        { label: 'Fusionner', value: 'merge', tone: 'primary' },
        { label: 'Remplacer', value: 'replace', tone: 'danger' },
      ]);
      if (!choice) return;
      user.replaceUserData(choice === 'replace' ? backup : mergeUserData(user.data, backup));
      toast(choice === 'replace' ? 'Données remplacées' : 'Données fusionnées');
      return;
    }
    throw new Error('Ce fichier n’est ni une base ni une sauvegarde Arturo et Clémentine.');
  });

  const isIos = Platform.OS === 'web' && /iPhone|iPad|iPod/.test(globalThis.navigator?.userAgent ?? '');
  const standalone = Platform.OS === 'web' && (globalThis.matchMedia?.('(display-mode: standalone)').matches || (globalThis.navigator as Navigator & { standalone?: boolean })?.standalone);

  return (
    <Screen>
      <PageHeader title="Réglages" back />

      <Group title="Affichage">
        <Line icon="glass" label="Unité des doses">
          <View style={{ width: 160 }}>
            <Segmented<MeasurementUnit> value={settings.unit} onChange={(unit) => user.updateSettings({ unit })} options={[{ value: 'ml', label: 'ml' }, { value: 'cl', label: 'cl' }, { value: 'oz', label: 'oz' }]} />
          </View>
        </Line>
        <Divider />
        <Line icon="moon" label="Thème">
          <View style={{ width: 200 }}>
            <Segmented<ThemeChoice> value={settings.theme} onChange={(theme) => user.updateSettings({ theme })} options={[{ value: 'auto', label: 'Auto' }, { value: 'light', label: 'Clair' }, { value: 'dark', label: 'Sombre' }]} />
          </View>
        </Line>
        <Divider />
        <Line icon="check" label="Basiques toujours disponibles" hint="Eau, eau gazeuse, sucre, sel et poivre comptent comme présents dans votre bar.">
          <Switch value={settings.assumeBasics} onValueChange={(assumeBasics) => user.updateSettings({ assumeBasics })} trackColor={{ true: colors.ok, false: colors.line }} />
        </Line>
      </Group>

      <Group title="Mes goûts">
        <T variant="small" tone="muted">Les saveurs choisies font remonter les recettes correspondantes dans « Pour vous » et le tri « Mes goûts ».</T>
        <View style={styles.wrap}>
          {FLAVORS.map((flavor) => (
            <Chip key={flavor} label={flavor} selected={user.data.likedFlavors.includes(flavor)} onPress={() => user.toggleLikedFlavor(flavor)} />
          ))}
        </View>
        <Divider />
        <T variant="body" style={{ fontWeight: '600' }}>Ingrédients à éviter</T>
        <T variant="small" tone="muted">Allergie, aversion… Les recettes qui en contiennent disparaissent des suggestions et de la liste (la recherche les trouve encore).</T>
        {user.data.avoid.length ? (
          <View style={styles.wrap}>
            {user.data.avoid.map((id) => (
              <Chip key={id} label={catalog.ingredientById.get(id)?.name ?? id} icon="x" selected onPress={() => user.toggleAvoid(id)} />
            ))}
          </View>
        ) : null}
        <View style={[styles.search, { borderColor: colors.line, backgroundColor: colors.bg }]}>
          <Icon name="search" size={17} color={colors.muted} />
          <TextInput value={avoidQuery} onChangeText={setAvoidQuery} placeholder="Ajouter un ingrédient à éviter" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.ink }]} autoCorrect={false} />
        </View>
        {avoidMatches.length ? (
          <View style={styles.wrap}>
            {avoidMatches.map((item) => (
              <Chip key={item.id} label={item.name} icon="plus" onPress={() => { user.toggleAvoid(item.id); setAvoidQuery(''); }} />
            ))}
          </View>
        ) : null}
      </Group>

      <Group title="Base de recettes">
        <View style={{ gap: 2 }}>
          <T variant="h3">{catalog.cocktails.length} recettes · {db?.cocktails.filter((cocktail) => cocktail.image).length ?? 0} photos</T>
          <T variant="small" tone="muted">Version {db?.version ?? '—'}{db ? ` · ${new Date(db.generatedAt).toLocaleDateString('fr-FR')}` : ''}{db?.source === 'file' ? ' · importée d’un fichier' : ''}</T>
          {catalog.updateAvailable ? <T variant="small" tone="accent" style={{ fontWeight: '700' }}>Nouvelle version disponible : {catalog.remoteVersion}</T> : null}
        </View>
        {catalog.updateAvailable ? (
          <Button label={catalog.progress ? catalog.progress.label : 'Mettre à jour la base'} icon="download" loading={busy === 'update'} onPress={update} />
        ) : (
          <Button label="Rechercher une mise à jour" icon="refresh" variant="secondary" loading={busy === 'check'} onPress={checkUpdate} />
        )}
        {catalog.updateAvailable ? null : <Button label="Retélécharger la base" icon="download" variant="ghost" size="sm" loading={busy === 'update'} onPress={update} />}
        <Divider />
        <Line icon="refresh" label="Mise à jour automatique" hint="À l’ouverture, installe la dernière base publiée. Vos données personnelles ne changent pas.">
          <Switch value={settings.autoUpdate} onValueChange={(autoUpdate) => user.updateSettings({ autoUpdate })} trackColor={{ true: colors.ok, false: colors.line }} />
        </Line>
        <Divider />
        <T variant="small" tone="muted">Les photos s’enregistrent au fil de la navigation. Pour tout avoir hors ligne d’un coup (≈ {db ? Math.round(db.cocktails.filter((cocktail) => cocktail.image).length * 13 / 100) / 10 : 2} Mo) :</T>
        <Button label={imageProgress ? `Photos ${imageProgress}` : 'Télécharger toutes les photos'} icon="image" variant="secondary" loading={busy === 'images'} onPress={downloadImages} />
      </Group>

      <Group title="Importer et exporter">
        <T variant="small" tone="muted">Un seul bouton pour importer : l’app reconnaît une base de recettes ou une sauvegarde de vos données.</T>
        <Button label="Importer un fichier" icon="upload" loading={busy === 'import'} onPress={importAny} />
        <Button label="Exporter mes données" icon="download" variant="secondary" onPress={() => run('backup', () => saveJsonFile(`arturo-clementine-sauvegarde-${today()}.json`, user.backupFile()))} />
        <Button label="Exporter la base" icon="database" variant="secondary" onPress={() => run('export', async () => { if (db) await saveJsonFile(`arturo-clementine-base-${db.version}.json`, databaseFile(db)); })} />
        <T variant="tiny" tone="muted">« Mes données » : bar, favoris, notes, listes et recettes personnelles, pour les transférer vers un autre téléphone. « La base » : toutes les recettes, pour les partager sans connexion.</T>
      </Group>

      {Platform.OS === 'web' && !standalone ? (
        <Group title="Installer l’app">
          {isIos ? (
            <T variant="small">Dans Safari, touchez <T variant="small" style={{ fontWeight: '700' }}>Partager</T> puis <T variant="small" style={{ fontWeight: '700' }}>Sur l’écran d’accueil</T>. L’app s’ouvrira en plein écran et fonctionnera hors ligne.</T>
          ) : (
            <T variant="small">Dans Chrome, ouvrez le menu (les trois points) puis <T variant="small" style={{ fontWeight: '700' }}>Installer l’application</T> (ou « Ajouter à l’écran d’accueil »). L’app fonctionnera ensuite hors ligne.</T>
          )}
        </Group>
      ) : null}

      <Group title="Zone sensible">
        <Button
          label="Effacer toutes mes données"
          icon="trash"
          variant="danger"
          onPress={async () => {
            if (await confirm('Tout effacer ?', 'Bar, favoris, notes, listes et recettes personnelles seront supprimés de cet appareil. Pensez à exporter une sauvegarde avant.', 'Tout effacer')) {
              user.replaceUserData({ ...emptyUserData(), settings: user.data.settings });
              toast('Données effacées');
            }
          }}
        />
      </Group>

      <View style={styles.about}>
        <T variant="h3" tone="accent">Arturo et Clémentine</T>
        <T variant="tiny" tone="muted" style={{ textAlign: 'center' }}>
          Version {Constants.expoConfig?.version ?? '2'} · Recettes : sélection de Clément, spécifications IBA et classiques reformulés · Photos : TheCocktailDB · Icônes : Lucide · Police : Fraunces
        </T>
        <T variant="tiny" tone="muted" style={{ textAlign: 'center' }}>À consommer avec modération.</T>
      </View>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: space.lg, gap: space.xs }}>
      <T variant="label" tone="muted" style={{ marginLeft: 4 }}>{title}</T>
      <Card style={{ gap: space.sm }}>{children}</Card>
    </View>
  );
}

function Line({ icon, label, hint, children }: { icon: IconName; label: string; hint?: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Pressable style={styles.line}>
      <View style={[styles.lineIcon, { backgroundColor: colors.surfaceAlt }]}><Icon name={icon} size={17} color={colors.ink} /></View>
      <View style={{ flex: 1 }}>
        <T variant="body" style={{ fontWeight: '600' }}>{label}</T>
        {hint ? <T variant="tiny" tone="muted">{hint}</T> : null}
      </View>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  lineIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  about: { alignItems: 'center', gap: 4, marginTop: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.sm, minHeight: 44 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 16, paddingVertical: 8, outlineStyle: 'none' } as object,
});
