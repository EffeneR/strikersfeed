import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { STEAM_ENABLED } from "@/lib/supabase/config";
import { isSteamServerConfigured } from "@/lib/steam/config";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to StrikersFeed.",
};

export default function LoginPage() {
  // Offer Steam whenever it's actually usable (server key + admin configured), or
  // when explicitly forced on via NEXT_PUBLIC_STEAM_ENABLED.
  const steamEnabled = STEAM_ENABLED || isSteamServerConfigured();
  return (
    <div className="container-shell flex min-h-[calc(100dvh-3.5rem)] items-center justify-center py-12">
      <AuthCard mode="login" steamEnabled={steamEnabled} />
    </div>
  );
}
