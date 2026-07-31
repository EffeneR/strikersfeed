"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { PostSource, PostType } from "@/types/posts";

export interface PostActionResult {
  ok: boolean;
  id?: string;
  error?: string;
  /** True when Supabase isn't configured — caller should use demo behaviour. */
  demo?: boolean;
}

const MAX_BODY = 500;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

/** Server-side validation shared by create/update. */
function validateBody(raw: string): { body: string } | { error: string } {
  const body = raw.trim();
  if (body.length === 0) return { error: "Write something first." };
  if (body.length > MAX_BODY) {
    return { error: `Posts are limited to ${MAX_BODY} characters.` };
  }
  return { body };
}

export async function createTextPost(input: { body: string }): Promise<PostActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to post." };

  const validated = validateBody(input.body);
  if ("error" in validated) return { ok: false, error: validated.error };

  // Basic per-user rate limit (defence in depth alongside RLS).
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_MAX) {
    return { ok: false, error: "You're posting too fast — give it a moment." };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      type: PostType.TEXT,
      source: PostSource.NATIVE,
      body: validated.body,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Couldn't create the post." };
  }
  return { ok: true, id: data.id as string };
}

export async function updateTextPost(input: {
  id: string;
  body: string;
}): Promise<PostActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const validated = validateBody(input.body);
  if ("error" in validated) return { ok: false, error: validated.error };

  // RLS restricts the update to the caller's own rows.
  const { error } = await supabase
    .from("posts")
    .update({ body: validated.body })
    .eq("id", input.id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: input.id };
}

export async function deleteTextPost(input: { id: string }): Promise<PostActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  // Soft delete; RLS ensures only the owner can update the row.
  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: input.id };
}
