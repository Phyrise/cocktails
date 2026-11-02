import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CocktailCard } from '@/components/cocktail-card';
import { fonts, palette, radius } from '@/constants/theme';
import { recommendCocktails, type Recommendation } from '@/data/recommendations';
import { useAppState } from '@/state/app-state';

const examples = ['Pétillant et boisé', 'J’aime le Negroni, plus frais', 'Fruité mais pas trop sucré'];

export function ExpertPanel() {
  const { favorites, cocktails, pantryItems } = useAppState();
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const search = (value = prompt) => { setPrompt(value); setRecommendations(recommendCocktails(value, cocktails, favorites, pantryItems)); };
  return <View>
    <View style={styles.expert}>
      <Text style={styles.eyebrow}>EXPERT · PROTOTYPE LOCAL</Text><Text style={styles.title}>Qu’avez-vous envie de boire ?</Text>
      <Text style={styles.copy}>Décrivez une saveur, un cocktail aimé ou détesté. L’expert croise la base pour proposer trois pistes.</Text>
      <TextInput value={prompt} onChangeText={setPrompt} autoCorrect spellCheck autoCapitalize="sentences" placeholder="Ex. J’aime le Negroni, mais je veux quelque chose de pétillant et boisé…" placeholderTextColor="#A98D92" multiline style={styles.input} />
      <View style={styles.examples}>{examples.map((example) => <Pressable key={example} onPress={() => search(example)} style={styles.example}><Text style={styles.exampleText}>{example}</Text></Pressable>)}</View>
      <Pressable onPress={() => search()} style={styles.button}><Text style={styles.buttonText}>Trouver mes cocktails  →</Text></Pressable>
    </View>
    {recommendations.length ? <View style={styles.results}><Text style={styles.resultsTitle}>Suggestions</Text>{recommendations.map((item) => <View key={item.cocktail.slug} style={styles.result}><CocktailCard cocktail={item.cocktail} /><Text style={styles.reason}>{item.reason}</Text></View>)}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  expert: { backgroundColor: palette.wineDark, borderRadius: radius.lg, padding: 18 }, eyebrow: { color: palette.gold, fontFamily: fonts.body, fontSize: 9, fontWeight: '800', letterSpacing: 2 }, title: { color: palette.white, fontFamily: fonts.display, fontSize: 25, marginTop: 6 }, copy: { color: '#D8C6BE', fontFamily: fonts.body, fontSize: 11, lineHeight: 17, marginTop: 7 }, input: { backgroundColor: '#FFF8EF', borderRadius: radius.md, color: palette.ink, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 14, minHeight: 86, padding: 13, textAlignVertical: 'top' }, examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 }, example: { borderColor: '#996A75', borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 }, exampleText: { color: '#F3E7DF', fontFamily: fonts.body, fontSize: 9 }, button: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: palette.gold, borderRadius: radius.pill, marginTop: 13, paddingHorizontal: 15, paddingVertical: 10 }, buttonText: { color: palette.wineDark, fontFamily: fonts.body, fontSize: 11, fontWeight: '800' }, results: { marginTop: 20 }, resultsTitle: { color: palette.ink, fontFamily: fonts.display, fontSize: 24, marginBottom: 10 }, result: { marginBottom: 10 }, reason: { color: palette.muted, fontFamily: fonts.body, fontSize: 10, fontStyle: 'italic', lineHeight: 15, marginLeft: 12, marginTop: 5 },
});
