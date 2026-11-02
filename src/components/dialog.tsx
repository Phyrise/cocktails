import { type PropsWithChildren, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, T } from '@/components/ui';
import { radius, space } from '@/constants/theme';
import { registerDialog, type DialogRequest } from '@/lib/dialogs';
import { useTheme } from '@/state/store';

/** Boîte de dialogue de l'app (confirmations, choix à plusieurs boutons), à la place de `confirm()` du navigateur. */
export function DialogProvider({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  const [request, setRequest] = useState<DialogRequest | null>(null);

  // Une nouvelle demande annule celle déjà ouverte (double toucher), pour qu'aucune promesse ne reste en attente.
  useEffect(() => registerDialog((next) => setRequest((current) => {
    current?.resolve(null);
    return next;
  })), []);

  const close = (value: string | null) => {
    request?.resolve(value);
    setRequest(null);
  };

  return (
    <>
      {children}
      <Modal visible={!!request} transparent animationType="fade" onRequestClose={() => close(null)}>
        <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => close(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.line }]} onPress={() => undefined}>
            <T variant="h2">{request?.title}</T>
            {request?.message ? <T variant="body" tone="inkSoft">{request.message}</T> : null}
            <View style={styles.actions}>
              {request?.actions.map((action) => (
                <Button key={action.value} label={action.label} variant={action.tone ?? 'secondary'} onPress={() => close(action.value)} />
              ))}
              <Button label="Annuler" variant="ghost" onPress={() => close(null)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  sheet: { width: '100%', maxWidth: 420, borderRadius: radius.xl, borderWidth: 1, padding: space.lg, gap: space.sm },
  actions: { gap: space.xs, marginTop: space.sm },
});
