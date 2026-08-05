import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

export default function Profile() {
  const { session, signOut } = useAuth();
  const email = session?.user?.email ?? "";
  const name = (session?.user?.user_metadata?.display_name as string) ?? "You";

  return (
    <Screen>
      <View style={{ padding: spacing.lg }}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.muted}>{email}</Text>
        </View>

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace("/(auth)/sign-in");
          }}
          style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: "700", marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  name: { color: colors.text, fontSize: font.size.lg, fontWeight: "700" },
  muted: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  signOut: {
    marginTop: spacing.xl,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutText: { color: colors.textMuted, fontWeight: "600" },
});
