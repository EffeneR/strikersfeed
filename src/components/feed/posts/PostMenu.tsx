"use client";

import { useState } from "react";
import { Ban, Flag, Link2, MoreHorizontal, Pencil, Trash2, VolumeX } from "lucide-react";

/**
 * Per-post overflow menu. Copy-link is always available; Edit + Delete appear
 * for the post's owner, while Report + Block appear for other people's posts
 * (only for real, persisted content — handlers are wired by the caller).
 */
export function PostMenu({
  authorHandle,
  onEdit,
  onDelete,
  onReport,
  onBlock,
}: {
  authorHandle: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}/feed` : "/feed";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked — ignore */
    }
    setOpen(false);
  };

  const runAction = (fn?: () => void) => {
    setOpen(false);
    fn?.();
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Post options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {copied && (
        <span className="absolute right-0 top-9 z-50 whitespace-nowrap rounded-md bg-surface px-2 py-1 text-[11px] text-ink shadow-pop">
          Link copied
        </span>
      )}
      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-9 z-50 w-48 overflow-hidden rounded-xl border border-line bg-background-secondary py-1 shadow-pop">
            {onEdit && (
              <button
                type="button"
                onClick={() => runAction(onEdit)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                <Pencil className="h-4 w-4" /> Edit post
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => runAction(onDelete)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-live transition-colors hover:bg-surface-hover"
              >
                <Trash2 className="h-4 w-4" /> Delete post
              </button>
            )}
            {(onEdit || onDelete) && <div className="my-1 h-px bg-line" />}
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
            >
              <Link2 className="h-4 w-4" /> Copy link
            </button>
            {(onReport || onBlock) && <div className="my-1 h-px bg-line" />}
            {onReport && (
              <button
                type="button"
                onClick={() => runAction(onReport)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                <Flag className="h-4 w-4" /> Report post
              </button>
            )}
            {onBlock && (
              <button
                type="button"
                onClick={() => runAction(onBlock)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-live transition-colors hover:bg-surface-hover"
              >
                <Ban className="h-4 w-4" /> Block @{authorHandle}
              </button>
            )}
            {!onEdit && !onDelete && !onReport && !onBlock && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-hover"
              >
                <VolumeX className="h-4 w-4" /> Mute @{authorHandle}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
