"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Mail, Menu, Search } from "lucide-react";
import { primaryNav } from "@/config/navigation";
import { conversations, getUser, notifications, CURRENT_USER_ID } from "@/data/mock";
import { useSession } from "@/components/providers/SessionProvider";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const unreadNotifications = notifications.filter((n) => !n.read).length;
const unreadMessages = conversations.reduce((sum, c) => sum + c.unread, 0);

function NavIconLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count} unread)` : label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
    >
      {children}
      {count ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Search"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <Search className="h-5 w-5" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <form
            className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-line bg-background-secondary p-2 shadow-pop"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push("/feed");
            }}
          >
            <label htmlFor="nav-search" className="sr-only">
              Search StrikersFeed
            </label>
            <input
              id="nav-search"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search players, teams, matches…"
              className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <p className="px-1 pt-1.5 text-[11px] text-ink-muted">
              Full search arrives with the next release.
            </p>
          </form>
        </>
      )}
    </div>
  );
}

function AccountMenu() {
  const { isAuthenticated, signOut, mode, displayName } = useSession();
  const [open, setOpen] = useState(false);
  const me = getUser(CURRENT_USER_ID);
  if (!me) return null;
  const shownName = displayName ?? me.displayName;
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-surface-hover"
      >
        <Avatar name={shownName} src={me.avatarUrl || undefined} size={32} />
        <span className="hidden text-sm font-semibold text-ink lg:inline">
          {shownName}
        </span>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-line bg-background-secondary py-1 shadow-pop">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-ink">{shownName}</p>
              <p className="text-xs text-ink-muted">@{me.username}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {[
              { label: "Profile", href: "/profile" },
              { label: "Notifications", href: "/notifications" },
              { label: "Messages", href: "/messages" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-hover"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-line" />
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-surface-hover"
              >
                {mode === "supabase" ? "Sign out" : "Exit demo session"}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-hover"
              >
                Sign in
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logged-in chrome on app routes or when a demo session is active; the
  // landing route stays "logged out" until the visitor enters the demo.
  const showLoggedIn = isAuthenticated || pathname !== "/";

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-shell flex h-14 items-center gap-4 lg:h-16">
        <Logo priority height={28} />

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {showLoggedIn ? (
            <>
              <NavSearch />
              <NavIconLink href="/notifications" label="Notifications" count={unreadNotifications}>
                <Bell className="h-5 w-5" />
              </NavIconLink>
              <NavIconLink href="/messages" label="Messages" count={unreadMessages}>
                <Mail className="h-5 w-5" />
              </NavIconLink>
              <div className="hidden sm:block">
                <AccountMenu />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button href="/login" variant="ghost" size="sm">
                Sign In
              </Button>
              <Button href="/register" size="sm">
                Join Now
              </Button>
            </div>
          )}

          {/* Mobile: compact join CTA when logged out */}
          {!showLoggedIn && (
            <div className="sm:hidden">
              <Button href="/register" size="sm">
                Join
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        showLoggedIn={showLoggedIn}
      />
    </header>
  );
}
