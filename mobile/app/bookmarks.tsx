import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBookmarks, type FeedPost } from "@/lib/posts";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Bookmarks() {
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;
  const [posts, setPosts] = useState<FeedPost[] | null>(null);

  const load = useCallback(async () => {
    setPosts(await getBookmarks());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (posts === null) {
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
            onRemoved={(id) => setPosts((prev) => (prev ?? []).filter((p) => p.id !== id))}
          />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="bookmark-outline" size={36} color={colors.accent} />
            <Text style={styles.emptyText}>
              No bookmarks yet. Tap the bookmark icon on a post to save it here.
            </Text>
          </View>
        }
        contentContainerStyle={posts.length === 0 ? { flex: 1 } : undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xxl },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: font.size.sm },
});
