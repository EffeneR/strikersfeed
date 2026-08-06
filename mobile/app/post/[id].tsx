import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPost, type FeedPost } from "@/lib/posts";
import { addComment, deleteComment, getComments, type CommentView } from "@/lib/comments";
import { useAuth } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";
import { ReportSheet } from "@/components/ReportSheet";
import { Screen } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { colors, font, radius, spacing } from "@/theme/tokens";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? null;

  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<CommentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, c] = await Promise.all([getPost(id), getComments(id)]);
    setPost(p);
    setComments(c);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!id || text.trim().length === 0 || busy) return;
    setBusy(true);
    const { error } = await addComment(id, text);
    setBusy(false);
    if (error) return;
    setText("");
    const c = await getComments(id);
    setComments(c);
  };

  const removeComment = async (cid: string) => {
    const { error } = await deleteComment(cid);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== cid));
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

  if (!post) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>This post is unavailable.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={
            <View>
              <PostCard post={post} currentUserId={currentUserId} disablePress onRemoved={() => router.back()} />
              <Text style={styles.repliesLabel}>Replies</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.comment}>
              <Pressable onPress={() => router.push(`/user/${item.author.id}`)} hitSlop={6}>
                <Avatar name={item.author.displayName} url={item.author.avatarUrl} size={32} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <View style={styles.cHead}>
                  <Text style={styles.cName} numberOfLines={1}>
                    {item.author.displayName}
                  </Text>
                  <Text style={styles.cMeta} numberOfLines={1}>
                    @{item.author.handle} · {timeAgo(item.createdAt)}
                  </Text>
                  {item.isOwn ? (
                    <Pressable onPress={() => removeComment(item.id)} hitSlop={8} style={{ marginLeft: "auto" }}>
                      <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                    </Pressable>
                  ) : (
                    currentUserId && (
                      <Pressable onPress={() => setReportingId(item.id)} hitSlop={8} style={{ marginLeft: "auto" }}>
                        <Ionicons name="flag-outline" size={15} color={colors.textMuted} />
                      </Pressable>
                    )
                  )}
                </View>
                <Text style={styles.cBody}>{item.body}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No replies yet. Be the first.</Text>
          }
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />

        {currentUserId ? (
          <View style={styles.composer}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Write a reply…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={500}
              multiline
            />
            <Pressable
              onPress={submit}
              disabled={busy || text.trim().length === 0}
              style={[styles.send, (busy || text.trim().length === 0) && { opacity: 0.4 }]}
            >
              <Text style={styles.sendText}>Reply</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.composer}>
            <Text style={{ color: colors.textMuted, fontSize: font.size.sm }}>Sign in to reply.</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      <ReportSheet
        visible={reportingId !== null}
        onClose={() => setReportingId(null)}
        targetType="comment"
        targetId={reportingId ?? ""}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  repliesLabel: {
    color: colors.textMuted,
    fontSize: font.size.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  comment: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  cHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  cName: { color: colors.text, fontWeight: "700", fontSize: font.size.sm, flexShrink: 1 },
  cMeta: { color: colors.textMuted, fontSize: font.size.xs, flexShrink: 1 },
  cBody: { color: colors.text, fontSize: font.size.sm, marginTop: 2, lineHeight: 19 },
  empty: { color: colors.textMuted, fontSize: font.size.sm, textAlign: "center", padding: spacing.xl },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    padding: spacing.md,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: font.size.sm,
  },
  send: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendText: { color: colors.black, fontWeight: "700", fontSize: font.size.sm },
});
