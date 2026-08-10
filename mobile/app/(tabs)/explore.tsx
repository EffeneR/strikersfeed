import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { searchPosts, type FeedPost } from "@/lib/posts";
import { searchProfiles, type ProfileView } from "@/lib/profiles";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { ScreenHeader } from "@/components/design";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const BROWSE: { icon: keyof typeof Ionicons.glyphMap; label: string; href: string }[] = [
  { icon: "shield-outline", label: "Teams", href: "/teams" },
  { icon: "person-outline", label: "Players", href: "/players" },
  { icon: "trophy-outline", label: "Tournaments", href: "/tournaments" },
];

const TRENDING = ["#StrikersClub", "#EliteCup", "#MatchReview", "#TopBins", "#TacticalTalk"];

export default function Explore() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<ProfileView[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [searching, setSearching] = useState(false);

  const active = q.trim().length >= 2;

  useEffect(() => {
    if (!active) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      const [u, p] = await Promise.all([searchProfiles(q), searchPosts(q)]);
      setUsers(u);
      setPosts(p);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, active]);

  return (
    <Screen>
      <ScreenHeader title="Explore" kicker="Discover" />
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search players and posts"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {q.length > 0 && (
          <Pressable onPress={() => setQ("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {!active ? (
        <FlatList
          data={[] as FeedPost[]}
          keyExtractor={(p) => p.id}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={{ padding: spacing.lg }}>
              <Text style={styles.section}>Browse</Text>
              <View style={styles.browseRow}>
                {BROWSE.map((b) => (
                  <Pressable key={b.href} style={styles.browseCard} onPress={() => router.push(b.href)}>
                    <Ionicons name={b.icon} size={22} color={colors.accent} />
                    <Text style={styles.browseLabel}>{b.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.section, { marginTop: spacing.xl }]}>Trending</Text>
              <View style={styles.group}>
                {TRENDING.map((t, i) => (
                  <Pressable
                    key={t}
                    onPress={() => setQ(t)}
                    style={({ pressed }) => [
                      styles.trend,
                      i < TRENDING.length - 1 && styles.trendBorder,
                      pressed && { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text style={styles.trendText}>{t}</Text>
                    <Ionicons name="trending-up" size={15} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />
      ) : searching ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <PostCard post={item} currentUserId={currentUserId} />}
          ListHeaderComponent={
            users.length > 0 ? (
              <View>
                <Text style={styles.section2}>People</Text>
                {users.map((u) => (
                  <Pressable key={u.id} style={styles.userRow} onPress={() => router.push(`/user/${u.id}`)}>
                    <Avatar name={u.displayName} url={u.avatarUrl} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.uName} numberOfLines={1}>
                        {u.displayName}
                      </Text>
                      <Text style={styles.uHandle} numberOfLines={1}>
                        @{u.username ?? "member"}
                      </Text>
                    </View>
                    {u.steamVerified && <Ionicons name="shield-checkmark" size={15} color={colors.accent} />}
                  </Pressable>
                ))}
                <Text style={styles.section2}>Posts</Text>
              </View>
            ) : (
              <Text style={styles.section2}>Posts</Text>
            )
          }
          ListEmptyComponent={
            users.length === 0 ? <Text style={styles.empty}>No results for “{q.trim()}”.</Text> : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: font.size.sm },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  section: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  section2: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  browseRow: { flexDirection: "row", gap: spacing.sm },
  browseCard: { flex: 1, alignItems: "center", gap: 6, paddingVertical: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  browseLabel: { color: colors.text, fontSize: font.size.sm, fontWeight: "600" },
  group: { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
  trend: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  trendBorder: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  trendText: { color: colors.text, fontSize: font.size.sm, fontWeight: "600" },
  userRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  uName: { color: colors.text, fontSize: font.size.sm, fontWeight: "700" },
  uHandle: { color: colors.textMuted, fontSize: font.size.xs },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.xl },
});
