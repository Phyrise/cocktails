import { Tabs } from 'expo-router';
import { type ColorValue, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { fonts } from '@/constants/theme';
import { useTheme, useUser } from '@/state/store';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => <Icon name={icon} size={23} color={String(color)} strokeWidth={focused ? 2.4 : 1.9} />,
});

export default function TabsLayout() {
  const { colors } = useTheme();
  const { shopping } = useUser();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.line,
          height: 66 + insets.bottom,
          paddingTop: 2,
          paddingBottom: Math.max(insets.bottom, 4),
          ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } : {}),
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen name="index" options={tab('Accueil', 'home')} />
      <Tabs.Screen name="cocktails" options={tab('Cocktails', 'search')} />
      <Tabs.Screen name="bar" options={{ ...tab('Mon bar', 'wine'), tabBarBadge: shopping.size || undefined, tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.accentInk, fontSize: 10 } }} />
      <Tabs.Screen name="listes" options={tab('Mes listes', 'heart')} />
    </Tabs>
  );
}
