import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DEMO_MATCHES, type DemoMatch } from "@/data/demo";
import { Crest } from "@/components/Crest";
import { LiveTag, ScreenHeader, Segmented } from "@/components/design";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const TABS = ["Live", "Upcoming", "Results"];

export default function Matches() {
  const [tab, setTab] = useState("Live");

  const filtered = DEMO_MATCHES.filter((m) =>
    tab === "Live" ? m.status === "LIVE" : tab === "Upcoming" ? m.status === "UPCOMING" : m.status === "FT",
  );

  return (
    <Screen>
      <ScreenHeader title="Matches" kicker="Live & upcoming" />
      <View style={styles.segWrap}>
        <Segmented options={TABS} value={tab} onChange={setTab} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MatchRow match={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here right now.</Text>}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      />
    </Screen>
  );
}

export function MatchRow({ match }: { match: DemoMatch }) {
  const live = match.status === "LIVE";
  const score = match.homeScore === null ? match.minute : `${match.homeScore} : ${match.awayScore}`;
  return (
    <Pressable style={[styles.row, live && styles.rowLive]} onPress={() => router.push(`/match/${match.id}`)}>
      <View style={styles.topRow}>
        <Text style={styles.league}>Elite Division</Text>
        {live ? (
          <LiveTag label={match.minute} />
        ) : (
          <Text style={styles.when}>{match.status === "FT" ? "FULL TIME" : "TODAY"}</Text>
        )}
      </View>
      <View style={styles.scoreRow}>
        <View style={styles.side}>
          <Crest tag={match.homeTag} tone="blue" size={34} />
          <Text style={styles.team} numberOfLines={1}>
            {match.home}
          </Text>
        </View>
        <Text style={styles.score}>{score}</Text>
        <View style={[styles.side, { justifyContent: "flex-end" }]}>
          <Text style={[styles.team, { textAlign: "right" }]} numberOfLines={1}>
            {match.away}
          </Text>
          <Crest tag={match.awayTag} tone="violet" size={34} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  row: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  rowLive: { borderColor: "rgba(255,77,77,0.4)" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  league: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  when: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  scoreRow: { flexDirection: "row", alignItems: "center" },
  side: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  team: { color: colors.text, fontSize: font.size.sm, flexShrink: 1 },
  score: {
    fontFamily: font.family.display,
    color: colors.text,
    fontSize: 26,
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    textShadowColor: colors.accentRing,
    textShadowRadius: 12,
  },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.xl },
});
