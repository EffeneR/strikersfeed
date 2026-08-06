import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { findMatch } from "@/data/demo";
import { Crest } from "@/components/Crest";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const STATS = [
  { label: "Possession", home: "56%", away: "44%" },
  { label: "Shots", home: "12", away: "8" },
  { label: "On target", home: "6", away: "3" },
  { label: "Corners", home: "5", away: "4" },
];

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = id ? findMatch(id) : undefined;

  if (!match) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>Match not found.</Text>
        </View>
      </Screen>
    );
  }

  const score = match.homeScore === null ? "vs" : `${match.homeScore} - ${match.awayScore}`;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.header}>
          <View style={styles.leagueRow}>
            <Text style={styles.league}>{match.league}</Text>
            {match.status === "LIVE" && (
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          <View style={styles.scoreRow}>
            <View style={styles.teamCol}>
              <Crest tag={match.homeTag} tone="blue" size={54} />
              <Text style={styles.teamName}>{match.home}</Text>
            </View>
            <View style={styles.scoreCol}>
              <Text style={styles.score}>{score}</Text>
              <Text style={styles.minute}>
                {match.status === "LIVE" ? match.minute : match.status === "FT" ? "Full time" : "Today"}
              </Text>
            </View>
            <View style={styles.teamCol}>
              <Crest tag={match.awayTag} tone="violet" size={54} />
              <Text style={styles.teamName}>{match.away}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Match stats</Text>
        <View style={styles.statsCard}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statRow}>
              <Text style={styles.statVal}>{s.home}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statVal}>{s.away}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Sample match data. Live fixtures and community match threads connect to a
          data provider in a future update.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  header: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.lg },
  leagueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  league: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,77,77,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
  liveText: { color: colors.live, fontSize: 10, fontWeight: "800" },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamCol: { alignItems: "center", gap: spacing.sm, width: 96 },
  teamName: { color: colors.text, fontSize: font.size.sm, textAlign: "center", fontWeight: "600" },
  scoreCol: { alignItems: "center" },
  score: { color: colors.text, fontSize: font.size.xxl, fontWeight: "800" },
  minute: { color: colors.accent, fontSize: font.size.xs, fontWeight: "700", marginTop: 2 },
  sectionLabel: { color: colors.textMuted, fontSize: font.size.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm },
  statsCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  statVal: { color: colors.text, fontSize: font.size.sm, fontWeight: "700", width: 48 },
  statLabel: { color: colors.textMuted, fontSize: font.size.sm },
  note: { color: colors.textMuted, fontSize: font.size.xs, marginTop: spacing.lg, lineHeight: 17 },
});
