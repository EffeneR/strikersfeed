import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getFeed, toggleLike, type FeedPost } from "@/lib/posts";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) return <Image source={{ uri: url }} style={styles.avatar} contentFit="cover" />;
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>{initials}</Text>
    </View>
  );
}

function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount);

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    void toggleLike(post.id);
  };

  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Avatar name={post.author.displayName} url={post.author.avatarUrl} />
        <Text style={styles.name}>{post.author.displayName}</Text>
        {post.author.steamVerified && (
          <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
        )}
        <Text style={styles.handle}>@{post.author.handle}</Text>
      </View>
      {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
      {post.imageUrls.map((uri) => (
        <Image key={uri} source={{ uri }} style={styles.media} contentFit="cover" />
      ))}
      <View style={styles.actions}>
        <Action icon="chatbubble-outline" label={post.commentCount} />
        <Action icon="repeat-outline" label={post.repostCount} />
        <Action
          icon={liked ? "heart" : "heart-outline"}
          label={likes}
          color={liked ? colors.live : colors.textMuted}
          onPress={onLike}
        />
      </View>
    </View>
  );
}

function Action({
  icon,
  label,
  color = colors.textMuted,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: number;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Text onPress={onPress} style={{ color, flexDirection: "row" }}>
      <Ionicons name={icon} size={18} color={color} /> <Text style={{ color, fontSize: 12 }}>{label}</Text>
    </Text>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setError(null);
    try {
      const rows = await getFeed();
      setPosts(rows);
    } catch {
      setError("Couldn't load the feed. Pull to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) void load(true);
    else setLoading(false);
  }, [load]);

  const loadMore = async () => {
    const last = posts[posts.length - 1];
    if (!last) return;
    const more = await getFeed(last.createdAt);
    if (more.length) setPosts((prev) => [...prev, ...more]);
  };

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
        renderItem={({ item }) => <PostCard post={item} />}
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
  card: { borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.lg },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  avatar: { width: 36, height: 36, borderRadius: radius.pill, marginRight: 4 },
  avatarFallback: { backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center" },
  name: { color: colors.text, fontWeight: "600", fontSize: font.size.sm },
  handle: { color: colors.textMuted, fontSize: font.size.xs },
  body: { color: colors.text, fontSize: font.size.md, marginTop: 6, lineHeight: 20 },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  actions: { flexDirection: "row", gap: spacing.xl, marginTop: spacing.md },
});
