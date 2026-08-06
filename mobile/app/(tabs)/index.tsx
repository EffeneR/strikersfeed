import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { getFeed, type FeedPost } from "@/lib/posts";
import { getBlockedIds } from "@/lib/moderation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Feed() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const [rows, blocked] = await Promise.all([getFeed(), getBlockedIds()]);
      setPosts(rows.filter((p) => !blocked.has(p.author.id)));
    } catch {
      setError("Couldn't load the feed. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Full loader on first mount; silent refetch whenever the tab regains focus
  // (e.g. after composing a post) so new content appears without a manual pull.
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
    const last = posts[posts.length - 1];
    if (!last) return;
    const more = await getFeed(last.createdAt);
    if (more.length) setPosts((prev) => [...prev, ...more]);
  };

  const removePost = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));
  const removeAuthor = (authorId: string) =>
    setPosts((prev) => prev.filter((p) => p.author.id !== authorId));

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={posts}
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
        ListHeaderComponent={<Text style={styles.title}>Feed</Text>}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: colors.textMuted }}>
              {error ?? "Nothing here yet. Be the first to post."}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { padding: spacing.xxl, alignItems: "center", justifyContent: "center", flex: 1 },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: "700", padding: spacing.lg },
});
