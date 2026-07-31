"use client";

import { useState } from "react";
import { Clapperboard, ImageIcon, ListChecks, Swords } from "lucide-react";
import { CURRENT_USER_ID, getUser } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

const MAX = 280;

const OPTIONS = [
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "clip", label: "Clip", icon: Clapperboard },
  { key: "poll", label: "Poll", icon: ListChecks },
  { key: "match", label: "Match", icon: Swords },
] as const;

/**
 * Post composer. Phase 1: text posting works and inserts a session-local post.
 * Rich attachments (media/clip/poll/match) are affordances only until the
 * upload + Supabase pipeline lands — no real upload happens and nothing is
 * saved to a backend.
 */
export function PostComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const me = getUser(CURRENT_USER_ID);

  const remaining = MAX - text.length;
  const tooLong = remaining < 0;
  const canPost = text.trim().length > 0 && !tooLong;

  const submit = () => {
    if (!canPost) return;
    onSubmit(text.trim());
    setText("");
    setNote(null);
  };

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="flex gap-3">
        {me && (
          <Avatar name={me.displayName} src={me.avatarUrl || undefined} size={44} />
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor="composer" className="sr-only">
            What&apos;s happening in Strikers Club?
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            rows={2}
            placeholder="What's happening in Strikers Club?"
            className="w-full resize-none bg-transparent pt-2 text-[15px] text-ink outline-none placeholder:text-ink-muted"
          />

          {note && <p className="mb-1 text-xs text-ink-muted">{note}</p>}

          <div className="mt-1 flex items-center justify-between border-t border-line pt-2">
            <div className="-ml-1.5 flex items-center gap-0.5">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    aria-label={opt.label}
                    onClick={() =>
                      setNote(
                        `${opt.label} attachments arrive with the upload pipeline — text posts work now.`,
                      )
                    }
                    className="flex h-8 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs tabular-nums",
                  tooLong ? "text-live" : remaining <= 20 ? "text-ink" : "text-ink-muted",
                )}
                aria-live="polite"
              >
                {remaining}
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className="inline-flex h-9 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
