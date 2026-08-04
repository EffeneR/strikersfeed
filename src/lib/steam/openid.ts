/**
 * Steam OpenID 2.0 ("Sign in through Steam"). Steam has no OAuth — this is the
 * only login mechanism, and it returns just a SteamID64. The assertion is
 * verified SERVER-SIDE by echoing the params back to Steam.
 */

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

export function buildSteamLoginUrl(realm: string, returnTo: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID}?${params.toString()}`;
}

/**
 * Verify the callback params against Steam and return the SteamID64, or null.
 * Re-sends every `openid.*` param with mode=check_authentication so Steam
 * confirms the signature — never trust the raw redirect.
 */
export async function verifySteamAssertion(query: URLSearchParams): Promise<string | null> {
  const claimedId = query.get("openid.claimed_id") ?? "";
  const match = claimedId.match(/\/openid\/id\/(\d{17})$/);
  if (!match) return null;

  const body = new URLSearchParams();
  for (const [key, value] of query.entries()) {
    if (key.startsWith("openid.")) body.set(key, value);
  }
  body.set("openid.mode", "check_authentication");

  try {
    const res = await fetch(STEAM_OPENID, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    return /is_valid\s*:\s*true/i.test(text) ? match[1] : null;
  } catch {
    return null;
  }
}
