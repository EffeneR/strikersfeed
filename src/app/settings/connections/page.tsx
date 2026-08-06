import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SteamConnection } from "@/components/settings/SteamConnection";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Connections",
  description: "Verify your Steam account on StrikersFeed.",
};

export default async function ConnectionsPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to manage connections"
          description="Verifying your Steam account requires a signed-in account."
          primary={{ label: "Sign in", href: "/login" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Connections"
          description="Link and verify external accounts. Verification prevents impersonation and is the basis for competitive play."
        />
        <SteamConnection
          verified={user.verificationStatus !== "none"}
          persona={user.steamPersona}
          steamId={user.steamId}
        />
      </div>
    </PageContainer>
  );
}
