"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { siteConfig } from "@/config/site";
import { accountRoles, type AccountRole } from "@/config/accountRoles";
import { cn } from "@/lib/cn";

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

/** Register fields adapt only the first (name) field to the chosen role. */
function registerFields(role: AccountRole | null): Field[] {
  const isTeam = role === "team";
  return [
    {
      id: "displayName",
      label: isTeam ? "Team name" : "Display name",
      type: "text",
      autoComplete: isTeam ? "organization" : "nickname",
      placeholder: isTeam ? "Your team's name" : "Your gamer tag",
    },
    { id: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "Choose a password" },
  ];
}

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { enterDemo } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<AccountRole | null>(null);
  const roleRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isRegister = mode === "register";
  const fields = isRegister ? registerFields(role) : LOGIN_FIELDS;
  const canSubmit = !submitting && (!isRegister || role !== null);

  const selectRole = (index: number) => {
    const clamped = (index + accountRoles.length) % accountRoles.length;
    const target = accountRoles[clamped];
    if (!target) return;
    setRole(target.role);
    roleRefs.current[clamped]?.focus();
  };

  const onRoleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        selectRole(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        selectRole(index - 1);
        break;
      case "Home":
        e.preventDefault();
        selectRole(0);
        break;
      case "End":
        e.preventDefault();
        selectRole(accountRoles.length - 1);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        selectRole(index);
        break;
      default:
        break;
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && role === null) return;
    setSubmitting(true);
    // DEMO ONLY: no credentials are sent or stored. Start a local demo session,
    // recording the chosen role so the app can reflect it.
    enterDemo(role ?? undefined);
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
          {isRegister && (
            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-ink">
                I&apos;m joining as
              </legend>
              <div
                role="radiogroup"
                aria-label="Account type"
                aria-required="true"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {accountRoles.map((opt, index) => {
                  const Icon = opt.icon;
                  const selected = role === opt.role;
                  return (
                    <button
                      key={opt.role}
                      ref={(el) => {
                        roleRefs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-label={opt.label}
                      aria-checked={selected}
                      tabIndex={selected || (role === null && index === 0) ? 0 : -1}
                      onClick={() => setRole(opt.role)}
                      onKeyDown={(e) => onRoleKeyDown(e, index)}
                      className={cn(
                        "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                        selected
                          ? "border-accent bg-accent/10 ring-1 ring-accent"
                          : "border-line bg-surface hover:bg-surface-hover",
                      )}
                    >
                      <Icon
                        className={cn("h-5 w-5", selected ? "text-accent" : "text-ink-muted")}
                      />
                      <span className="text-sm font-semibold text-ink">{opt.label}</span>
                      <span className="text-[11px] leading-tight text-ink-muted">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

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
            disabled={!canSubmit}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {isRegister ? "Create account & explore" : "Sign in & explore"}
          </button>
          {isRegister && role === null && (
            <p className="text-center text-xs text-ink-muted">
              Choose an account type to continue.
            </p>
          )}
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
