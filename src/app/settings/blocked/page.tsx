import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { getBlockedProfiles } from "@/lib/moderation/queries";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { BlockedList } from "@/components/settings/BlockedList";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Blocked accounts",
  description: "Accounts you've blocked on StrikersFeed.",
};

export default async function BlockedPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to manage blocked accounts"
          description="Blocking hides an account's posts and replies from you."
          primary={{ label: "Sign in", href: "/login" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  const blocked = await getBlockedProfiles();

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Blocked accounts"
          description="These accounts are hidden from your feed and threads. Unblock any time."
        />
        <BlockedList initial={blocked} />
      </div>
    </PageContainer>
  );
}
