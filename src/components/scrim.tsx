import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** Dégradé sombre en bas d'une image pour garder le texte lisible. */
export function Scrim({ from = 0.35, strength = 0.78 }: { from?: number; strength?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset={from} stopColor="#000" stopOpacity={0} />
            <Stop offset={1} stopColor="#000" stopOpacity={strength} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#scrim)" />
      </Svg>
    </View>
  );
}
