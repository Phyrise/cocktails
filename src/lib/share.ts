import Constants from 'expo-constants';
import { Platform, Share } from 'react-native';

const PUBLIC_SITE = 'https://phyrise.github.io/cocktails';

/** Adresse publique d'une page de l'app (celle du site en cours sur le web, le site publié ailleurs). */
export function siteUrl(path: string) {
  if (Platform.OS === 'web' && globalThis.location) {
    const base = (Constants.expoConfig?.experiments?.baseUrl ?? '').replace(/\/$/, '');
    return `${globalThis.location.origin}${base}${path}`;
  }
  return `${PUBLIC_SITE}${path}`;
}

export const cocktailUrl = (id: string) => siteUrl(`/cocktail/${encodeURIComponent(id)}`);

export type ShareResult = 'shared' | 'copied' | 'unavailable' | 'cancelled';

/**
 * Ouvre la feuille de partage du téléphone (WhatsApp, SMS…) ; sur ordinateur, copie le texte.
 */
export async function shareText(text: string, title?: string): Promise<ShareResult> {
  try {
    if (Platform.OS !== 'web') {
      const result = await Share.share({ message: text, title });
      return result.action === Share.dismissedAction ? 'cancelled' : 'shared';
    }
    const nav = globalThis.navigator as Navigator | undefined;
    const touch = globalThis.matchMedia?.('(pointer: coarse)').matches;
    if (touch && nav?.share) {
      await nav.share({ title, text });
      return 'shared';
    }
    if (!nav?.clipboard) return 'unavailable';
    await nav.clipboard.writeText(text);
    return 'copied';
  } catch {
    // Feuille de partage fermée sans choisir d'application.
    return 'cancelled';
  }
}
