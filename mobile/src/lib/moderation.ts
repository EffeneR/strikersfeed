import { supabase } from "./supabase";

/**
 * Mobile moderation — talks to the SAME Supabase tables as the website
 * (content_reports, blocked_users) so reports and blocks are shared across web
 * and app. Requires migration 0010. Account deletion goes through the
 * `delete-account` Edge Function because the app can't (and must not) hold the
 * service-role key.
 */

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate"
  | "violence"
  | "sexual"
  | "self_harm"
  | "misinformation"
  | "impersonation"
  | "misattribution"
  | "off_topic"
  | "other";

export type ReportTargetType = "post" | "comment" | "profile" | "clip";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate speech" },
  { value: "violence", label: "Violence or dangerous acts" },
  { value: "sexual", label: "Sexual or adult content" },
  { value: "self_harm", label: "Self-harm" },
  { value: "misinformation", label: "Misinformation" },
  { value: "impersonation", label: "Impersonation" },
  { value: "misattribution", label: "Misattributed clip" },
  { value: "off_topic", label: "Not about Strikers Club" },
  { value: "other", label: "Something else" },
];

export interface BlockedProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export async function reportContent(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to report." };

  const { error } = await supabase.from("content_reports").insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: input.details?.trim() || null,
  });
  // Unique violation = already reported; treat as success.
  if (error && error.code !== "23505") return { error: error.message };
  return {};
}

export async function blockUser(userId: string): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };
  if (userId === user.id) return { error: "You can't block yourself." };

  const { error } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: user.id, blocked_id: userId });
  if (error && error.code !== "23505") return { error: error.message };
  return {};
}

export async function unblockUser(userId: string): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", userId);
  return { error: error?.message };
}

export async function getBlockedProfiles(): Promise<BlockedProfile[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("blocked_users")
    .select("blocked_id, profiles:blocked_id ( id, username, display_name, avatar_url )")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
      | null;
    return {
      id: (p?.id ?? row.blocked_id) as string,
      username: p?.username ?? null,
      displayName: p?.display_name ?? null,
      avatarUrl: p?.avatar_url ?? null,
    };
  });
}

/** Return the set of account ids the signed-in user has blocked (for feed filtering). */
export async function getBlockedIds(): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("blocked_users")
    .select("blocked_id")
    .eq("blocker_id", user.id);
  return new Set((data ?? []).map((r) => (r as { blocked_id: string }).blocked_id));
}

/**
 * Permanently delete the signed-in user's account via the `delete-account`
 * Edge Function (deployed with the service-role key server-side). Signs the user
 * out locally on success.
 */
export async function deleteAccount(): Promise<{ error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { error: "Please sign in." };

  const { error } = await supabase.functions.invoke("delete-account", {
    method: "POST",
  });
  if (error) {
    return {
      error:
        "Couldn't delete your account. If this keeps happening, contact support@strikersfeed.club.",
    };
  }
  await supabase.auth.signOut();
  return {};
}
