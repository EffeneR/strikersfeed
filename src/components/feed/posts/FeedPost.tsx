"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SocialPost } from "@/types";
import { resolveAuthor } from "@/data/mock";
import { useSession } from "@/components/providers/SessionProvider";
import { deleteTextPost, updateTextPost } from "@/lib/posts/actions";
import { RichText } from "@/components/ui/RichText";
import { PostAuthor } from "./PostAuthor";
import { PostActions } from "./PostActions";
import { PostMenu } from "./PostMenu";
import { Poll } from "./Poll";
import { MediaPost } from "./MediaPost";
import { MatchPost } from "./MatchPost";
import { MatchReviewPost } from "./MatchReviewPost";
import { TournamentPost } from "./TournamentPost";
import { RecruitmentPost } from "./RecruitmentPost";
import { MedalClipPost } from "./MedalClipPost";

function PostBody({ post }: { post: SocialPost }) {
  switch (post.type) {
    case "text":
      return post.poll ? <Poll options={post.poll} /> : null;
    case "media":
      return <MediaPost post={post} />;
    case "match":
      return <MatchPost post={post} />;
    case "matchReview":
      return <MatchReviewPost post={post} />;
    case "tournament":
      return <TournamentPost post={post} />;
    case "recruitment":
      return <RecruitmentPost post={post} />;
    case "medalClip":
      return <MedalClipPost post={post} />;
    default:
      return null;
  }
}

const MAX = 500;

/** Renders any {@link SocialPost}. Owners get inline edit + delete controls. */
export function FeedPost({ post }: { post: SocialPost }) {
  const router = useRouter();
  const { userId, mode } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const author = post.author ?? resolveAuthor(post.authorId);
  const isOwn = mode === "supabase" && !!userId && post.authorId === userId;
  // Only native text posts are editable for now.
  const canEdit = isOwn && post.type === "text";

  const save = async () => {
    setBusy(true);
    setError(null);
    const res = await updateTextPost({ id: post.id, body: draft });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't save.");
      return;
    }
    setEditing(false);
    router.refresh();
  };

  const remove = async () => {
    if (typeof window !== "undefined" && !window.confirm("Delete this post?")) return;
    setBusy(true);
    const res = await deleteTextPost({ id: post.id });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError(res.error ?? "Couldn't delete.");
  };

  return (
    <article className="px-4 py-4 transition-colors hover:bg-surface/40">
      <PostAuthor
        author={author}
        createdAt={post.createdAt}
        pinned={post.pinned}
        menu={
          <PostMenu
            authorHandle={author.handle}
            onEdit={canEdit ? () => setEditing(true) : undefined}
            onDelete={isOwn ? remove : undefined}
          />
        }
      />
      <div className="sm:pl-14">
        {editing ? (
          <div className="mt-1">
            <label htmlFor={`edit-${post.id}`} className="sr-only">
              Edit post
            </label>
            <textarea
              id={`edit-${post.id}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={MAX}
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-accent"
            />
            {error && (
              <p role="alert" className="mt-1 text-xs text-live">
                {error}
              </p>
            )}
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(post.content);
                  setError(null);
                }}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy || draft.trim().length === 0}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.content && (
              <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                <RichText text={post.content} />
              </p>
            )}
            <PostBody post={post} />
            {error && (
              <p role="alert" className="mt-2 text-xs text-live">
                {error}
              </p>
            )}
            <PostActions stats={post.stats} />
          </>
        )}
      </div>
    </article>
  );
}
