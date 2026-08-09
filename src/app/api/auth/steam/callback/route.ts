import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";
import { verifySteamAssertion } from "@/lib/steam/openid";
import { ensureSteamUser } from "@/lib/steam/bridge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Deep link the native app catches for the mobile Steam flow. */
const MOBILE_RETURN = "strikersfeed://steam-auth";

/** 302 to the app's custom scheme (raw Response — `redirect()` is for http URLs). */
function mobileRedirect(query: string): Response {
  return new Response(null, { status: 302, headers: { Location: `${MOBILE_RETURN}?${query}` } });
}

/**
 * Steam OpenID callback: verify the assertion, bridge to a Supabase user, mint a
 * session. Web (default) mints the session via `verifyOtp` (cookies) and lands in
 * the feed. Mobile (`?platform=mobile`) hands the single-use magic-link token back
 * to the app via a deep link; the app completes `verifyOtp` itself.
 */
export async function GET(req: NextRequest) {
  const base = SITE_URL || new URL(req.url).origin;
  const isMobile = req.nextUrl.searchParams.get("platform") === "mobile";

  // Fail path: deep-link error for mobile, /login?error for web (never returns on web).
  const fail = (code: string): Response => {
    if (isMobile) return mobileRedirect(`error=${code}`);
    redirect(`${base}/login?error=${code}`);
  };

  if (!isSteamServerConfigured()) return fail("steam_unavailable");

  const steamId = await verifySteamAssertion(req.nextUrl.searchParams);
  if (!steamId) return fail("steam_failed");

  const bridged = await ensureSteamUser(steamId);
  if (!bridged.ok || !bridged.email) return fail("steam_bridge");

  const admin = createAdminClient();
  const supabase = await createClient();
  if (!admin || !supabase) return fail("steam_bridge");

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: bridged.email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkErr || !tokenHash) return fail("steam_session");

  if (isMobile) {
    // Hand the single-use token to the app; it calls verifyOtp to set its session.
    return mobileRedirect(`token_hash=${encodeURIComponent(tokenHash)}`);
  }

  const { error: otpErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (otpErr) return fail("steam_session");

  redirect(`${base}/feed`);
}
