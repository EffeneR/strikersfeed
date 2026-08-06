import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getActivity, type ActivityItem } from "@/lib/activity";
import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { colors, font, spacing } from "@/theme/tokens";

export default function Notifications() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setItems(await getActivity());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (items === null) {
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
        data={items}
        keyExtractor={(a) => a.id}
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
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => router.push(`/post/${item.postId}`)}>
            <Avatar name={item.actor.displayName} url={item.actor.avatarUrl} size={38} />
            <View style={{ flex: 1 }}>
              <Text style={styles.line}>
                <Text style={styles.name}>{item.actor.displayName}</Text>
                <Text style={styles.muted}> replied to your post · {timeAgo(item.createdAt)}</Text>
              </Text>
              <Text style={styles.snippet} numberOfLines={2}>
                {item.snippet}
              </Text>
            </View>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={36} color={colors.accent} />
            <Text style={styles.emptyText}>
              No activity yet. When people reply to your posts, you&apos;ll see it here.
            </Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingVertical: spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xxl },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: font.size.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  line: { fontSize: font.size.sm },
  name: { color: colors.text, fontWeight: "700" },
  muted: { color: colors.textMuted },
  snippet: { color: colors.text, fontSize: font.size.sm, marginTop: 2 },
});
