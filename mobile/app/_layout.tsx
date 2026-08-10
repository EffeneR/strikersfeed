import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  BarlowCondensed_700Bold,
  BarlowCondensed_800ExtraBold,
} from "@expo-google-fonts/barlow-condensed";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { AuthProvider } from "@/lib/auth";
import { colors } from "@/theme/tokens";

/** Shared options for a pushed stack screen with a themed back header. */
function header(title: string) {
  return {
    headerShown: true,
    title,
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerShadowVisible: false,
    animation: "slide_from_right" as const,
  };
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_700Bold,
    BarlowCondensed_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  // Render once fonts are ready (or if they fail — fall back to system fonts
  // rather than blocking the app).
  const ready = fontsLoaded || !!fontError;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        {!ready ? (
          <View style={{ flex: 1, backgroundColor: colors.background }} />
        ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="compose"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="post/[id]" options={header("Post")} />
          <Stack.Screen name="user/[id]" options={header("Profile")} />
          <Stack.Screen name="notifications" options={header("Notifications")} />
          <Stack.Screen name="bookmarks" options={header("Bookmarks")} />
          <Stack.Screen name="blocked" options={header("Blocked accounts")} />
          <Stack.Screen name="settings/index" options={header("Settings")} />
          <Stack.Screen name="settings/profile" options={header("Edit profile")} />
          <Stack.Screen name="settings/notifications" options={header("Notifications")} />
          <Stack.Screen name="settings/connections" options={header("Connect Steam")} />
          <Stack.Screen name="teams" options={header("Teams")} />
          <Stack.Screen name="players" options={header("Players")} />
          <Stack.Screen name="tournaments" options={header("Tournaments")} />
          <Stack.Screen name="match/[id]" options={header("Match")} />
        </Stack>
        )}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
