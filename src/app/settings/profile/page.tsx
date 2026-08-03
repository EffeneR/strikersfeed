import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your StrikersFeed profile.",
};

export default async function EditProfilePage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to edit your profile"
          description="Editing your display name, handle, bio and avatar requires a signed-in account."
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
          title="Edit profile"
          description="Update how you appear across StrikersFeed."
        />
        <EditProfileForm
          initial={{
            displayName: user.displayName ?? "",
            username: user.username ?? "",
            bio: user.bio ?? "",
            avatarUrl: user.avatarUrl ?? "",
          }}
        />
      </div>
    </PageContainer>
  );
}
