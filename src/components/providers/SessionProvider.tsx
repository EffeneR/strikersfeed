"use client";

/**
 * DEMO session provider — Phase 1 only.
 *
 * This is NOT real authentication. It simply remembers, in localStorage,
 * whether the visitor has entered the logged-in preview so the shell can show
 * the authenticated navigation. Real auth will be provided by Supabase in a
 * later phase (see docs/README). Never treat this as a security boundary.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_USER_ID } from "@/data/mock";
import type { AccountRole } from "@/config/accountRoles";

const STORAGE_KEY = "strikersfeed.demo-session";
const ROLE_KEY = "strikersfeed.demo-role";

const ROLE_VALUES: AccountRole[] = ["player", "team", "influencer", "fan", "other"];
const isAccountRole = (value: string | null): value is AccountRole =>
  value !== null && (ROLE_VALUES as string[]).includes(value);

interface SessionValue {
  /** True when the demo/logged-in preview is active. */
  isAuthenticated: boolean;
  /** False until localStorage has been read (avoids hydration flash). */
  ready: boolean;
  /** The mock account id representing "me" in the preview. */
  currentUserId: string;
  /** The account role chosen at (demo) registration, if any. */
  demoRole: AccountRole | null;
  enterDemo: (role?: AccountRole) => void;
  exitDemo: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [demoRole, setDemoRole] = useState<AccountRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAuthenticated(window.localStorage.getItem(STORAGE_KEY) === "active");
      const storedRole = window.localStorage.getItem(ROLE_KEY);
      if (isAccountRole(storedRole)) setDemoRole(storedRole);
    } catch {
      /* localStorage may be unavailable — treat as logged out. */
    }
    setReady(true);
  }, []);

  const enterDemo = useCallback((role?: AccountRole) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "active");
      if (role) window.localStorage.setItem(ROLE_KEY, role);
    } catch {
      /* ignore persistence failure */
    }
    setAuthenticated(true);
    if (role) setDemoRole(role);
  }, []);

  const exitDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ROLE_KEY);
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    setDemoRole(null);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      isAuthenticated,
      ready,
      currentUserId: CURRENT_USER_ID,
      demoRole,
      enterDemo,
      exitDemo,
    }),
    [isAuthenticated, ready, demoRole, enterDemo, exitDemo],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
