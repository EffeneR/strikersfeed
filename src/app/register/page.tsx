import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { STEAM_ENABLED } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";

export const metadata: Metadata = {
  title: "Join Now",
  description: "Create your StrikersFeed account and join the community.",
};

export default function RegisterPage() {
  const steamEnabled = STEAM_ENABLED || isSteamServerConfigured();
  return (
    <div className="container-shell flex min-h-[calc(100dvh-3.5rem)] items-center justify-center py-12">
      <AuthCard mode="register" steamEnabled={steamEnabled} />
    </div>
  );
}
