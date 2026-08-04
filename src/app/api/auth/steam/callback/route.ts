import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";
import { verifySteamAssertion } from "@/lib/steam/openid";
import { ensureSteamUser } from "@/lib/steam/bridge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Steam OpenID callback: verify the assertion, bridge to a Supabase user, mint a
 * session, and land the user in the feed. Uses next/navigation `redirect` so the
 * session cookies set by `verifyOtp` are preserved on the redirect.
 */
export async function GET(req: NextRequest) {
  const base = SITE_URL || new URL(req.url).origin;

  if (!isSteamServerConfigured()) redirect(`${base}/login?error=steam_unavailable`);

  const steamId = await verifySteamAssertion(req.nextUrl.searchParams);
  if (!steamId) redirect(`${base}/login?error=steam_failed`);

  const bridged = await ensureSteamUser(steamId);
  if (!bridged.ok || !bridged.email) redirect(`${base}/login?error=steam_bridge`);

  const admin = createAdminClient();
  const supabase = await createClient();
  if (!admin || !supabase) redirect(`${base}/login?error=steam_bridge`);

  const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: bridged.email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkErr || !tokenHash) redirect(`${base}/login?error=steam_session`);

  const { error: otpErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (otpErr) redirect(`${base}/login?error=steam_session`);

  redirect(`${base}/feed`);
}
