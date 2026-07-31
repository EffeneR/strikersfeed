import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to StrikersFeed.",
};

export default function LoginPage() {
  return (
    <div className="container-shell flex min-h-[calc(100dvh-3.5rem)] items-center justify-center py-12">
      <AuthCard mode="login" />
    </div>
  );
}
