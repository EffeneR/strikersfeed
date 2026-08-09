import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolve the Supabase user id from an `Authorization: Bearer <access_token>`
 * header — the auth path for the native app (which has no cookies). Validates the
 * JWT with Supabase; returns null if missing/invalid. SERVER ONLY.
 */
export async function userIdFromBearer(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error) return null;
  return data.user?.id ?? null;
}
