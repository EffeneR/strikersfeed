import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { DeleteAccountPanel } from "@/components/settings/DeleteAccountPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage or delete your StrikersFeed account.",
};

export default async function AccountPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to manage your account"
          description="Account controls, including deletion, require a signed-in account."
          primary={{ label: "Sign in", href: "/login" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <PageHeader title="Account" description="Your account details and permanent controls." />

        <div className="mb-6 rounded-xl border border-line bg-surface p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Email</dt>
              <dd className="truncate text-ink">{user.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Handle</dt>
              <dd className="text-ink">@{user.username ?? "member"}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-muted">
            Want to change your handle, name or avatar?{" "}
            <Link href="/settings/profile" className="text-accent hover:underline">
              Edit your profile
            </Link>
            .
          </p>
        </div>

        <DeleteAccountPanel />
      </div>
    </PageContainer>
  );
}
