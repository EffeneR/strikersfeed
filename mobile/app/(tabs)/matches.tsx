import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DEMO_MATCHES, type DemoMatch } from "@/data/demo";
import { Crest } from "@/components/Crest";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const TABS = ["Live", "Upcoming", "Results"] as const;

export default function Matches() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Live");

  const filtered = DEMO_MATCHES.filter((m) =>
    tab === "Live" ? m.status === "LIVE" : tab === "Upcoming" ? m.status === "UPCOMING" : m.status === "FT",
  );

  return (
    <Screen>
      <Text style={styles.title}>Matches</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
            <Text style={[styles.tabText, tab === t && styles.tabOn]}>{t}</Text>
            {tab === t && <View style={styles.tabBar} />}
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MatchRow match={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here right now.</Text>}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
      />
    </Screen>
  );
}

export function MatchRow({ match }: { match: DemoMatch }) {
  const score = match.homeScore === null ? match.minute : `${match.homeScore} - ${match.awayScore}`;
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/match/${match.id}`)}>
      <View style={styles.side}>
        <Crest tag={match.homeTag} tone="blue" size={34} />
        <Text style={styles.team} numberOfLines={1}>
          {match.home}
        </Text>
      </View>
      <View style={styles.mid}>
        <Text style={styles.score}>{score}</Text>
        <Text style={[styles.status, match.status === "LIVE" ? { color: colors.live } : { color: colors.textMuted }]}>
          {match.status === "LIVE" ? `● ${match.minute}` : match.status === "FT" ? "Full time" : "Today"}
        </Text>
      </View>
      <View style={[styles.side, { justifyContent: "flex-end" }]}>
        <Text style={[styles.team, { textAlign: "right" }]} numberOfLines={1}>
          {match.away}
        </Text>
        <Crest tag={match.awayTag} tone="violet" size={34} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: "700", padding: spacing.lg, paddingBottom: spacing.sm },
  tabs: { flexDirection: "row", gap: spacing.xl, paddingHorizontal: spacing.lg, borderBottomColor: colors.border, borderBottomWidth: 1 },
  tab: { paddingBottom: spacing.sm },
  tabText: { color: colors.textMuted, fontSize: font.size.sm, fontWeight: "600" },
  tabOn: { color: colors.text },
  tabBar: { height: 2, backgroundColor: colors.accent, borderRadius: 2, marginTop: 6 },
  row: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  side: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  team: { color: colors.text, fontSize: font.size.sm, flexShrink: 1 },
  mid: { alignItems: "center", paddingHorizontal: spacing.sm },
  score: { color: colors.text, fontSize: font.size.md, fontWeight: "800" },
  status: { fontSize: font.size.xs, fontWeight: "700", marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: "center", padding: spacing.xl },
});
