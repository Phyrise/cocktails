import { Alert, Platform } from 'react-native';

export type DialogAction = { label: string; value: string; tone?: 'primary' | 'secondary' | 'danger' };
export type DialogRequest = { title: string; message?: string; actions: DialogAction[]; resolve: (value: string | null) => void };

let show: ((request: DialogRequest) => void) | null = null;

/** Branché par `DialogProvider` ; renvoie la fonction de débranchement. */
export function registerDialog(handler: (request: DialogRequest) => void) {
  show = handler;
  return () => {
    if (show === handler) show = null;
  };
}

/** Propose plusieurs choix ; renvoie la valeur choisie, ou null si l'utilisateur annule. */
export function ask(title: string, message: string, actions: DialogAction[]): Promise<string | null> {
  if (show) {
    const handler = show;
    return new Promise((resolve) => handler({ title, message, actions, resolve }));
  }
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}`) ? actions[0]?.value ?? null : null);
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
      ...actions.map((action) => ({ text: action.label, style: action.tone === 'danger' ? 'destructive' as const : 'default' as const, onPress: () => resolve(action.value) })),
    ]);
  });
}

/** Demande une confirmation simple. */
export async function confirm(title: string, message: string, confirmLabel = 'Confirmer'): Promise<boolean> {
  return (await ask(title, message, [{ label: confirmLabel, value: 'ok', tone: 'danger' }])) === 'ok';
}
