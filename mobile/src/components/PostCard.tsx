import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { deletePost, toggleReaction, type FeedPost } from "@/lib/posts";
import { blockUser } from "@/lib/moderation";
import { timeAgo } from "@/lib/format";
import { Avatar } from "./Avatar";
import { ReportSheet } from "./ReportSheet";
import { colors, font, radius, spacing } from "@/theme/tokens";

export function PostCard({
  post,
  currentUserId,
  onRemoved,
  onBlockedAuthor,
  disablePress = false,
}: {
  post: FeedPost;
  currentUserId: string | null;
  onRemoved?: (postId: string) => void;
  onBlockedAuthor?: (authorId: string) => void;
  disablePress?: boolean;
}) {
  const [liked, setLiked] = useState(post.viewerLiked);
  const [likes, setLikes] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.viewerBookmarked);
  const [reportOpen, setReportOpen] = useState(false);

  const isOwn = !!currentUserId && post.author.id === currentUserId;

  const openPost = () => {
    if (!disablePress) router.push(`/post/${post.id}`);
  };
  const openAuthor = () => router.push(`/user/${post.author.id}`);

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    void toggleReaction(post.id, "like");
  };
  const onBookmark = () => {
    setBookmarked((b) => !b);
    void toggleReaction(post.id, "bookmark");
  };

  const confirmDelete = () =>
    Alert.alert("Delete post?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await deletePost(post.id);
          if (error) Alert.alert("Couldn't delete", error);
          else onRemoved?.(post.id);
        },
      },
    ]);

  const confirmBlock = () =>
    Alert.alert(`Block @${post.author.handle}?`, "You won't see their posts anymore.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Block",
        style: "destructive",
        onPress: async () => {
          const { error } = await blockUser(post.author.id);
          if (error) Alert.alert("Couldn't block", error);
          else onBlockedAuthor?.(post.author.id);
        },
      },
    ]);

  const openMenu = () => {
    if (isOwn) {
      Alert.alert("Post options", undefined, [
        { text: "Delete post", style: "destructive", onPress: confirmDelete },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert(`@${post.author.handle}`, undefined, [
        { text: "Report post", onPress: () => setReportOpen(true) },
        { text: `Block @${post.author.handle}`, style: "destructive", onPress: confirmBlock },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <Pressable onPress={openPost} style={styles.card}>
      <View style={styles.authorRow}>
        <Pressable onPress={openAuthor} hitSlop={6}>
          <Avatar name={post.author.displayName} url={post.author.avatarUrl} size={38} />
        </Pressable>
        <Pressable onPress={openAuthor} style={{ flex: 1 }} hitSlop={6}>
          <View style={styles.nameLine}>
            <Text style={styles.name} numberOfLines={1}>
              {post.author.displayName}
            </Text>
            {post.author.steamVerified && (
              <Ionicons name="shield-checkmark" size={13} color={colors.accent} />
            )}
            <Text style={styles.handle} numberOfLines={1}>
              @{post.author.handle} · {timeAgo(post.createdAt)}
            </Text>
          </View>
        </Pressable>
        {currentUserId && (
          <Pressable onPress={openMenu} hitSlop={10}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {post.body ? <Text style={styles.body}>{post.body}</Text> : null}

      {post.imageUrls.map((uri) => (
        <Image key={uri} source={{ uri }} style={styles.media} contentFit="cover" />
      ))}

      {post.medalUrl && (
        <Pressable
          onPress={() => Linking.openURL(post.medalUrl as string)}
          style={styles.medal}
        >
          <Ionicons name="play-circle" size={20} color={colors.accent} />
          <Text style={styles.medalText} numberOfLines={1}>
            Watch clip on Medal
            {post.creatorUsername ? ` · @${post.creatorUsername}` : ""}
          </Text>
          <Ionicons name="open-outline" size={15} color={colors.textMuted} />
        </Pressable>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={openPost} hitSlop={8}>
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
          <Text style={styles.count}>{post.commentCount}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onLike} hitSlop={8}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={17}
            color={liked ? colors.live : colors.textMuted}
          />
          <Text style={[styles.count, liked && { color: colors.live }]}>{likes}</Text>
        </Pressable>
        <Pressable style={styles.action} onPress={onBookmark} hitSlop={8}>
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={16}
            color={bookmarked ? colors.accent : colors.textMuted}
          />
        </Pressable>
      </View>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.lg },
  authorRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { color: colors.text, fontWeight: "700", fontSize: font.size.sm, flexShrink: 1 },
  handle: { color: colors.textMuted, fontSize: font.size.xs, flexShrink: 1 },
  body: { color: colors.text, fontSize: font.size.md, marginTop: 8, lineHeight: 21 },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
  },
  medal: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  medalText: { color: colors.text, fontSize: font.size.sm, flex: 1 },
  actions: { flexDirection: "row", gap: spacing.xl, marginTop: spacing.md, alignItems: "center" },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  count: { color: colors.textMuted, fontSize: font.size.xs },
});
