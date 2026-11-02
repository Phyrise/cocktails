import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { imageUri } from '@/lib/database';
import { useCatalog, useTheme } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

// Silhouettes de verres (viewBox 100 × 120) : contour, liquide et accessoires.
type Glass = { outline: string; liquid: string; extra?: string[] };
const glasses: Record<string, Glass> = {
  Coupe: { outline: 'M18 34 Q50 74 82 34 Z', liquid: 'M23 40 Q50 70 77 40 Z', extra: ['M50 62 V100', 'M34 102 H66'] },
  Martini: { outline: 'M16 26 H84 L50 64 Z', liquid: 'M24 33 H76 L50 60 Z', extra: ['M50 64 V100', 'M34 102 H66'] },
  'Old fashioned': { outline: 'M26 44 H74 L71 102 H29 Z', liquid: 'M28 62 H72 L70 99 H30 Z' },
  Highball: { outline: 'M33 14 H67 L65 104 H35 Z', liquid: 'M34 34 H66 L64 101 H36 Z' },
  Flûte: { outline: 'M40 10 Q37 48 43 62 Q50 70 57 62 Q63 48 60 10 Z', liquid: 'M40.5 24 Q38.5 49 44 60 Q50 66 56 60 Q61.5 49 59.5 24 Z', extra: ['M50 67 V100', 'M37 102 H63'] },
  'Verre à vin': { outline: 'M30 16 Q25 58 50 64 Q75 58 70 16 Z', liquid: 'M28.5 36 Q28 58 50 61 Q72 58 71.5 36 Z', extra: ['M50 64 V100', 'M34 102 H66'] },
  Tiki: { outline: 'M32 14 H68 L66 104 H34 Z', liquid: 'M33 30 H67 L65 101 H35 Z', extra: ['M40 50 h20', 'M41 72 h18'] },
  Hurricane: { outline: 'M36 12 Q28 40 40 58 Q30 80 38 100 H62 Q70 80 60 58 Q72 40 64 12 Z', liquid: 'M34 32 Q30 44 41 58 Q32 80 39 97 H61 Q68 80 59 58 Q70 44 66 32 Z', extra: ['M38 104 H62'] },
  'Mug cuivre': { outline: 'M24 30 H68 L66 102 H26 Z', liquid: 'M25 44 H67 L65.5 99 H26.5 Z', extra: ['M68 44 Q86 46 84 66 Q82 84 66 84'] },
  Tasse: { outline: 'M22 46 H70 Q70 98 46 98 Q22 98 22 46 Z', liquid: 'M24 54 H68 Q67 94 46 95 Q25 94 24 54 Z', extra: ['M70 56 Q86 58 82 72 Q78 82 66 80', 'M16 104 H76'] },
  Shot: { outline: 'M36 62 H64 L61 102 H39 Z', liquid: 'M37 70 H63 L60.5 99 H39.5 Z' },
  Pinte: { outline: 'M30 12 H70 L64 104 H36 Z', liquid: 'M31 28 H69 L63.5 101 H36.5 Z' },
  Julep: { outline: 'M28 32 H72 L70 104 H30 Z', liquid: 'M29 46 H71 L69 101 H31 Z', extra: ['M52 18 L60 6', 'M46 26 Q52 20 58 26'] },
};

export function GlassArt({ glass, color, size }: { glass: string; color: string; size: number }) {
  const { colors } = useTheme();
  const shape = glasses[glass] ?? glasses['Old fashioned'];
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Path d={shape.liquid} fill={color} opacity={0.92} />
      <Path d={shape.outline} fill="none" stroke={colors.ink} strokeOpacity={0.55} strokeWidth={2.4} strokeLinejoin="round" />
      {shape.extra?.map((d) => <Path key={d} d={d} fill="none" stroke={colors.ink} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />)}
      <Circle cx={62} cy={shape === glasses.Shot ? 80 : 50} r={3} fill="#FFFFFF" opacity={0.45} />
    </Svg>
  );
}

type Props = { cocktail: Cocktail; style?: ViewStyle; rounded?: number; artScale?: number };

/** Photo du cocktail, ou illustration de son verre teintée à sa couleur quand il n'y a pas de photo. */
export function CocktailImage({ cocktail, style, rounded = 16, artScale = 0.6 }: Props) {
  const { db } = useCatalog();
  const { scheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [box, setBox] = useState(0);
  const uri = imageUri(cocktail.image, db);
  const tint = `${cocktail.color}${scheme === 'dark' ? '33' : '29'}`;
  return (
    <View
      onLayout={(event) => setBox(Math.min(event.nativeEvent.layout.width, event.nativeEvent.layout.height))}
      style={[styles.frame, { borderRadius: rounded, backgroundColor: tint }, style]}>
      {uri && !failed ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} onError={() => setFailed(true)} accessibilityLabel={cocktail.name} />
      ) : box > 0 ? (
        <GlassArt glass={cocktail.glass} color={cocktail.color} size={box * artScale} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
