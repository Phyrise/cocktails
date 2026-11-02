import { useEffect } from 'react';

type WakeLockSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> } };

/** Garde l'écran allumé tant que le composant est affiché (Screen Wake Lock API, Chrome et Safari récents). */
export function useKeepScreenOn() {
  useEffect(() => {
    const nav = globalThis.navigator as WakeLockNavigator | undefined;
    if (!nav?.wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    let active = true;
    const request = async () => {
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (active) sentinel = lock;
        else await lock.release();
      } catch {
        // Refus (batterie faible, onglet masqué) : l'écran suivra simplement son réglage habituel.
      }
    };
    // Le verrou saute quand l'app passe en arrière-plan : on le reprend au retour.
    const onVisible = () => {
      if (document.visibilityState === 'visible') request();
    };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => undefined);
    };
  }, []);
}
