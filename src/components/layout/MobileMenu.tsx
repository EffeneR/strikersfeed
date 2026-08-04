"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { primaryNav } from "@/config/navigation";
import { CURRENT_USER_ID, getUser } from "@/data/mock";
import { useSession } from "@/components/providers/SessionProvider";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

const secondaryLinks = [
  { label: "Profile", href: "/profile" },
  { label: "Connections", href: "/settings/connections" },
  { label: "Notifications", href: "/notifications" },
  { label: "Messages", href: "/messages" },
  { label: "Rankings", href: "/rankings" },
];

export function MobileMenu({
  open,
  onClose,
  showLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  showLoggedIn: boolean;
}) {
  const pathname = usePathname();
  const { isAuthenticated, signOut, mode } = useSession();
  const me = getUser(CURRENT_USER_ID);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col border-l border-line bg-background-secondary shadow-pop transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Logo height={26} showDomain={false} href={null} />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto scrollbar-slim px-2 py-3">
          <ul className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                      active
                        ? "bg-surface text-ink ring-1 ring-inset ring-line"
                        : "text-ink-muted hover:bg-surface-hover hover:text-ink",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-3 h-px bg-line" />

          <ul className="space-y-1">
            {secondaryLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          {showLoggedIn && me ? (
            <div className="flex items-center justify-between gap-3">
              <Link href="/profile" onClick={onClose} className="flex items-center gap-3">
                <Avatar name={me.displayName} src={me.avatarUrl || undefined} size={40} />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-ink">
                    {me.displayName}
                  </span>
                  <span className="block text-xs text-ink-muted">@{me.username}</span>
                </span>
              </Link>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="text-xs font-medium text-ink-muted hover:text-ink"
                >
                  {mode === "supabase" ? "Sign out" : "Exit demo"}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button href="/login" variant="outline" size="md" className="w-full">
                Sign In
              </Button>
              <Button href="/register" size="md" className="w-full">
                Join Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
