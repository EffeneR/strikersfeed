import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithSteam, STEAM_ENABLED } from "@/lib/steam";
import { colors, font, radius, spacing } from "@/theme/tokens";

/** "Continue with Steam" for the auth screens. Renders nothing if Steam is off. */
export function SteamButton() {
  const [busy, setBusy] = useState(false);
  if (!STEAM_ENABLED) return null;

  const onPress = async () => {
    setBusy(true);
    const { error, cancelled } = await signInWithSteam();
    setBusy(false);
    if (cancelled) return;
    if (error) {
      Alert.alert("Steam sign-in", error);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <View>
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }, busy && { opacity: 0.6 }]}
      >
        {busy ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Ionicons name="logo-steam" size={20} color={colors.accent} />
            <Text style={styles.text}>Continue with Steam</Text>
          </>
        )}
      </Pressable>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { color: colors.text, fontSize: font.size.md, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.textMuted, fontSize: font.size.xs },
});
