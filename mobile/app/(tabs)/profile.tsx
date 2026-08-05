import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { deleteAccount } from "@/lib/moderation";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? "https://strikersfeed.club";

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
    >
      <Ionicons name={icon} size={18} color={danger ? colors.live : colors.textMuted} />
      <Text style={[styles.rowLabel, danger && { color: colors.live }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: "auto" }} />
    </Pressable>
  );
}

export default function Profile() {
  const { session, signOut } = useAuth();
  const email = session?.user?.email ?? "";
  const name = (session?.user?.user_metadata?.display_name as string) ?? "You";

  const confirmDelete = () => {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your profile, posts, comments and reactions. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) Alert.alert("Couldn't delete account", error);
            else router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.muted}>{email}</Text>
        </View>

        <Text style={styles.section}>Safety</Text>
        <View style={styles.group}>
          <Row icon="ban-outline" label="Blocked accounts" onPress={() => router.push("/blocked")} />
          <Row
            icon="shield-checkmark-outline"
            label="Community Guidelines"
            onPress={() => Linking.openURL(`${SITE}/community-guidelines`)}
          />
          <Row
            icon="lock-closed-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL(`${SITE}/privacy`)}
          />
          <Row
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL(`${SITE}/terms`)}
          />
        </View>

        <Text style={styles.section}>Account</Text>
        <View style={styles.group}>
          <Row icon="trash-outline" label="Delete account" onPress={confirmDelete} danger />
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
      </ScrollView>
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
  section: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  group: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  rowLabel: { color: colors.text, fontSize: font.size.md },
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
