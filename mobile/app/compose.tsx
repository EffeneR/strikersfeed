import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createImagePost, createTextPost } from "@/lib/posts";
import { MAX_IMAGES, pickImages, uploadImages, type PickedImage } from "@/lib/media";
import { Screen } from "@/components/ui";
import { colors, font, radius, spacing } from "@/theme/tokens";

const MAX = 280;

/**
 * Native composer sheet. Text + image posting work against the shared backend.
 * Native video + Medal attachments are the remaining media work (video needs a
 * Cloudflare Stream account — see mobile/README.md).
 */
export default function Compose() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX - text.length;
  const canPost =
    (text.trim().length > 0 || images.length > 0) && remaining >= 0 && !busy;

  const addImages = async () => {
    try {
      const picked = await pickImages(MAX_IMAGES - images.length);
      if (picked.length) setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    } catch (e) {
      Alert.alert("Can't add photos", e instanceof Error ? e.message : "Try again.");
    }
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((i) => i.uri !== uri));

  const submit = async () => {
    if (!canPost) return;
    setBusy(true);
    setError(null);

    if (images.length > 0) {
      const uploaded = await uploadImages(images);
      if (uploaded.error || !uploaded.paths) {
        setBusy(false);
        setError(uploaded.error ?? "Couldn't upload images.");
        return;
      }
      const { error: postErr } = await createImagePost(text, uploaded.paths);
      setBusy(false);
      if (postErr) return setError(postErr);
      router.back();
      return;
    }

    const { error: postErr } = await createTextPost(text);
    setBusy(false);
    if (postErr) return setError(postErr);
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

        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
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

          {images.length > 0 && (
            <View style={styles.thumbs}>
              {images.map((img) => (
                <View key={img.uri} style={styles.thumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} />
                  <Pressable onPress={() => removeImage(img.uri)} style={styles.thumbRemove} hitSlop={6}>
                    <Ionicons name="close" size={14} color={colors.black} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.toolbar}>
          <Pressable onPress={addImages} disabled={images.length >= MAX_IMAGES} hitSlop={8}>
            <Ionicons
              name="image-outline"
              size={22}
              color={images.length >= MAX_IMAGES ? colors.textMuted : colors.accent}
            />
          </Pressable>
          <Ionicons name="videocam-outline" size={22} color={colors.textMuted} />
          <Ionicons name="link-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.count, remaining < 0 && { color: colors.live }]}>{remaining}</Text>
        </View>
        <Text style={styles.note}>
          Photos are live. Video and Medal attachments arrive in the next update.
        </Text>
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
  postBtn: { backgroundColor: colors.accent, borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 8 },
  postBtnText: { color: colors.onAccent, fontWeight: "800", letterSpacing: 0.3 },
  input: { color: colors.text, fontSize: font.size.lg, paddingHorizontal: spacing.lg, minHeight: 120, textAlignVertical: "top" },
  thumbs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  thumbWrap: { position: "relative" },
  thumb: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.surface },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.accent,
    borderRadius: 9999,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  error: { color: colors.live, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
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
