import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";
import { buildSteamLoginUrl } from "@/lib/steam/openid";

/** Initiate "Sign in through Steam" — redirect to Steam's OpenID endpoint. */
export async function GET(req: NextRequest) {
  const base = SITE_URL || new URL(req.url).origin;
  if (!isSteamServerConfigured()) {
    return NextResponse.redirect(`${base}/login?error=steam_unavailable`);
  }
  const returnTo = `${base}/api/auth/steam/callback`;
  return NextResponse.redirect(buildSteamLoginUrl(base, returnTo));
}
