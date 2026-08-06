import { FlatList, StyleSheet, Text, View } from "react-native";
import { DEMO_TEAMS } from "@/data/demo";
import { Crest } from "@/components/Crest";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Teams() {
  return (
    <Screen>
      <FlatList
        data={DEMO_TEAMS}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Crest tag={item.tag} tone={item.tone} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.followers} followers</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListFooterComponent={<Text style={styles.note}>Sample teams from the Strikers Club community.</Text>}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  name: { color: colors.text, fontSize: font.size.md, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  note: { color: colors.textMuted, fontSize: font.size.xs, textAlign: "center", paddingVertical: spacing.lg },
});
