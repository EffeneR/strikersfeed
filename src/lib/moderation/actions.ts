"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import {
  MAX_REPORT_DETAILS,
  REPORT_REASON_VALUES,
  type ReportReason,
  type ReportTargetType,
} from "@/config/moderation";

export interface ModerationResult {
  ok: boolean;
  error?: string;
  /** True when Supabase isn't configured — caller should use demo behaviour. */
  demo?: boolean;
  /** For reportContent: the report already existed (idempotent success). */
  already?: boolean;
}

const TARGET_TYPES: ReportTargetType[] = ["post", "comment", "profile", "clip"];

/** File a report against a piece of content. Idempotent per (user, target). */
export async function reportContent(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<ModerationResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to report content." };

  if (!TARGET_TYPES.includes(input.targetType)) {
    return { ok: false, error: "Unknown report target." };
  }
  if (!REPORT_REASON_VALUES.includes(input.reason)) {
    return { ok: false, error: "Pick a reason for the report." };
  }
  if (!input.targetId) return { ok: false, error: "Nothing to report." };

  const details = (input.details ?? "").trim();
  if (details.length > MAX_REPORT_DETAILS) {
    return { ok: false, error: `Keep details under ${MAX_REPORT_DETAILS} characters.` };
  }

  const { error } = await supabase.from("content_reports").insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: details || null,
  });

  // Unique violation = the user already reported this target. Treat as success.
  if (error) {
    if (error.code === "23505") return { ok: true, already: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Hide another account's content from the current user. */
export async function blockUser(userId: string): Promise<ModerationResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };
  if (!userId || userId === user.id) return { ok: false, error: "You can't block yourself." };

  const { error } = await supabase
    .from("blocked_users")
    .insert({ blocker_id: user.id, blocked_id: userId });

  if (error && error.code !== "23505") return { ok: false, error: error.message };
  return { ok: true };
}

/** Reverse a block. */
export async function unblockUser(userId: string): Promise<ModerationResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Permanently delete the signed-in user's account (auth user + cascading
 * profile, posts, comments, reactions). Required by both app stores for any app
 * that lets users create an account. Needs the service-role admin client.
 */
export async function deleteMyAccount(): Promise<ModerationResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  if (!isAdminConfigured()) {
    return {
      ok: false,
      error: "Account deletion isn't available yet — the server admin key isn't configured.",
    };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Account deletion is temporarily unavailable." };

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };

  // Clear the now-orphaned session cookies so the client lands signed out.
  await supabase.auth.signOut();
  return { ok: true };
}
