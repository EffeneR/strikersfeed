"use client";

import { Bookmark, X } from "lucide-react";
import type { SocialPost } from "@/types";
import { cn } from "@/lib/cn";
import { FeedPost } from "./posts/FeedPost";
import { PostComposer } from "./PostComposer";
import { VIEW_LABELS, type FeedTab, type FeedView } from "./feedState";

export function FeedCenter({
  tab,
  view,
  posts,
  onTabChange,
  onClearView,
  onAddPost,
}: {
  tab: FeedTab;
  view: FeedView;
  posts: SocialPost[];
  onTabChange: (tab: FeedTab) => void;
  onClearView: () => void;
  onAddPost: (text: string) => void;
}) {
  const filtered = view !== "all";

  return (
    <div className="rounded-xl border border-line bg-background-secondary">
      <PostComposer onSubmit={onAddPost} />

      {!filtered ? (
        <div role="tablist" aria-label="Feed tabs" className="flex border-b border-line">
          {(
            [
              { key: "for-you", label: "For You" },
              { key: "following", label: "Following" },
            ] as const
          ).map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  "relative flex-1 py-3.5 text-sm font-semibold transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:bg-surface-hover hover:text-ink",
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-14 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-sm font-semibold text-ink">
            {VIEW_LABELS[view]}
          </span>
          <button
            type="button"
            onClick={onClearView}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="divide-y divide-line">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState view={view} />
      )}
    </div>
  );
}

function EmptyState({ view }: { view: FeedView }) {
  const copy =
    view === "bookmarks" || view === "saved"
      ? {
          title: `No ${VIEW_LABELS[view].toLowerCase()} yet`,
          body: "Posts you bookmark in this session will appear here. Nothing is saved to a server in Phase 1.",
        }
      : {
          title: "Nothing here yet",
          body: "Check back soon — new posts land in the feed all the time.",
        };
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-ink-muted ring-1 ring-inset ring-line">
        <Bookmark className="h-5 w-5" />
      </div>
      <p className="text-base font-semibold text-ink">{copy.title}</p>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{copy.body}</p>
    </div>
  );
}
