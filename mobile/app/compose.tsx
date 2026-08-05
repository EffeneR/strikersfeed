import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createTextPost } from "@/lib/posts";
import { Screen } from "@/components/ui";
import { colors, font, spacing } from "@/theme/tokens";

const MAX = 280;

/**
 * Native composer sheet. Text posting works today against the shared backend;
 * image/video/Medal attachments are wired next (image picker + Cloudflare Stream
 * upload) — the buttons below are placeholders and clearly labelled.
 */
export default function Compose() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX - text.length;
  const canPost = text.trim().length > 0 && remaining >= 0 && !busy;

  const submit = async () => {
    if (!canPost) return;
    setBusy(true);
    setError(null);
    const { error } = await createTextPost(text);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    router.back();
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={submit}
            disabled={!canPost}
            style={[styles.postBtn, !canPost && { opacity: 0.4 }]}
          >
            <Text style={styles.postBtnText}>{busy ? "Posting…" : "Post"}</Text>
          </Pressable>
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What's happening in Strikers Club?"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          style={styles.input}
          maxLength={MAX + 40}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.toolbar}>
          <Ionicons name="image-outline" size={22} color={colors.accent} />
          <Ionicons name="videocam-outline" size={22} color={colors.accent} />
          <Ionicons name="link-outline" size={22} color={colors.accent} />
          <Text style={[styles.count, remaining < 0 && { color: colors.live }]}>{remaining}</Text>
        </View>
        <Text style={styles.note}>Image, video and Medal attachments arrive in the next update.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  postBtn: { backgroundColor: colors.accent, borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 8 },
  postBtnText: { color: colors.black, fontWeight: "700" },
  input: { color: colors.text, fontSize: font.size.lg, paddingHorizontal: spacing.lg, flex: 1, textAlignVertical: "top" },
  error: { color: colors.live, paddingHorizontal: spacing.lg },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.lg,
  },
  count: { marginLeft: "auto", color: colors.textMuted },
  note: { color: colors.textMuted, fontSize: font.size.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
