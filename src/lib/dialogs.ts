import { Alert, Platform } from 'react-native';

/** Demande une confirmation (fenêtre native sur mobile, `confirm()` sur le web où `Alert` n'existe pas). */
export function confirm(title: string, message: string, confirmLabel = 'Confirmer'): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ?? false);
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
