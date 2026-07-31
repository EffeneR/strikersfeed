"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard, ImageIcon, ListChecks, Swords } from "lucide-react";
import { CURRENT_USER_ID, getUser } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/components/providers/SessionProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createTextPost } from "@/lib/posts/actions";
import { cn } from "@/lib/cn";

const MAX = 280;

const OPTIONS = [
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "clip", label: "Clip", icon: Clapperboard },
  { key: "poll", label: "Poll", icon: ListChecks },
  { key: "match", label: "Match", icon: Swords },
] as const;

/**
 * Post composer.
 * - Supabase mode: creates a real DB text post (server action), then refreshes
 *   the feed. Draft text is preserved on error; the field resets only on a
 *   confirmed successful create. Submitting is disabled while in flight.
 * - Demo mode: inserts a session-local post via `onDemoPost` (Phase 1 behaviour).
 * Image/Clip/Poll/Match remain affordances until later slices.
 */
export function PostComposer({ onDemoPost }: { onDemoPost: (text: string) => void }) {
  const router = useRouter();
  const { displayName } = useSession();
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const me = getUser(CURRENT_USER_ID);
  const avatarName = displayName ?? me?.displayName ?? "You";

  const remaining = MAX - text.length;
  const tooLong = remaining < 0;
  const canPost = text.trim().length > 0 && !tooLong && !submitting;

  const submit = async () => {
    if (!canPost) return;
    setError(null);

    if (!isSupabaseConfigured()) {
      onDemoPost(text.trim());
      setText("");
      setNote(null);
      return;
    }

    setSubmitting(true);
    const result = await createTextPost({ body: text.trim() });

    if (result.demo) {
      onDemoPost(text.trim());
      setText("");
      setNote(null);
      setSubmitting(false);
      return;
    }
    if (!result.ok) {
      setError(result.error ?? "Couldn't post. Please try again.");
      setSubmitting(false);
      return; // preserve the draft
    }

    setText("");
    setNote(null);
    setSubmitting(false);
    router.refresh();
  };

  return (
    <div className="border-b border-line px-4 py-3">
      <div className="flex gap-3">
        <Avatar name={avatarName} src={me?.avatarUrl || undefined} size={44} />
        <div className="min-w-0 flex-1">
          <label htmlFor="composer" className="sr-only">
            What&apos;s happening in Strikers Club?
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit();
            }}
            rows={2}
            placeholder="What's happening in Strikers Club?"
            className="w-full resize-none bg-transparent pt-2 text-[15px] text-ink outline-none placeholder:text-ink-muted"
          />

          {note && <p className="mb-1 text-xs text-ink-muted">{note}</p>}
          {error && (
            <p role="alert" className="mb-1 text-xs text-live">
              {error}
            </p>
          )}

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
                        `${opt.label} attachments arrive in a later slice — text posts work now.`,
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
                onClick={() => void submit()}
                disabled={!canPost}
                className="inline-flex h-9 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent"
              >
                {submitting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
