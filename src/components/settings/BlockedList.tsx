"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { unblockUser } from "@/lib/moderation/actions";
import type { BlockedProfile } from "@/lib/moderation/queries";

/** Manage the accounts the current user has blocked. */
export function BlockedList({ initial }: { initial: BlockedProfile[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unblock = async (id: string) => {
    setBusyId(id);
    setError(null);
    const res = await unblockUser(id);
    setBusyId(null);
    if (!res.ok) {
      setError(res.error ?? "Couldn't unblock. Try again.");
      return;
    }
    setItems((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-muted">
        You haven&apos;t blocked anyone. Blocking an account hides their posts and
        replies from you.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-xs text-live">
          {error}
        </p>
      )}
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
        {items.map((p) => {
          const name = p.displayName ?? p.username ?? "Member";
          return (
            <li key={p.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={name} src={p.avatarUrl || undefined} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{name}</p>
                {p.username && <p className="truncate text-xs text-ink-muted">@{p.username}</p>}
              </div>
              <button
                type="button"
                onClick={() => void unblock(p.id)}
                disabled={busyId === p.id}
                className="shrink-0 rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                {busyId === p.id ? "…" : "Unblock"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
