"use client";

import Link from "next/link";
import { feedSidebarNav } from "@/config/navigation";
import { feedCategories, getWhoToFollow } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { SuggestedAccount } from "@/components/social/SuggestedAccount";
import type { FeedTab, FeedView } from "./feedState";

const whoToFollow = getWhoToFollow(3);
const footerLinks = [
  { label: "Guidelines", href: "/community-guidelines" },
  { label: "Get the app", href: "/app" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function FeedSidebar({
  tab,
  view,
  onSelectTab,
  onSelectView,
}: {
  tab: FeedTab;
  view: FeedView;
  onSelectTab: (tab: FeedTab) => void;
  onSelectView: (view: FeedView) => void;
}) {
  const isActive = (item: (typeof feedSidebarNav)[number]): boolean => {
    switch (item.filter) {
      case "for-you":
        return tab === "for-you" && view === "all";
      case "following":
        return tab === "following" && view === "all";
      case "clips":
        return view === "clips";
      case "bookmarks":
        return view === "bookmarks";
      case "saved":
        return view === "saved";
      default:
        return false;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Feed" className="space-y-0.5">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Feed
        </p>
        {feedSidebarNav.map((item) => {
          const Icon = item.icon;
          const filter = item.filter;
          const active = isActive(item);
          const className = cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            active
              ? "bg-surface text-ink ring-1 ring-inset ring-line"
              : "text-ink-muted hover:bg-surface-hover hover:text-ink",
          );

          if (!filter) {
            return (
              <Link key={item.label} href={item.href} className={className}>
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (filter === "for-you") {
                  onSelectTab("for-you");
                  onSelectView("all");
                } else if (filter === "following") {
                  onSelectTab("following");
                  onSelectView("all");
                } else {
                  onSelectView(filter);
                }
              }}
              className={className}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Suggested categories
          </p>
        </div>
        <ul>
          {feedCategories.map((cat) => (
            <li key={cat.id}>
              <Link
                href="/feed"
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-hover"
              >
                <span className="truncate text-sm text-ink">{cat.label}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {formatCount(cat.postCount)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Who to follow
        </p>
        {whoToFollow.map((author) => (
          <SuggestedAccount key={author.id} author={author} />
        ))}
      </div>

      <div className="mt-auto px-3 pt-6">
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-muted">
          {footerLinks.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:text-ink">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
          {siteConfig.disclaimer}
        </p>
      </div>
    </div>
  );
}
