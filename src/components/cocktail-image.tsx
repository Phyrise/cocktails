import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { normalize } from '@/lib/cocktails';
import { imageUri } from '@/lib/database';
import { useCatalog, useTheme } from '@/state/store';
import type { Cocktail } from '@/types/cocktail';

// Silhouettes de verres (viewBox 100 × 120) : contour, liquide, accessoires, bord où poser la garniture
// et zone où dessiner les glaçons.
type Box = [number, number, number, number];
type Glass = { outline: string; liquid: string; extra?: string[]; rim: [number, number]; ice?: Box };
const glasses: Record<string, Glass> = {
  Coupe: { outline: 'M18 34 Q50 74 82 34 Z', liquid: 'M23 40 Q50 70 77 40 Z', extra: ['M50 62 V100', 'M34 102 H66'], rim: [79, 34] },
  Martini: { outline: 'M16 26 H84 L50 64 Z', liquid: 'M24 33 H76 L50 60 Z', extra: ['M50 64 V100', 'M34 102 H66'], rim: [80, 26] },
  'Old fashioned': { outline: 'M26 44 H74 L71 102 H29 Z', liquid: 'M28 62 H72 L70 99 H30 Z', rim: [72, 44], ice: [31, 64, 38, 32] },
  Highball: { outline: 'M33 14 H67 L65 104 H35 Z', liquid: 'M34 34 H66 L64 101 H36 Z', rim: [66, 14], ice: [37, 38, 26, 60] },
  Flûte: { outline: 'M40 10 Q37 48 43 62 Q50 70 57 62 Q63 48 60 10 Z', liquid: 'M40.5 24 Q38.5 49 44 60 Q50 66 56 60 Q61.5 49 59.5 24 Z', extra: ['M50 67 V100', 'M37 102 H63'], rim: [59, 11] },
  'Verre à vin': { outline: 'M30 16 Q25 58 50 64 Q75 58 70 16 Z', liquid: 'M28.5 36 Q28 58 50 61 Q72 58 71.5 36 Z', extra: ['M50 64 V100', 'M34 102 H66'], rim: [69, 17], ice: [35, 38, 30, 16] },
  Tiki: { outline: 'M32 14 H68 L66 104 H34 Z', liquid: 'M33 30 H67 L65 101 H35 Z', extra: ['M40 50 h20', 'M41 72 h18'], rim: [67, 14], ice: [36, 32, 28, 64] },
  Hurricane: { outline: 'M36 12 Q28 40 40 58 Q30 80 38 100 H62 Q70 80 60 58 Q72 40 64 12 Z', liquid: 'M34 32 Q30 44 41 58 Q32 80 39 97 H61 Q68 80 59 58 Q70 44 66 32 Z', extra: ['M38 104 H62'], rim: [64, 12], ice: [38, 34, 24, 20] },
  'Mug cuivre': { outline: 'M24 30 H68 L66 102 H26 Z', liquid: 'M25 44 H67 L65.5 99 H26.5 Z', extra: ['M68 44 Q86 46 84 66 Q82 84 66 84'], rim: [66, 30], ice: [29, 47, 34, 48] },
  Tasse: { outline: 'M22 46 H70 Q70 98 46 98 Q22 98 22 46 Z', liquid: 'M24 54 H68 Q67 94 46 95 Q25 94 24 54 Z', extra: ['M70 56 Q86 58 82 72 Q78 82 66 80', 'M16 104 H76'], rim: [68, 46] },
  Shot: { outline: 'M36 62 H64 L61 102 H39 Z', liquid: 'M37 70 H63 L60.5 99 H39.5 Z', rim: [63, 62] },
  Pinte: { outline: 'M30 12 H70 L64 104 H36 Z', liquid: 'M31 28 H69 L63.5 101 H36.5 Z', rim: [69, 12], ice: [36, 32, 28, 62] },
  Julep: { outline: 'M28 32 H72 L70 104 H30 Z', liquid: 'M29 46 H71 L69 101 H31 Z', extra: ['M52 18 L60 6'], rim: [70, 32], ice: [32, 48, 36, 50] },
};

type Garnish = 'lime' | 'lemon' | 'orange' | 'grapefruit' | 'cherry' | 'mint' | 'olive';

function garnishesOf(cocktail: Pick<Cocktail, 'garnish'>): Garnish[] {
  const text = normalize(cocktail.garnish ?? '');
  const found: Garnish[] = [];
  if (/menthe|basilic/.test(text)) found.push('mint');
  if (/citron vert|lime/.test(text)) found.push('lime');
  else if (/pamplemousse/.test(text)) found.push('grapefruit');
  else if (/orange/.test(text)) found.push('orange');
  else if (/citron/.test(text)) found.push('lemon');
  if (/olive/.test(text)) found.push('olive');
  if (/cerise/.test(text)) found.push('cherry');
  return found.slice(0, 2);
}

const citrus: Record<string, [string, string]> = { lime: ['#7CB342', '#DCEDC8'], lemon: ['#F4C430', '#FFF6C7'], orange: ['#F08A24', '#FFE0B2'], grapefruit: ['#E57373', '#FFD6D6'] };

function GarnishShape({ kind, x, y }: { kind: Garnish; x: number; y: number }) {
  if (kind in citrus) {
    const [peel, flesh] = citrus[kind];
    return (
      <G>
        <Circle cx={x} cy={y} r={10} fill={peel} />
        <Circle cx={x} cy={y} r={7.6} fill={flesh} />
        {[0, 60, 120].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return <Line key={angle} x1={x - Math.cos(rad) * 7} y1={y - Math.sin(rad) * 7} x2={x + Math.cos(rad) * 7} y2={y + Math.sin(rad) * 7} stroke={peel} strokeWidth={0.9} opacity={0.7} />;
        })}
      </G>
    );
  }
  if (kind === 'cherry') {
    return (
      <G>
        <Path d={`M${x} ${y - 5} Q${x + 2} ${y - 14} ${x + 9} ${y - 17}`} stroke="#5D4037" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <Circle cx={x} cy={y} r={5.5} fill="#C62828" />
        <Circle cx={x - 1.8} cy={y - 1.8} r={1.5} fill="#FFFFFF" opacity={0.6} />
      </G>
    );
  }
  if (kind === 'olive') {
    return (
      <G>
        <Line x1={x - 14} y1={y - 12} x2={x + 6} y2={y + 6} stroke="#8D6E63" strokeWidth={1.4} strokeLinecap="round" />
        <Ellipse cx={x - 3} cy={y - 2} rx={5.5} ry={4.2} fill="#7A8B3A" />
        <Circle cx={x - 5} cy={y - 3} r={1.6} fill="#D84315" />
      </G>
    );
  }
  return (
    <G>
      <Path d={`M${x - 2} ${y + 2} Q${x - 14} ${y - 4} ${x - 8} ${y - 14} Q${x + 2} ${y - 8} ${x - 2} ${y + 2} Z`} fill="#43A047" />
      <Path d={`M${x} ${y + 2} Q${x + 12} ${y - 2} ${x + 8} ${y - 13} Q${x - 2} ${y - 9} ${x} ${y + 2} Z`} fill="#66BB6A" />
    </G>
  );
}

function IceShapes({ ice, box }: { ice: string; box?: Box }) {
  if (!box) return null;
  const [x, y, w, h] = box;
  const style = { fill: '#FFFFFF', fillOpacity: 0.28, stroke: '#FFFFFF', strokeOpacity: 0.6, strokeWidth: 1 };
  if (ice === 'Gros glaçon') {
    const side = Math.min(w, h) * 0.72;
    return <Rect x={x + (w - side) / 2} y={y + (h - side) / 2 + 2} width={side} height={side} rx={3} {...style} />;
  }
  if (ice === 'Glaçons') {
    const side = Math.min(w * 0.42, 13);
    const cubes: [number, number, number][] = [[0.08, 0.1, -8], [0.5, 0.32, 10], [0.12, 0.6, 4]];
    return (
      <G>
        {cubes.filter(([, fy]) => y + fy * h + side <= y + h).map(([fx, fy, angle]) => (
          <Rect key={`${fx}-${fy}`} x={x + fx * w} y={y + fy * h} width={side} height={side} rx={2} transform={`rotate(${angle} ${x + fx * w + side / 2} ${y + fy * h + side / 2})`} {...style} />
        ))}
      </G>
    );
  }
  if (ice === 'Glace pilée') {
    const dots = Array.from({ length: 14 }, (_, index) => [x + ((index * 37) % 100) / 100 * w, y + ((index * 53) % 100) / 100 * h, 1.6 + (index % 3) * 0.7]);
    return <G>{dots.map(([cx, cy, r], index) => <Circle key={index} cx={cx} cy={cy} r={r} {...style} />)}</G>;
  }
  return null;
}

function Bubbles({ liquidTop, x }: { liquidTop: number; x: number }) {
  return (
    <G>
      {[[x - 6, liquidTop + 22, 1.6], [x + 3, liquidTop + 14, 1.2], [x - 2, liquidTop + 6, 1.8], [x + 6, liquidTop + 28, 1.1]].map(([cx, cy, r], index) => (
        <Circle key={index} cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity={0.65} />
      ))}
    </G>
  );
}

type ArtProps = { cocktail: Pick<Cocktail, 'glass' | 'color' | 'ice' | 'garnish' | 'flavors'>; size: number };

/** Illustration du verre : liquide à la couleur de la boisson, glaçons, bulles et garniture d'après la fiche. */
export function GlassArt({ cocktail, size }: ArtProps) {
  const { colors } = useTheme();
  const shape = glasses[cocktail.glass] ?? glasses['Old fashioned'];
  const garnish = garnishesOf(cocktail);
  const liquidTop = Number(shape.liquid.match(/^M[\d.]+ ([\d.]+)/)?.[1] ?? 40);
  const sparkling = cocktail.flavors.includes('Pétillant');
  const [rimX, rimY] = shape.rim;
  return (
    <Svg width={size} height={size * 1.2} viewBox="-6 -10 112 126">
      <Path d={shape.liquid} fill={cocktail.color} opacity={0.92} />
      <IceShapes ice={cocktail.ice} box={shape.ice} />
      {sparkling ? <Bubbles liquidTop={liquidTop} x={shape.ice ? shape.ice[0] + shape.ice[2] * 0.7 : 50} /> : null}
      <Path d={shape.outline} fill="none" stroke={colors.ink} strokeOpacity={0.55} strokeWidth={2.4} strokeLinejoin="round" />
      {shape.extra?.map((d) => <Path key={d} d={d} fill="none" stroke={colors.ink} strokeOpacity={0.55} strokeWidth={2.4} strokeLinecap="round" />)}
      {garnish.map((kind, index) => <GarnishShape key={kind} kind={kind} x={rimX - index * 16} y={rimY - (kind === 'mint' ? 2 : 0)} />)}
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
        <View style={{ marginBottom: box > 300 ? box * 0.12 : 0 }}><GlassArt cocktail={cocktail} size={box * artScale} /></View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
