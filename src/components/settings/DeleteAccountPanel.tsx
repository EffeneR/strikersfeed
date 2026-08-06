"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { deleteMyAccount } from "@/lib/moderation/actions";

const CONFIRM_WORD = "DELETE";

/**
 * Permanent account deletion. Requires an explicit typed confirmation, then
 * calls the server action (which removes the auth user + cascades their data)
 * and hard-reloads to the signed-out home page.
 */
export function DeleteAccountPanel() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    if (confirm.trim().toUpperCase() !== CONFIRM_WORD || busy) return;
    setBusy(true);
    setError(null);
    const res = await deleteMyAccount();
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Couldn't delete your account. Try again.");
      return;
    }
    // Hard navigation clears all in-memory session state.
    if (typeof window !== "undefined") window.location.assign("/");
  };

  return (
    <div className="rounded-xl border border-live/40 bg-live/5 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-live/10 text-live">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-ink">Delete account</h2>
          <p className="mt-1 text-sm text-ink-muted">
            This permanently deletes your profile, posts, comments, reactions and
            connections. This can&apos;t be undone.
          </p>
        </div>
      </div>

      <label htmlFor="confirm-delete" className="mt-4 block text-xs font-medium text-ink-muted">
        Type <span className="font-mono font-semibold text-live">{CONFIRM_WORD}</span> to confirm
      </label>
      <input
        id="confirm-delete"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="off"
        className="mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-live"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs text-live">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={remove}
        disabled={confirm.trim().toUpperCase() !== CONFIRM_WORD || busy}
        className="mt-4 w-full rounded-full bg-live px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? "Deleting…" : "Permanently delete my account"}
      </button>
    </div>
  );
}
