"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Trash2 } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { ReportDialog } from "@/components/moderation/ReportDialog";
import {
  addComment,
  deleteComment,
  getPostComments,
  type CommentView,
} from "@/lib/posts/comments";
import { timeAgo } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";

const MAX = 500;

export function CommentThread({
  postId,
  persistent,
}: {
  postId: string;
  persistent: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated, mode } = useSession();
  const signedIn = mode === "supabase" && isAuthenticated;

  const [comments, setComments] = useState<CommentView[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const load = () => {
    void getPostComments(postId).then(setComments);
  };

  useEffect(() => {
    if (persistent) load();
    else setComments([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, persistent]);

  if (!persistent) {
    return (
      <div className="mt-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs text-ink-muted">
        Replies are available on live posts.
      </div>
    );
  }

  const submit = async () => {
    if (text.trim().length === 0 || busy) return;
    setBusy(true);
    setError(null);
    const res = await addComment({ postId, body: text.trim() });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't reply.");
      return;
    }
    setText("");
    load();
    router.refresh(); // keeps the reply count in sync
  };

  const remove = async (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Delete this reply?")) return;
    const res = await deleteComment({ id });
    if (res.ok) {
      load();
      router.refresh();
    } else {
      setError(res.error ?? "Couldn't delete.");
    }
  };

  return (
    <div className="mt-3 border-t border-line pt-3">
      {signedIn ? (
        <div className="mb-3 flex gap-2">
          <label htmlFor={`reply-${postId}`} className="sr-only">
            Write a reply
          </label>
          <input
            id={`reply-${postId}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit();
            }}
            maxLength={MAX}
            placeholder="Write a reply…"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || text.trim().length === 0}
            className="shrink-0 rounded-full bg-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
          >
            Reply
          </button>
        </div>
      ) : (
        <p className="mb-3 text-xs text-ink-muted">
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to reply.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-2 text-xs text-live">
          {error}
        </p>
      )}

      {comments === null ? (
        <p className="text-xs text-ink-muted">Loading replies…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-ink-muted">No replies yet. Be the first.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <Link href={c.author.profileHref} className="shrink-0">
                {c.author.type === "team" ? (
                  <TeamCrest name={c.author.displayName} src={c.author.avatarUrl || undefined} size={32} />
                ) : (
                  <Avatar name={c.author.displayName} src={c.author.avatarUrl || undefined} size={32} />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm leading-tight">
                  <Link href={c.author.profileHref} className="font-semibold text-ink hover:underline">
                    {c.author.displayName}
                  </Link>
                  <span className="text-ink-muted">@{c.author.handle}</span>
                  <span className="text-ink-muted" aria-hidden="true">
                    ·
                  </span>
                  <time className="text-ink-muted" dateTime={c.createdAt}>
                    {timeAgo(c.createdAt)}
                  </time>
                  {c.isOwn ? (
                    <button
                      type="button"
                      onClick={() => void remove(c.id)}
                      aria-label="Delete reply"
                      className="ml-auto text-ink-muted transition-colors hover:text-live"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    signedIn && (
                      <button
                        type="button"
                        onClick={() => setReportingId(c.id)}
                        aria-label="Report reply"
                        className="ml-auto text-ink-muted transition-colors hover:text-live"
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </button>
                    )
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReportDialog
        open={reportingId !== null}
        onClose={() => setReportingId(null)}
        targetType="comment"
        targetId={reportingId ?? ""}
        targetLabel="this reply"
      />
    </div>
  );
}
