import { STEAM_WEB_API_KEY } from "./config";

const BASE = "https://api.steampowered.com/ISteamUser";

export interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatarfull?: string;
  profileurl?: string;
  /** The public "Real Name" profile field — used for code verification. */
  realname?: string;
}

/** Resolve a vanity handle to a SteamID64, or null. */
export async function resolveVanity(vanity: string): Promise<string | null> {
  try {
    const url = `${BASE}/ResolveVanityURL/v1/?key=${STEAM_WEB_API_KEY}&vanityurl=${encodeURIComponent(vanity)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.response?.success === 1 ? (json.response.steamid as string) : null;
  } catch {
    return null;
  }
}

/** Fetch a public player summary, or null. */
export async function getPlayerSummary(steamId64: string): Promise<SteamPlayer | null> {
  try {
    const url = `${BASE}/GetPlayerSummaries/v2/?key=${STEAM_WEB_API_KEY}&steamids=${steamId64}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const p = json?.response?.players?.[0];
    if (!p) return null;
    return {
      steamid: p.steamid,
      personaname: p.personaname,
      avatarfull: p.avatarfull,
      profileurl: p.profileurl,
      realname: p.realname,
    };
  } catch {
    return null;
  }
}
