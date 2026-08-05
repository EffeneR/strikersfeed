"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  MAX_REPORT_DETAILS,
  REPORT_REASONS,
  type ReportReason,
  type ReportTargetType,
} from "@/config/moderation";
import { reportContent } from "@/lib/moderation/actions";

/**
 * Accessible modal for reporting a post / comment / profile / clip. Reusable —
 * the caller owns the open state and supplies the target. Submits to the
 * `reportContent` server action; reporting the same thing twice is a no-op.
 */
export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  targetLabel,
}: {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetLabel?: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Reset each time the dialog is opened, and support Escape-to-close.
  useEffect(() => {
    if (!open) return;
    setReason(null);
    setDetails("");
    setError(null);
    setDone(false);
    setBusy(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!reason || busy) return;
    setBusy(true);
    setError(null);
    const res = await reportContent({ targetType, targetId, reason, details });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Couldn't send the report. Try again.");
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-line bg-background-secondary p-5 shadow-pop sm:rounded-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="report-dialog-title" className="text-lg font-bold text-ink">
              {done ? "Report received" : "Report content"}
            </h2>
            {!done && (
              <p className="mt-0.5 text-xs text-ink-muted">
                {targetLabel
                  ? `Tell us what's wrong with ${targetLabel}.`
                  : "Reports are anonymous to other members and reviewed by our team."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Thanks — our moderators will take a look. Content that gets multiple
              reports is hidden automatically while it&apos;s reviewed. You can also
              block this account to stop seeing it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <fieldset className="space-y-1.5">
              <legend className="sr-only">Reason</legend>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    reason === r.value
                      ? "border-accent bg-accent/10"
                      : "border-line hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="mt-0.5 h-4 w-4 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{r.label}</span>
                    <span className="block text-xs text-ink-muted">{r.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-3">
              <label htmlFor="report-details" className="sr-only">
                Additional details
              </label>
              <textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={MAX_REPORT_DETAILS}
                rows={2}
                placeholder="Add any details (optional)"
                className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent"
              />
            </div>

            {error && (
              <p role="alert" className="mt-2 text-xs text-live">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!reason || busy}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-40"
              >
                {busy ? "Sending…" : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
