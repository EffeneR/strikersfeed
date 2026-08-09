import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getActivity, markAllActivityRead, type ActivityItem, type NotificationType } from "@/lib/activity";
import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { colors, font, spacing } from "@/theme/tokens";

const META: Record<
  NotificationType,
  { verb: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  reply: { verb: "replied to your post", icon: "chatbubble-outline", color: colors.textMuted },
  reaction: { verb: "liked your post", icon: "heart", color: colors.live },
  follow: { verb: "started following you", icon: "person-add", color: colors.accent },
};

export default function Notifications() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const rows = await getActivity();
    setItems(rows);
    setRefreshing(false);
    void markAllActivityRead();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (item: ActivityItem) => {
    if (item.type === "follow" && item.actor) router.push(`/user/${item.actor.id}`);
    else if (item.postId) router.push(`/post/${item.postId}`);
  };

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
        renderItem={({ item }) => {
          const meta = META[item.type];
          const name = item.actor?.displayName ?? "Someone";
          return (
            <Pressable style={[styles.row, !item.read && styles.unread]} onPress={() => open(item)}>
              <Avatar name={name} url={item.actor?.avatarUrl ?? null} size={38} />
              <View style={{ flex: 1 }}>
                <Text style={styles.line}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.muted}>
                    {" "}
                    {meta.verb} · {timeAgo(item.createdAt)}
                  </Text>
                </Text>
                {item.type === "reply" && item.snippet ? (
                  <Text style={styles.snippet} numberOfLines={2}>
                    {item.snippet}
                  </Text>
                ) : null}
              </View>
              <Ionicons name={meta.icon} size={16} color={meta.color} />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={36} color={colors.accent} />
            <Text style={styles.emptyText}>
              No notifications yet. Replies, likes and new followers show up here.
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  unread: { backgroundColor: "rgba(182,255,46,0.05)" },
  line: { fontSize: font.size.sm },
  name: { color: colors.text, fontWeight: "700" },
  muted: { color: colors.textMuted },
  snippet: { color: colors.text, fontSize: font.size.sm, marginTop: 2 },
});
