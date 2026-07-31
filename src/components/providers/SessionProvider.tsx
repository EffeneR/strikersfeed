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

const STORAGE_KEY = "strikersfeed.demo-session";

interface SessionValue {
  /** True when the demo/logged-in preview is active. */
  isAuthenticated: boolean;
  /** False until localStorage has been read (avoids hydration flash). */
  ready: boolean;
  /** The mock account id representing "me" in the preview. */
  currentUserId: string;
  enterDemo: () => void;
  exitDemo: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAuthenticated(window.localStorage.getItem(STORAGE_KEY) === "active");
    } catch {
      /* localStorage may be unavailable — treat as logged out. */
    }
    setReady(true);
  }, []);

  const enterDemo = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "active");
    } catch {
      /* ignore persistence failure */
    }
    setAuthenticated(true);
  }, []);

  const exitDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      isAuthenticated,
      ready,
      currentUserId: CURRENT_USER_ID,
      enterDemo,
      exitDemo,
    }),
    [isAuthenticated, ready, enterDemo, exitDemo],
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
