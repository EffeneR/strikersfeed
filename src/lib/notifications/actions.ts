"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Mark all of the signed-in user's notifications read. */
export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };
  const supabase = await createClient();
  if (!supabase) return { ok: false };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  return { ok: true };
}
