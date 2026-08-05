import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function Explore() {
  return (
    <Screen>
      <Text style={styles.title}>Explore</Text>
      <View style={styles.center}>
        <Ionicons name="compass-outline" size={40} color={colors.accent} />
        <Text style={styles.muted}>
          Search, trending topics, teams and players are coming to the app.
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
