import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Matches() {
  return (
    <Screen>
      <Text style={styles.title}>Matches</Text>
      <View style={styles.center}>
        <Ionicons name="football-outline" size={40} color={colors.accent} />
        <Text style={styles.muted}>
          Live scores, fixtures, match threads and tournaments are coming to the app.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: "700", padding: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xxl },
  muted: { color: colors.textMuted, textAlign: "center", fontSize: font.size.md },
});
