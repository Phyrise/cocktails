import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { openCocktail, useArchive } from '@/components/cocktail-card';
import { CocktailImage } from '@/components/cocktail-image';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/components/toast';
import { Button, Card, Empty, Screen, T } from '@/components/ui';
import { space } from '@/constants/theme';
import { confirm } from '@/lib/dialogs';
import { useCatalog, useTheme, useUser } from '@/state/store';

/** Recettes archivées : consultables, restaurables une à une ou toutes ensemble. */
export default function ArchivesScreen() {
  const { colors } = useTheme();
  const { archived } = useCatalog();
  const user = useUser();
  const toast = useToast();
  const { restore } = useArchive();
  // Ids archivés qui n'existent plus dans la base (recette retirée) : on les nettoie avec « Tout restaurer ».
  const allIds = user.data.archived;

  return (
    <Screen>
      <PageHeader
        title="Archivées"
        subtitle={archived.length ? `${archived.length} recette${archived.length > 1 ? 's' : ''} masquée${archived.length > 1 ? 's' : ''} partout dans l’app` : undefined}
        back
      />

      {archived.length ? (
        <>
          <Card style={{ gap: 0, paddingVertical: space.xs }}>
            {archived.map((cocktail, index) => (
              <View key={cocktail.id} style={[styles.row, index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
                <Pressable accessibilityRole="button" onPress={() => openCocktail(cocktail.id)} style={({ pressed }) => [styles.open, { opacity: pressed ? 0.6 : 1 }]}>
                  <CocktailImage cocktail={cocktail} style={styles.image} rounded={10} artScale={0.6} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T variant="h3" numberOfLines={1}>{cocktail.name}</T>
                    <T variant="small" tone="muted" numberOfLines={1}>{cocktail.family}</T>
                  </View>
                </Pressable>
                <Button label="Restaurer" icon="restore" size="sm" variant="secondary" onPress={() => restore(cocktail)} />
              </View>
            ))}
          </Card>
          <View style={{ marginTop: space.md }}>
            <Button
              label="Tout restaurer"
              icon="restore"
              variant="ghost"
              onPress={async () => {
                if (!(await confirm('Tout restaurer ?', `Les ${archived.length} recettes archivées réapparaîtront dans l’app.`, 'Restaurer'))) return;
                user.setArchived(allIds, false);
                toast('Toutes les recettes sont de retour');
              }}
            />
          </View>
          <T variant="tiny" tone="muted" style={{ textAlign: 'center', marginTop: space.sm }}>
            Pour archiver : appui long sur une recette, ou l’icône d’archive en haut de sa fiche.
          </T>
        </>
      ) : (
        <Empty
          icon="archive"
          title="Aucune recette archivée"
          text="Appui long sur une recette (ou l’icône d’archive en haut de sa fiche) pour la masquer. Elle reste récupérable ici."
          action="Voir les cocktails"
          onAction={() => router.replace('/recettes')}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.xs },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, minWidth: 0 },
  image: { width: 52, height: 52 },
});
