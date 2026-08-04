"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ExternalLink } from "lucide-react";
import {
  confirmSteamVerification,
  startSteamVerification,
  unlinkSteam,
} from "@/lib/steam/actions";
import { STEAM_ENABLED } from "@/lib/supabase/config";
import { Card } from "@/components/ui/Card";

interface Props {
  verified: boolean;
  persona: string | null;
  steamId: string | null;
}

export function SteamConnection({ verified, persona, steamId }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    const res = await startSteamVerification({ steamInput: input });
    setBusy(false);
    if (!res.ok || !res.code) {
      setError(res.error ?? "Couldn't start verification.");
      return;
    }
    setCode(res.code);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const res = await confirmSteamVerification();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't verify.");
      return;
    }
    setCode(null);
    router.refresh();
  };

  const disconnect = async () => {
    if (typeof window !== "undefined" && !window.confirm("Disconnect your Steam account?")) return;
    setBusy(true);
    await unlinkSteam();
    setBusy(false);
    router.refresh();
  };

  if (verified) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <BadgeCheck className="h-5 w-5 text-accent" />
          Steam verified
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          Linked to <span className="text-ink">{persona ?? steamId}</span>. Your profile
          shows a verified badge so nobody can impersonate you.
        </p>
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-live/50 hover:text-live disabled:opacity-50"
        >
          Disconnect Steam
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Verify your Steam account</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Prove you own your Steam account without connecting anything — just paste a
        one-time code into your own profile. This unlocks a verified badge (and, later,
        tournaments &amp; matchmaking).
      </p>

      {!STEAM_ENABLED && (
        <p className="mt-3 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
          Steam verification isn&apos;t enabled on this deployment yet.
        </p>
      )}

      {!code ? (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="steam-input" className="mb-1.5 block text-sm font-medium text-ink">
              Your Steam profile
            </label>
            <input
              id="steam-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="steamcommunity.com/id/yourname or a SteamID"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            onClick={start}
            disabled={busy || input.trim().length === 0}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? "Working…" : "Get verification code"}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-muted">
            <li>
              Copy this code:{" "}
              <span className="rounded bg-surface px-2 py-0.5 font-mono text-sm text-accent">
                {code}
              </span>
            </li>
            <li>
              On Steam, open{" "}
              <span className="inline-flex items-center gap-1 text-ink">
                Edit Profile → Real Name <ExternalLink className="h-3 w-3" />
              </span>
              , paste the code and <span className="text-ink">Save</span>.
            </li>
            <li>Come back and click Verify. You can remove the code afterwards.</li>
          </ol>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {busy ? "Checking…" : "I've added it — Verify"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(null);
                setError(null);
              }}
              className="text-sm text-ink-muted hover:text-ink"
            >
              Start over
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-live">
          {error}
        </p>
      )}
    </Card>
  );
}
