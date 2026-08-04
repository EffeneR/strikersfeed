/**
 * Medal URL validation for the manual quick-post flow.
 *
 * Security: we ONLY parse and allowlist — we never fetch the URL server-side, so
 * there's no SSRF surface. Rejects non-Medal hosts, non-http(s) schemes
 * (incl. javascript:/data:), and anything that isn't a parseable URL. This keeps
 * localhost/IP/private targets out too (they aren't on the host allowlist).
 */

const ALLOWED_HOSTS = new Set(["medal.tv", "www.medal.tv"]);

export interface MedalUrlInfo {
  /** Normalised https URL (host + path + query, hash stripped). */
  url: string;
  host: string;
  creatorUsername?: string;
}

export type MedalUrlResult =
  | { ok: true; info: MedalUrlInfo }
  | { ok: false; error: string };

export function validateMedalUrl(input: string): MedalUrlResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Paste a Medal clip link." };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Only https links are allowed." };
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) {
    return { ok: false, error: "Only medal.tv clip links are allowed." };
  }

  // Best-effort creator handle from a /u/<username> path segment.
  const match = parsed.pathname.match(/\/u\/([A-Za-z0-9_.-]+)/);
  const creatorUsername = match ? match[1] : undefined;

  const url = `https://${host}${parsed.pathname}${parsed.search}`;
  return { ok: true, info: { url, host, creatorUsername } };
}
