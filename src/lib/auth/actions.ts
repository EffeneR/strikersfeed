"use server";

import type { AccountRole } from "@/config/accountRoles";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** True when the account was created but email confirmation is still needed. */
  needsConfirmation?: boolean;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  error: "Supabase isn't configured yet.",
};

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signUpAction(input: {
  email: string;
  password: string;
  displayName: string;
  role: AccountRole;
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    // Consumed by the `handle_new_user` trigger to populate the profile row.
    options: { data: { display_name: input.displayName, role: input.role } },
  });
  if (error) return { ok: false, error: error.message };

  // With email confirmation enabled, no session is returned until confirmed.
  return { ok: true, needsConfirmation: !data.session };
}

export async function signOutAction(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
}
