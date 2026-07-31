import type { AccountRole } from "@/config/accountRoles";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | null;
  displayName: string | null;
  username: string | null;
  role: AccountRole | null;
  avatarUrl: string | null;
}

/**
 * Returns the signed-in user + their profile on the server, or `null` when
 * Supabase isn't configured or nobody is signed in. Never throws; safe to call
 * from the root layout. Only touches cookies when Supabase is configured, so it
 * doesn't force dynamic rendering in the demo/mock build.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, role, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const meta = user.user_metadata as { display_name?: string; role?: string } | undefined;

    // Fall back to the email local-part for a usable @handle until a real
    // username is set on the profile.
    const handle = profile?.username ?? user.email?.split("@")[0] ?? null;

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: profile?.display_name ?? meta?.display_name ?? handle,
      username: handle,
      role: (profile?.role ?? meta?.role ?? null) as AccountRole | null,
      avatarUrl: profile?.avatar_url ?? null,
    };
  } catch {
    // Supabase unreachable / transient error — treat as signed out.
    return null;
  }
}
