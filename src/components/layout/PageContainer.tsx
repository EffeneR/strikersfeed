import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Footer } from "./Footer";

/**
 * Standard wrapper for non-feed content pages: constrained width, vertical
 * rhythm, and the shared footer (with the independence disclaimer).
 */
export function PageContainer({
  children,
  className,
  withFooter = true,
}: {
  children: ReactNode;
  className?: string;
  withFooter?: boolean;
}) {
  return (
    <>
      <div className={cn("container-shell py-6 lg:py-10", className)}>{children}</div>
      {withFooter && <Footer />}
    </>
  );
}

/** Page heading block used by list/section pages. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-condensed text-3xl font-bold tracking-wide text-ink lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
