import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, View } from "react-native";
import { getPrefs, setPrefs, type NotificationPrefs } from "@/lib/notifications";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const ITEMS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: "matchStart", label: "Match alerts", hint: "Kick-off, goals and results for matches you follow." },
  { key: "replies", label: "Replies", hint: "When someone replies to your posts." },
  { key: "mentions", label: "Mentions", hint: "When someone @mentions you." },
  { key: "follows", label: "New followers", hint: "When someone follows you." },
];

export default function NotificationSettings() {
  const [prefs, setLocal] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    void getPrefs().then(setLocal);
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setLocal(next);
    void setPrefs(next);
  };

  if (!prefs) {
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
      <View style={{ padding: spacing.lg }}>
        <View style={styles.group}>
          {ITEMS.map((it, i) => (
            <View key={it.key} style={[styles.row, i < ITEMS.length - 1 && styles.rowBorder]}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={styles.label}>{it.label}</Text>
                <Text style={styles.hint}>{it.hint}</Text>
              </View>
              <Switch
                value={prefs[it.key]}
                onValueChange={() => toggle(it.key)}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.text}
              />
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          Push notifications are delivered to this device once you allow them. You
          can turn them off any time here or in your phone&apos;s settings.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  group: { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  rowBorder: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { color: colors.text, fontSize: font.size.md, fontWeight: "600" },
  hint: { color: colors.textMuted, fontSize: font.size.xs, marginTop: 2 },
  note: { color: colors.textMuted, fontSize: font.size.xs, marginTop: spacing.lg, lineHeight: 17 },
});
