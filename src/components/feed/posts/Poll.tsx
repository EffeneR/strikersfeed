"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { PollOption } from "@/types";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Local-only poll. Votes are not persisted in Phase 1. */
export function Poll({ options }: { options: PollOption[] }) {
  const [votedId, setVotedId] = useState<string | null>(null);
  const baseTotal = options.reduce((sum, o) => sum + o.votes, 0);
  const total = baseTotal + (votedId ? 1 : 0);
  const revealed = votedId !== null;

  return (
    <div className="mt-3 space-y-2">
      {options.map((opt) => {
        const votes = opt.votes + (votedId === opt.id ? 1 : 0);
        const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
        const mine = votedId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={revealed}
            onClick={() => setVotedId(opt.id)}
            aria-label={`Vote ${opt.label}`}
            className={cn(
              "relative w-full overflow-hidden rounded-lg border text-left transition-colors",
              revealed
                ? "cursor-default border-line"
                : "border-line hover:border-accent/50 hover:bg-surface-hover",
            )}
          >
            {revealed && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 transition-all",
                  mine ? "bg-accent/20" : "bg-surface-hover",
                )}
                style={{ width: `${pct}%` }}
              />
            )}
            <span className="relative flex items-center justify-between gap-2 px-3 py-2">
              <span className="flex items-center gap-1.5 text-sm text-ink">
                {mine && <Check className="h-3.5 w-3.5 text-accent" />}
                {opt.label}
              </span>
              {revealed && (
                <span className="text-xs font-semibold tabular-nums text-ink-muted">
                  {pct}%
                </span>
              )}
            </span>
          </button>
        );
      })}
      <p className="text-xs text-ink-muted">
        {formatCount(total)} votes{revealed ? "" : " · tap to vote"}
      </p>
    </div>
  );
}
