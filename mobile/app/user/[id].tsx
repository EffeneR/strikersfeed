import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getProfile, type ProfileView } from "@/lib/profiles";
import { getPostsByAuthor, type FeedPost } from "@/lib/posts";
import { blockUser } from "@/lib/moderation";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { ReportSheet } from "@/components/ReportSheet";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;
  const isOwn = !!currentUserId && currentUserId === id;

  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, ps] = await Promise.all([getProfile(id), getPostsByAuthor(id)]);
    setProfile(p);
    setPosts(ps);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmBlock = () =>
    Alert.alert(`Block @${profile?.username ?? "user"}?`, "You won't see their posts anymore.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          const { error } = await blockUser(id);
          if (error) Alert.alert("Couldn't block", error);
          else router.back();
        },
      },
    ]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }
  if (!profile) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>This profile is unavailable.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <Avatar name={profile.displayName} url={profile.avatarUrl} size={64} />
              {isOwn ? (
                <Pressable style={styles.editBtn} onPress={() => router.push("/settings/profile")}>
                  <Text style={styles.editText}>Edit profile</Text>
                </Pressable>
              ) : (
                currentUserId && (
                  <View style={styles.ownerActions}>
                    <Pressable style={styles.iconBtn} onPress={() => setReportOpen(true)}>
                      <Ionicons name="flag-outline" size={16} color={colors.text} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={confirmBlock}>
                      <Ionicons name="ban-outline" size={16} color={colors.live} />
                    </Pressable>
                  </View>
                )
              )}
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.displayName}</Text>
              {profile.steamVerified && (
                <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
              )}
            </View>
            <Text style={styles.handle}>
              @{profile.username ?? "member"}
              {profile.role ? ` · ${profile.role}` : ""}
            </Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            <Text style={styles.postsLabel}>Posts</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={currentUserId}
            onRemoved={(pid) => setPosts((prev) => prev.filter((p) => p.id !== pid))}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet.</Text>}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="profile"
        targetId={id ?? ""}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  header: { padding: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  editBtn: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  editText: { color: colors.text, fontWeight: "600", fontSize: font.size.sm },
  ownerActions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.md },
  name: { color: colors.text, fontSize: font.size.lg, fontWeight: "700" },
  handle: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2 },
  bio: { color: colors.text, fontSize: font.size.sm, marginTop: spacing.sm, lineHeight: 20 },
  postsLabel: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.lg,
  },
  empty: { color: colors.textMuted, fontSize: font.size.sm, textAlign: "center", padding: spacing.xl },
});
