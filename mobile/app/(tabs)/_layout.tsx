import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect, Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useAuth } from "@/lib/auth";
import { registerForPush } from "@/lib/notifications";
import { Hairline } from "@/components/design";
import { colors, glow, gradients } from "@/theme/tokens";

const TAB_META: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  index: { label: "Feed", icon: "home" },
  explore: { label: "Explore", icon: "compass" },
  matches: { label: "Matches", icon: "football" },
  profile: { label: "Profile", icon: "person" },
};

/** Signature bottom nav: glass bar, accent hairline, oversized glowing create. */
function SFTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[tb.bar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={tb.hairline}>
        <Hairline />
      </View>
      {state.routes.map((route, i) => {
        const focused = state.index === i;

        if (route.name === "create") {
          return (
            <Pressable key={route.key} onPress={() => router.push("/compose")} style={tb.createWrap} accessibilityLabel="Create">
              <View style={[tb.createBtn, glow.accent]}>
                <LinearGradient
                  colors={gradients.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={tb.createFill}
                >
                  <Ionicons name="add" size={26} color={colors.onAccent} />
                </LinearGradient>
              </View>
            </Pressable>
          );
        }

        const meta = TAB_META[route.name];
        if (!meta) return null;
        const color = focused ? colors.accent : colors.textMuted;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={tb.item}>
            {focused && <View style={tb.activeDot} />}
            <Ionicons name={meta.icon} size={22} color={color} />
            <Text style={[tb.label, { color }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (session) void registerForPush();
  }, [session]);

  if (!loading && !session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <SFTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="matches" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const tb = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    backgroundColor: "rgba(14,17,14,0.97)",
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  hairline: { position: "absolute", top: 0, left: 0, right: 0 },
  item: { minWidth: 44, alignItems: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "700" },
  activeDot: { position: "absolute", top: -8, width: 18, height: 2, borderRadius: 2, backgroundColor: colors.accent },
  createWrap: { alignItems: "center", justifyContent: "center", width: 60 },
  createBtn: { width: 54, height: 54, borderRadius: 27, marginTop: -22, overflow: "hidden" },
  createFill: { flex: 1, alignItems: "center", justifyContent: "center" },
});
