"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { siteConfig } from "@/config/site";

interface Field {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
}

const LOGIN_FIELDS: Field[] = [
  { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { id: "password", label: "Password", type: "password", autoComplete: "current-password", placeholder: "••••••••" },
];

const REGISTER_FIELDS: Field[] = [
  { id: "displayName", label: "Display name", type: "text", autoComplete: "nickname", placeholder: "Your gamer tag" },
  { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { id: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "Choose a password" },
];

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { enterDemo } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";
  const fields = isRegister ? REGISTER_FIELDS : LOGIN_FIELDS;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // DEMO ONLY: no credentials are sent or stored. Start a local demo session.
    enterDemo();
    router.push("/feed");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <Logo height={30} />
      </div>

      <div className="rounded-2xl border border-line bg-background-secondary p-6 sm:p-8">
        <h1 className="font-condensed text-2xl font-bold tracking-wide text-ink">
          {isRegister ? "Join StrikersFeed" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isRegister
            ? "Create your account to join the community."
            : "Sign in to pick up where you left off."}
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p>
            <span className="font-semibold">Demo preview.</span> This form doesn&apos;t
            create a real account or store credentials — continuing starts a local
            demo session so you can explore the app. Real sign-in arrives with the
            Supabase integration.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          {fields.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-ink">
                {f.label}
              </label>
              <input
                id={f.id}
                name={f.id}
                type={f.type}
                autoComplete={f.autoComplete}
                placeholder={f.placeholder}
                required
                className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {isRegister ? "Create account & explore" : "Sign in & explore"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          {isRegister ? "Already have an account? " : "New to StrikersFeed? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-accent hover:underline"
          >
            {isRegister ? "Sign in" : "Join now"}
          </Link>
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-sm text-center text-[11px] leading-relaxed text-ink-muted">
        {siteConfig.disclaimer}
      </p>
    </div>
  );
}
