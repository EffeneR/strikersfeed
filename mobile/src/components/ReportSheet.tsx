import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  REPORT_REASONS,
  reportContent,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/moderation";
import { colors, font, radius, spacing } from "@/theme/tokens";

/**
 * Bottom-sheet report picker. Caller owns visibility + supplies the target.
 * Submits to the shared `content_reports` table (same backend as the website).
 */
export function ReportSheet({
  visible,
  onClose,
  targetType,
  targetId,
}: {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [busy, setBusy] = useState<ReportReason | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setBusy(null);
    setDone(false);
    setError(null);
    onClose();
  };

  const pick = async (reason: ReportReason) => {
    setBusy(reason);
    setError(null);
    const { error: err } = await reportContent({ targetType, targetId, reason });
    setBusy(null);
    if (err) return setError(err);
    setDone(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {done ? (
          <View style={{ paddingBottom: spacing.xl }}>
            <Text style={styles.title}>Report received</Text>
            <Text style={styles.sub}>
              Thanks — our moderators will review this. Content with multiple reports
              is hidden automatically while it&apos;s checked.
            </Text>
            <Pressable style={styles.doneBtn} onPress={close}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Report content</Text>
            <Text style={styles.sub}>Why are you reporting this?</Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <ScrollView style={{ maxHeight: 360 }}>
              {REPORT_REASONS.map((r) => (
                <Pressable
                  key={r.value}
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surface }]}
                  onPress={() => pick(r.value)}
                  disabled={busy !== null}
                >
                  <Text style={styles.rowText}>{r.label}</Text>
                  <Ionicons
                    name={busy === r.value ? "ellipsis-horizontal" : "chevron-forward"}
                    size={16}
                    color={colors.textMuted}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: font.size.lg, fontWeight: "700" },
  sub: { color: colors.textMuted, fontSize: font.size.sm, marginTop: 2, marginBottom: spacing.md },
  error: { color: colors.live, fontSize: font.size.sm, marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  rowText: { color: colors.text, fontSize: font.size.md },
  doneBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  doneText: { color: colors.black, fontWeight: "700", fontSize: font.size.md },
});
