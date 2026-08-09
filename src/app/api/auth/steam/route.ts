import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";
import { buildSteamLoginUrl } from "@/lib/steam/openid";

/** Initiate "Sign in through Steam" — redirect to Steam's OpenID endpoint.
 *  `?platform=mobile` is carried through the return_to so the callback knows to
 *  hand the session back to the native app instead of setting web cookies. */
export async function GET(req: NextRequest) {
  const base = SITE_URL || new URL(req.url).origin;
  if (!isSteamServerConfigured()) {
    return NextResponse.redirect(`${base}/login?error=steam_unavailable`);
  }
  const isMobile = req.nextUrl.searchParams.get("platform") === "mobile";
  const returnTo = isMobile
    ? `${base}/api/auth/steam/callback?platform=mobile`
    : `${base}/api/auth/steam/callback`;
  return NextResponse.redirect(buildSteamLoginUrl(base, returnTo));
}
