import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import {
  getBlockedProfiles,
  unblockUser,
  type BlockedProfile,
} from "@/lib/moderation";
import { colors, font, radius, spacing } from "@/theme/tokens";

export default function BlockedScreen() {
  const [items, setItems] = useState<BlockedProfile[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(await getBlockedProfiles());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unblock = async (id: string) => {
    setBusyId(id);
    const { error } = await unblockUser(id);
    setBusyId(null);
    if (!error) setItems((prev) => (prev ?? []).filter((p) => p.id !== id));
  };

  if (items === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={items}
      keyExtractor={(p) => p.id}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.muted}>
            You haven&apos;t blocked anyone. Blocking hides an account&apos;s posts from you.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const name = item.displayName ?? item.username ?? "Member";
        const initials = name.slice(0, 2).toUpperCase();
        return (
          <View style={styles.row}>
            {item.avatarUrl ? (
              <Image source={{ uri: item.avatarUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>{initials}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name}</Text>
              {item.username && <Text style={styles.muted}>@{item.username}</Text>}
            </View>
            <Pressable
              style={styles.unblock}
              onPress={() => void unblock(item.id)}
              disabled={busyId === item.id}
            >
              <Text style={styles.unblockText}>{busyId === item.id ? "…" : "Unblock"}</Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { padding: spacing.xxl, alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: colors.background },
  muted: { color: colors.textMuted, fontSize: font.size.sm, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  avatar: { width: 40, height: 40, borderRadius: radius.pill },
  avatarFallback: { backgroundColor: "#1f2937", alignItems: "center", justifyContent: "center" },
  name: { color: colors.text, fontWeight: "600", fontSize: font.size.md },
  unblock: { borderColor: colors.border, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  unblockText: { color: colors.text, fontWeight: "600", fontSize: font.size.sm },
});
