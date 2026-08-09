import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { deleteAccount } from "@/lib/moderation";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const SITE = process.env.EXPO_PUBLIC_SITE_URL ?? "https://strikersfeed.netlify.app";

function Row({
  icon,
  label,
  onPress,
  danger,
  external,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  external?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={18} color={danger ? colors.live : colors.textMuted} />
      <Text style={[styles.label, danger && { color: colors.live }]}>{label}</Text>
      <Ionicons name={external ? "open-outline" : "chevron-forward"} size={16} color={colors.textMuted} style={{ marginLeft: "auto" }} />
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={styles.section}>{title}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

export default function Settings() {
  const { signOut } = useAuth();

  const confirmDelete = () =>
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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Group title="Account">
          <Row icon="person-outline" label="Edit profile" onPress={() => router.push("/settings/profile")} />
          <Row icon="notifications-outline" label="Notification preferences" onPress={() => router.push("/settings/notifications")} />
          <Row icon="logo-steam" label="Connect Steam" onPress={() => router.push("/settings/connections")} />
        </Group>

        <Group title="Safety">
          <Row icon="ban-outline" label="Blocked accounts" onPress={() => router.push("/blocked")} />
          <Row icon="shield-checkmark-outline" label="Community Guidelines" external onPress={() => Linking.openURL(`${SITE}/community-guidelines`)} />
          <Row icon="lock-closed-outline" label="Privacy Policy" external onPress={() => Linking.openURL(`${SITE}/privacy`)} />
          <Row icon="document-text-outline" label="Terms of Service" external onPress={() => Linking.openURL(`${SITE}/terms`)} />
        </Group>

        <Group title="Danger zone">
          <Row icon="trash-outline" label="Delete account" danger onPress={confirmDelete} />
        </Group>

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
  section: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  group: { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  label: { color: colors.text, fontSize: font.size.md },
  signOut: { marginTop: spacing.sm, borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, paddingVertical: 12, alignItems: "center" },
  signOutText: { color: colors.textMuted, fontWeight: "600" },
});
