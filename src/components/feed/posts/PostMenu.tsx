"use client";

import { useState } from "react";
import { Link2, MoreHorizontal, VolumeX } from "lucide-react";

/** Lightweight per-post overflow menu. Actions are local-only in Phase 1. */
export function PostMenu({ authorHandle }: { authorHandle: string }) {
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
            <button
              type="button"
              onClick={copyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
            >
              <Link2 className="h-4 w-4" /> Copy link
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-hover"
            >
              <VolumeX className="h-4 w-4" /> Mute @{authorHandle}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
