import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getProfile, type ProfileView } from "@/lib/profiles";
import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: "auto" }} />
    </Pressable>
  );
}

export default function Profile() {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;
  const email = session?.user?.email ?? "";
  const [profile, setProfile] = useState<ProfileView | null>(null);

  useEffect(() => {
    if (uid) void getProfile(uid).then(setProfile);
  }, [uid]);

  const name = profile?.displayName ?? (session?.user?.user_metadata?.display_name as string) ?? "You";
  const handle = profile?.username ?? email.split("@")[0] ?? "member";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.head}>
          <Avatar name={name} url={profile?.avatarUrl} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              @{handle}
            </Text>
          </View>
        </View>
        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <Pressable style={styles.editBtn} onPress={() => router.push("/settings/profile")}>
          <Text style={styles.editText}>Edit profile</Text>
        </Pressable>

        <View style={styles.group}>
          <Row icon="grid-outline" label="My posts" onPress={() => uid && router.push(`/user/${uid}`)} />
          <Row icon="bookmark-outline" label="Bookmarks" onPress={() => router.push("/bookmarks")} />
          <Row icon="notifications-outline" label="Notifications" onPress={() => router.push("/notifications")} />
          <Row icon="settings-outline" label="Settings" onPress={() => router.push("/settings")} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  name: { color: colors.text, fontSize: font.size.lg, fontWeight: "700" },
  handle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  bio: { color: colors.text, fontSize: font.size.sm, marginTop: spacing.md, lineHeight: 20 },
  editBtn: { marginTop: spacing.lg, borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, paddingVertical: 10, alignItems: "center" },
  editText: { color: colors.text, fontWeight: "600", fontSize: font.size.sm },
  group: { marginTop: spacing.xl, backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  rowLabel: { color: colors.text, fontSize: font.size.md },
});
