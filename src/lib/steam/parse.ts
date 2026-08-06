/**
 * Parse a user-supplied Steam reference into either a SteamID64 or a vanity
 * name to resolve. Accepts: a bare 17-digit id, a profile URL
 * (steamcommunity.com/profiles/{id} or /id/{vanity}), or a bare vanity handle.
 */
export interface SteamRef {
  steamId64?: string;
  vanity?: string;
}

export function parseSteamInput(input: string): SteamRef | null {
  const raw = input.trim();
  if (!raw) return null;

  if (/^\d{17}$/.test(raw)) return { steamId64: raw };

  let url: URL | null = null;
  try {
    url = new URL(raw);
  } catch {
    /* not a URL — fall through to vanity check */
  }

  if (url) {
    const host = url.hostname.toLowerCase();
    if (host !== "steamcommunity.com" && host !== "www.steamcommunity.com") return null;
    const profiles = url.pathname.match(/\/profiles\/(\d{17})/);
    if (profiles) return { steamId64: profiles[1] };
    const vanity = url.pathname.match(/\/id\/([A-Za-z0-9_.-]+)/);
    if (vanity) return { vanity: vanity[1] };
    return null;
  }

  if (/^[A-Za-z0-9_.-]{2,64}$/.test(raw)) return { vanity: raw };
  return null;
}
