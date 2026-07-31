import type { ReactNode } from "react";
import { Hammer } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  /** Optional primary action; defaults to a link back to the Feed. */
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/** Polished in-layout placeholder for routes not yet built out in Phase 1. */
export function ComingSoon({
  title,
  description,
  icon,
  className,
  primary = { label: "Back to the Feed", href: "/feed" },
  secondary,
}: ComingSoonProps) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-background-secondary px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-inset ring-line">
        {icon ?? <Hammer className="h-6 w-6" />}
      </div>
      <span className="mb-2 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent ring-1 ring-inset ring-accent/30">
        Coming soon
      </span>
      <h1 className="max-w-md text-balance text-2xl font-bold text-ink font-condensed tracking-wide">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button href={primary.href} size="md">
          {primary.label}
        </Button>
        {secondary && (
          <Button href={secondary.href} variant="outline" size="md">
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  );
}
