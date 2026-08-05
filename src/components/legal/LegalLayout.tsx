import type { ReactNode } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

/**
 * Shared shell for the policy pages (guidelines / terms / privacy). Constrained
 * reading column, consistent heading + "last updated" line, and a note that
 * these are baseline templates the operator should have reviewed by counsel
 * before launch.
 */
export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PageContainer>
      <article className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Legal</p>
        <h1 className="mt-2 font-condensed text-3xl font-bold tracking-wide text-ink lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-ink-muted">Last updated: {updated}</p>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{intro}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-ink">{children}</div>

        <div className="mt-12 rounded-xl border border-line bg-surface p-4 text-xs text-ink-muted">
          This document is a good-faith baseline for a community platform, not
          legal advice. Have it reviewed by a qualified professional and localise
          it for your jurisdiction before relying on it in production.
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/community-guidelines" className="text-ink-muted hover:text-accent">
            Community Guidelines
          </Link>
          <Link href="/terms" className="text-ink-muted hover:text-accent">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-ink-muted hover:text-accent">
            Privacy Policy
          </Link>
        </nav>
      </article>
    </PageContainer>
  );
}

/** A titled section within a policy page. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-condensed text-xl font-bold tracking-wide text-ink">{heading}</h2>
      <div className="mt-2 space-y-3 text-ink-muted">{children}</div>
    </section>
  );
}
