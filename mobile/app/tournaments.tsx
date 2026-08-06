import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEMO_TOURNAMENTS } from "@/data/demo";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Tournaments() {
  return (
    <Screen>
      <FlatList
        data={DEMO_TOURNAMENTS}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="trophy-outline" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.stage} · {item.format}
              </Text>
            </View>
            <Text style={[styles.badge, item.status === "Live" && { color: colors.live }]}>{item.status}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListFooterComponent={<Text style={styles.note}>Sample community tournaments.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontSize: font.size.md, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  badge: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase" },
  note: { color: colors.textMuted, fontSize: font.size.xs, textAlign: "center", paddingVertical: spacing.lg },
});
