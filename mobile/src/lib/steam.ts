import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";

/**
 * Steam login + verification for the app. Login reuses the website's Steam
 * endpoints: we open `/api/auth/steam?platform=mobile` in a secure in-app
 * browser; the callback hands back a single-use magic-link token via the
 * `strikersfeed://steam-auth` deep link, which we exchange for a session.
 */

const SITE = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://strikersfeed.netlify.app").replace(/\/$/, "");
export const STEAM_ENABLED = process.env.EXPO_PUBLIC_STEAM_ENABLED === "true";

const RETURN_URL = "strikersfeed://steam-auth";

const LOGIN_ERRORS: Record<string, string> = {
  steam_unavailable: "Steam sign-in isn't available right now.",
  steam_failed: "Steam couldn't verify your login. Try again.",
  steam_bridge: "Couldn't link your Steam account.",
  steam_session: "Couldn't start your session. Try again.",
};

function parseReturn(url: string): URLSearchParams {
  const qs = url.split("?")[1] ?? "";
  return new URLSearchParams(qs);
}

export async function signInWithSteam(): Promise<{ error?: string; cancelled?: boolean }> {
  try {
    const authUrl = `${SITE}/api/auth/steam?platform=mobile`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL);

    if (result.type === "cancel" || result.type === "dismiss") return { cancelled: true };
    if (result.type !== "success" || !result.url) {
      return { error: "Steam sign-in didn't complete." };
    }

    const params = parseReturn(result.url);
    const err = params.get("error");
    if (err) return { error: LOGIN_ERRORS[err] ?? "Steam sign-in failed." };

    const tokenHash = params.get("token_hash");
    if (!tokenHash) return { error: "Steam sign-in didn't return a session." };

    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Steam sign-in failed." };
  }
}

/* ---------- profile-code verification (bearer-authed API routes) ---------- */

async function authedPost<T>(path: string, body?: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { ok: false, error: "Please sign in." } as T;
  try {
    const res = await fetch(`${SITE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body ?? {}),
    });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "Network error. Try again." } as T;
  }
}

export interface StartVerifyResult {
  ok: boolean;
  code?: string;
  persona?: string;
  error?: string;
}
export interface ConfirmVerifyResult {
  ok: boolean;
  persona?: string;
  error?: string;
}

export const startSteamVerification = (steamInput: string) =>
  authedPost<StartVerifyResult>("/api/steam/verify/start", { steamInput });

export const confirmSteamVerification = () =>
  authedPost<ConfirmVerifyResult>("/api/steam/verify/confirm");

export const unlinkSteam = () => authedPost<{ ok: boolean; error?: string }>("/api/steam/unlink");
