import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { fonts, palette } from '@/constants/theme';

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: palette.wine,
      tabBarInactiveTintColor: palette.muted,
      tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600' },
      tabBarStyle: { backgroundColor: palette.paper, borderTopColor: palette.line, height: 82, paddingTop: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Découvrir', tabBarIcon: ({ focused }) => <TabIcon emoji="✦" focused={focused} /> }} />
      <Tabs.Screen name="bibliotheque" options={{ title: 'Recettes', tabBarIcon: ({ focused }) => <TabIcon emoji="◫" focused={focused} /> }} />
      <Tabs.Screen name="stock" options={{ title: 'Mon bar', tabBarIcon: ({ focused }) => <TabIcon emoji="◒" focused={focused} /> }} />
      <Tabs.Screen name="favoris" options={{ title: 'Envies', tabBarIcon: ({ focused }) => <TabIcon emoji="♡" focused={focused} /> }} />
    </Tabs>
  );
}
