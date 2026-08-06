import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { getProfile, pickAndUploadAvatar, updateProfile } from "@/lib/profiles";
import { useAuth } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { Field, PrimaryButton, Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

export default function EditProfile() {
  const { session } = useAuth();
  const uid = session?.user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!uid) return;
    void getProfile(uid).then((p) => {
      if (p) {
        setDisplayName(p.displayName === "Member" ? "" : p.displayName);
        setUsername(p.username ?? "");
        setBio(p.bio ?? "");
        setAvatarUrl(p.avatarUrl);
      }
      setLoading(false);
    });
  }, [uid]);

  const changePhoto = async () => {
    setUploading(true);
    setError(null);
    const res = await pickAndUploadAvatar();
    setUploading(false);
    if (res.canceled) return;
    if (res.error) return setError(res.error);
    if (res.url) setAvatarUrl(res.url);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await updateProfile({ displayName, username, bio, avatarUrl: avatarUrl ?? undefined });
    setBusy(false);
    if (res.error) return setError(res.error);
    setSaved(true);
    setTimeout(() => router.back(), 500);
  };

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
        <View style={styles.avatarRow}>
          <Avatar name={displayName || username || "You"} url={avatarUrl} size={72} />
          <Pressable onPress={changePhoto} style={styles.changeBtn} disabled={uploading}>
            <Text style={styles.changeText}>{uploading ? "Uploading…" : "Change photo"}</Text>
          </Pressable>
        </View>

        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" autoCapitalize="words" maxLength={50} />
        <Field label="Username" value={username} onChangeText={setUsername} placeholder="username" autoCapitalize="none" maxLength={20} />
        <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Tell the community about yourself" multiline maxLength={300} />

        {error && <Text style={styles.error}>{error}</Text>}
        {saved && <Text style={styles.saved}>Saved!</Text>}

        <View style={{ marginTop: spacing.md }}>
          <PrimaryButton title="Save changes" onPress={save} loading={busy} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg, marginBottom: spacing.xl },
  changeBtn: { borderColor: colors.border, borderWidth: 1, borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 8 },
  changeText: { color: colors.text, fontWeight: "600", fontSize: font.size.sm },
  error: { color: colors.live, fontSize: font.size.sm, marginBottom: spacing.sm },
  saved: { color: colors.accent, fontSize: font.size.sm, marginBottom: spacing.sm },
});
