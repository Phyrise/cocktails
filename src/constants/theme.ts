import { Platform } from 'react-native';

export const palette = {
  ink: '#1B1210',
  cream: '#F7F0E5',
  paper: '#FFF9F0',
  wine: '#7B1E32',
  wineDark: '#501221',
  orange: '#D66A35',
  gold: '#D6A95F',
  sage: '#75806A',
  muted: '#7B6F69',
  line: '#E8DCCE',
  white: '#FFFFFF',
  success: '#426B52',
} as const;

export const fonts = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'sans-serif' }),
};

export const radius = { sm: 10, md: 18, lg: 28, pill: 999 } as const;
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;

// Compatibilité avec quelques composants utilitaires conservés du template Expo.
export const Colors = {
  light: { text: palette.ink, background: palette.cream, backgroundElement: palette.paper, backgroundSelected: '#F0E1D2', textSecondary: palette.muted },
  dark: { text: palette.cream, background: palette.ink, backgroundElement: palette.wineDark, backgroundSelected: palette.wine, textSecondary: '#D8C6BE' },
} as const;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export const Fonts = { sans: fonts.body, serif: fonts.display, rounded: fonts.body, mono: 'monospace' } as const;
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = 80;
export const MaxContentWidth = 800;
