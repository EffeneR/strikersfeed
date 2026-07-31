import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Join Now",
  description: "Create your StrikersFeed account and join the community.",
};

export default function RegisterPage() {
  return (
    <div className="container-shell flex min-h-[calc(100dvh-3.5rem)] items-center justify-center py-12">
      <AuthCard mode="register" />
    </div>
  );
}
