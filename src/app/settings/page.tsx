import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Ban, Link2, UserRound, Trash2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your StrikersFeed profile, connections, blocked accounts and account.",
};

const ITEMS = [
  {
    href: "/settings/profile",
    label: "Edit profile",
    description: "Display name, handle, bio and avatar.",
    icon: UserRound,
    danger: false,
  },
  {
    href: "/settings/connections",
    label: "Connections",
    description: "Verify your Steam account to prevent impersonation.",
    icon: Link2,
    danger: false,
  },
  {
    href: "/settings/blocked",
    label: "Blocked accounts",
    description: "Accounts you've hidden from your feed and threads.",
    icon: Ban,
    danger: false,
  },
  {
    href: "/settings/account",
    label: "Account",
    description: "Delete your account and all of your content.",
    icon: Trash2,
    danger: true,
  },
];

export default async function SettingsPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to manage settings"
          description="Your profile, connections and account controls live here once you're signed in."
          primary={{ label: "Sign in", href: "/login" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <PageHeader title="Settings" description="Manage your account and safety controls." />
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {ITEMS.map(({ href, label, description, icon: Icon, danger }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    danger ? "bg-live/10 text-live" : "bg-surface text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${danger ? "text-live" : "text-ink"}`}>
                    {label}
                  </span>
                  <span className="block truncate text-xs text-ink-muted">{description}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageContainer>
  );
}
