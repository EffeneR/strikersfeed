"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface UpdateProfileResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(input: {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl?: string;
}): Promise<UpdateProfileResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Not available in demo mode." };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not available in demo mode." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const displayName = input.displayName.trim();
  if (displayName.length === 0) return { ok: false, error: "Display name is required." };
  if (displayName.length > 50) return { ok: false, error: "Display name is too long." };

  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      error: "Username must be 3–20 chars: lowercase letters, numbers or underscores.",
    };
  }

  const bio = input.bio.trim().slice(0, 300);

  const patch: Record<string, unknown> = {
    display_name: displayName,
    username,
    bio,
  };
  if (input.avatarUrl) patch.avatar_url = input.avatarUrl;

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) {
    // 23505 = unique_violation on the username column.
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "That username is already taken." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
