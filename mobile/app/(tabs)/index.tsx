import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getFeed, type FeedPost } from "@/lib/posts";
import { getBlockedIds } from "@/lib/moderation";
import { getFollowingIds } from "@/lib/follows";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { ScreenHeader, Segmented } from "@/components/design";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

const TABS = ["For You", "Following"];

export default function Feed() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState("For You");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const [rows, blocked, following] = await Promise.all([
        getFeed(),
        getBlockedIds(),
        getFollowingIds(),
      ]);
      setPosts(rows.filter((p) => !blocked.has(p.author.id)));
      setFollowingIds(following);
    } catch {
      setError("Couldn't load the feed. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const didInitial = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      void load(!didInitial.current);
      didInitial.current = true;
    }, [load]),
  );

  const loadMore = async () => {
    if (tab === "Following") return; // followed set is loaded up-front
    const last = posts[posts.length - 1];
    if (!last) return;
    const more = await getFeed(last.createdAt);
    if (more.length) setPosts((prev) => [...prev, ...more]);
  };

  const removePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const removeAuthor = (authorId: string) =>
    setPosts((prev) => prev.filter((p) => p.author.id !== authorId));

  const visible =
    tab === "Following"
      ? posts.filter((p) => followingIds.has(p.author.id) || p.author.id === currentUserId)
      : posts;

  return (
    <Screen>
      <ScreenHeader
        title="Feed"
        kicker="Your timeline"
        right={
          <Pressable onPress={() => router.push("/notifications")} hitSlop={10}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <View style={styles.segWrap}>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={currentUserId}
              onRemoved={removePost}
              onBlockedAuthor={removeAuthor}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                {error ??
                  (tab === "Following"
                    ? "Follow people to see their posts here."
                    : "Nothing here yet. Be the first to post.")}
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  center: { padding: spacing.xxl, alignItems: "center", justifyContent: "center", flex: 1 },
  emptyText: { color: colors.textMuted, fontSize: font.size.sm, textAlign: "center" },
});
