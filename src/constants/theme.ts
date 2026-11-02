import { Platform } from 'react-native';

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  raised: string;
  ink: string;
  inkSoft: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  gold: string;
  ok: string;
  okSoft: string;
  warn: string;
  warnSoft: string;
  danger: string;
  overlay: string;
  tabBar: string;
};

export const light: Palette = {
  bg: '#F8F4EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EAE0',
  raised: '#FFFFFF',
  ink: '#1F1715',
  inkSoft: '#3D3330',
  muted: '#73665F',
  line: '#E6DDD2',
  accent: '#8C2638',
  accentInk: '#FFFFFF',
  accentSoft: '#F5E4E4',
  gold: '#B4822F',
  ok: '#2C7A50',
  okSoft: '#E1F1E7',
  warn: '#A8661A',
  warnSoft: '#F8EAD6',
  danger: '#B3261E',
  overlay: 'rgba(20,12,10,0.55)',
  tabBar: 'rgba(255,255,255,0.96)',
};

export const dark: Palette = {
  bg: '#141011',
  surface: '#1F191A',
  surfaceAlt: '#2A2223',
  raised: '#2A2223',
  ink: '#F6EFEA',
  inkSoft: '#E2D7D1',
  muted: '#A99C95',
  line: '#3A3032',
  accent: '#E57F8F',
  accentInk: '#1A0F11',
  accentSoft: '#3A2228',
  gold: '#E0B464',
  ok: '#62C48E',
  okSoft: '#1C3326',
  warn: '#E6B062',
  warnSoft: '#3A2C18',
  danger: '#F2867D',
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: 'rgba(31,25,26,0.97)',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: Platform.select({
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ios: 'System',
    default: 'sans-serif',
  }) as string,
};

export const radius = { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 28, xxl: 40 } as const;
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 33 },
  h2: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26 },
  h3: { fontFamily: fonts.body, fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19 },
  tiny: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
};

/** Largeur maximale du contenu sur tablette et ordinateur. */
export const MAX_WIDTH = 640;
