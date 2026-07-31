import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Base surface container with a thin border. */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-line bg-background-secondary",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  action?: ReactNode;
}

/** Card/section header with optional icon and "View all" link. */
export function SectionHeader({
  title,
  icon,
  viewAllHref,
  viewAllLabel = "View all",
  className,
  action,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-ink">
        {icon}
        {title}
      </h2>
      {action}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent"
        >
          {viewAllLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
