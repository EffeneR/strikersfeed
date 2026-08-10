import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getProfile, type ProfileView } from "@/lib/profiles";
import { getFollowCounts } from "@/lib/follows";
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceHover }]}>
      <Ionicons name={icon} size={18} color={colors.accent} />
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
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      void getProfile(uid).then(setProfile);
      void getFollowCounts(uid).then(setCounts);
    }, [uid]),
  );

  const name = profile?.displayName ?? (session?.user?.user_metadata?.display_name as string) ?? "You";
  const handle = profile?.username ?? email.split("@")[0] ?? "member";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.head}>
          <View style={{ position: "relative" }}>
            <Avatar name={name} url={profile?.avatarUrl} size={72} />
            {profile?.steamVerified && <View style={styles.steamRing} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameLine}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              {profile?.steamVerified && <Ionicons name="shield-checkmark" size={16} color={colors.accent} />}
            </View>
            <Text style={styles.handle} numberOfLines={1}>
              @{handle}
            </Text>
            <View style={styles.countsRow}>
              <Text style={styles.count}>
                <Text style={styles.countNum}>{counts.followers}</Text> Followers
              </Text>
              <Text style={styles.count}>
                <Text style={styles.countNum}>{counts.following}</Text> Following
              </Text>
            </View>
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
  steamRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accentRing,
  },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: colors.text, fontSize: font.size.xl, fontWeight: "800", flexShrink: 1 },
  handle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  countsRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm },
  count: { color: colors.textMuted, fontSize: font.size.sm },
  countNum: { color: colors.text, fontWeight: "800" },
  bio: { color: colors.text, fontSize: font.size.sm, marginTop: spacing.lg, lineHeight: 20 },
  editBtn: {
    marginTop: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  editText: { color: colors.text, fontWeight: "700", fontSize: font.size.sm },
  group: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: 14 },
  rowLabel: { color: colors.text, fontSize: font.size.md },
});
