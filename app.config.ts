import type { ConfigContext, ExpoConfig } from 'expo/config';

// Le site GitHub Pages est servi sous un sous-dossier (https://phyrise.github.io/cocktails/).
// `EXPO_BASE_URL=/cocktails pnpm build:web` ; vide en développement.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? '',
  },
});
