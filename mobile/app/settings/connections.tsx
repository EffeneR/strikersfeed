import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getProfile, type ProfileView } from "@/lib/profiles";
import {
  confirmSteamVerification,
  startSteamVerification,
  unlinkSteam,
} from "@/lib/steam";
import { Field, PrimaryButton, Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

export default function Connections() {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;

  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamInput, setSteamInput] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (uid) setProfile(await getProfile(uid));
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const start = async () => {
    setBusy(true);
    setError(null);
    const res = await startSteamVerification(steamInput);
    setBusy(false);
    if (!res.ok || !res.code) return setError(res.error ?? "Couldn't start verification.");
    setCode(res.code);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await confirmSteamVerification();
    setBusy(false);
    if (!res.ok) return setError(res.error ?? "Couldn't verify yet.");
    setCode(null);
    setSteamInput("");
    await load();
  };

  const unlink = () =>
    Alert.alert("Disconnect Steam?", "Your verified badge will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        onPress: async () => {
          const res = await unlinkSteam();
          if (!res.ok) Alert.alert("Couldn't disconnect", res.error ?? "Try again.");
          else await load();
        },
      },
    ]);

  if (loading) {
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
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.head}>
          <Ionicons name="logo-steam" size={22} color={colors.accent} />
          <Text style={styles.title}>Steam</Text>
        </View>
        <Text style={styles.sub}>
          Verify you own a Steam account so others know you&apos;re the real player — the basis
          for tournaments and matchmaking.
        </Text>

        {profile?.steamVerified ? (
          <View style={styles.card}>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
              <Text style={styles.verifiedText}>Steam verified</Text>
            </View>
            <PrimaryButton title="Disconnect Steam" onPress={unlink} />
          </View>
        ) : code ? (
          <View style={styles.card}>
            <Text style={styles.step}>1. Copy this code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{code}</Text>
            </View>
            <Text style={styles.step}>2. On Steam: Edit Profile → set “Real Name” to the code → Save.</Text>
            <Text style={styles.step}>3. Come back and verify.</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={{ height: spacing.sm }} />
            <PrimaryButton title="Verify now" onPress={confirm} loading={busy} />
          </View>
        ) : (
          <View style={styles.card}>
            <Field
              label="Your Steam profile"
              value={steamInput}
              onChangeText={setSteamInput}
              placeholder="steamcommunity.com/id/you  ·  or SteamID64"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton
              title="Get my code"
              onPress={start}
              loading={busy}
              disabled={steamInput.trim().length === 0}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: spacing.sm, lineHeight: 20 },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  verifiedText: { color: colors.text, fontSize: font.size.md, fontWeight: "700" },
  step: { color: colors.textMuted, fontSize: font.size.sm, lineHeight: 20 },
  codeBox: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  code: { color: colors.accent, fontSize: font.size.xl, fontWeight: "800", letterSpacing: 2 },
  error: { color: colors.live, fontSize: font.size.sm },
});
