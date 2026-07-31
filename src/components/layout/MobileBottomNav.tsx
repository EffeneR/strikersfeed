"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileBottomNav } from "@/config/navigation";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Fixed bottom navigation for mobile/tablet (hidden on large screens). */
export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_rgba(182,255,46,0.35)]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
