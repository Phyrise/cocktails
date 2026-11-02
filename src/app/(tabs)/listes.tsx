import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CocktailRow } from '@/components/cocktail-card';
import { PageHeader } from '@/components/page-header';
import { Button, Divider, Empty, IconButton, Screen, Segmented } from '@/components/ui';
import { space } from '@/constants/theme';
import { useCatalog, useUser } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

type Tab = 'favoris' | 'essayer' | 'notes' | 'perso';

export default function ListsScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { cocktails } = useCatalog();
  const { favorites, toTry, data } = useUser();
  const [tab, setTab] = useState<Tab>('favoris');
  const [appliedTab, setAppliedTab] = useState<string | undefined>();
  if (params.tab !== appliedTab) {
    setAppliedTab(params.tab);
    if (params.tab && ['favoris', 'essayer', 'notes', 'perso'].includes(params.tab)) setTab(params.tab as Tab);
  }

  const lists: Record<Tab, Cocktail[]> = {
    favoris: cocktails.filter((cocktail) => favorites.has(cocktail.id)),
    essayer: cocktails.filter((cocktail) => toTry.has(cocktail.id)),
    notes: cocktails.filter((cocktail) => data.ratings[cocktail.id] || data.notes[cocktail.id])
      .sort((a, b) => (data.ratings[b.id] ?? 0) - (data.ratings[a.id] ?? 0)),
    perso: cocktails.filter((cocktail) => data.custom.some((item) => item.id === cocktail.id)),
  };
  const list = lists[tab];

  const empty = {
    favoris: { icon: 'heart' as const, title: 'Pas encore de favoris', text: 'Touchez le cœur sur une recette pour la retrouver ici.' },
    essayer: { icon: 'bookmark' as const, title: 'Rien à essayer pour l’instant', text: 'Marquez « À essayer » les recettes qui vous tentent.' },
    notes: { icon: 'star' as const, title: 'Aucune note', text: 'Notez les cocktails goûtés : l’app s’en sert pour vous conseiller.' },
    perso: { icon: 'pencil' as const, title: 'Aucune recette personnelle', text: 'Créez vos recettes ou modifiez une recette existante à votre goût.' },
  }[tab];

  return (
    <Screen>
      <PageHeader title="Mes listes" right={<IconButton name="settings" label="Réglages" onPress={() => router.push('/settings')} />} />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'favoris', label: 'Favoris', count: lists.favoris.length },
          { value: 'essayer', label: 'À tester', count: lists.essayer.length },
          { value: 'notes', label: 'Notés', count: lists.notes.length },
          { value: 'perso', label: 'Perso', count: lists.perso.length },
        ]}
      />
      {tab === 'perso' ? <Button label="Créer une recette" icon="plus" style={{ marginTop: space.md }} onPress={() => router.push('/editor')} /> : null}
      <View style={styles.list}>
        {list.length ? list.map((cocktail, index) => (
          <View key={cocktail.id}>
            {index ? <Divider style={{ marginLeft: 84 }} /> : null}
            <CocktailRow cocktail={cocktail} />
          </View>
        )) : <Empty {...empty} />}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.md },
});
