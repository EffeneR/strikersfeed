"use client";

/**
 * Session provider — dual mode.
 *
 * - **Supabase mode** (a project is configured): reflects the real auth session.
 *   Initial state comes from the server (`getCurrentUser`) and stays in sync via
 *   the browser client's `onAuthStateChange`; `signOut` really signs out.
 * - **Demo mode** (no project configured): the Phase 1 behaviour — a local
 *   "logged-in preview" flag + chosen role in localStorage. NOT real auth.
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
import { useRouter } from "next/navigation";
import { CURRENT_USER_ID } from "@/data/mock";
import type { AccountRole } from "@/config/accountRoles";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/actions";

const STORAGE_KEY = "strikersfeed.demo-session";
const ROLE_KEY = "strikersfeed.demo-role";

const ROLE_VALUES: AccountRole[] = ["player", "team", "influencer", "fan", "other"];
const isAccountRole = (value: string | null): value is AccountRole =>
  value !== null && (ROLE_VALUES as string[]).includes(value);

interface SessionValue {
  /** True when signed in (Supabase) or the demo preview is active. */
  isAuthenticated: boolean;
  /** False until client state has settled (avoids hydration flash in demo mode). */
  ready: boolean;
  /** "supabase" when a project is connected, otherwise "demo". */
  mode: "supabase" | "demo";
  /** The mock account id used for display until data is migrated (Phase 2b). */
  currentUserId: string;
  /** Account role — from the real profile, or the demo choice. */
  role: AccountRole | null;
  /** Display name from the real profile, when available. */
  displayName: string | null;
  /** Handle (@username) from the real profile, when available. */
  username: string | null;
  /** Demo mode only: start the local preview with a chosen role. */
  enterDemo: (role?: AccountRole) => void;
  /** Sign out (Supabase) or clear the demo preview. */
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export interface SessionProviderProps {
  children: ReactNode;
  configured?: boolean;
  initialAuthed?: boolean;
  initialRole?: AccountRole | null;
  initialDisplayName?: string | null;
  initialUsername?: string | null;
}

export function SessionProvider({
  children,
  configured = false,
  initialAuthed = false,
  initialRole = null,
  initialDisplayName = null,
  initialUsername = null,
}: SessionProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setAuthenticated] = useState(configured ? initialAuthed : false);
  const [role, setRole] = useState<AccountRole | null>(configured ? initialRole : null);
  const [displayName, setDisplayName] = useState<string | null>(
    configured ? initialDisplayName : null,
  );
  const [username, setUsername] = useState<string | null>(
    configured ? initialUsername : null,
  );
  const [ready, setReady] = useState(configured);

  // Demo mode: hydrate from localStorage after mount.
  useEffect(() => {
    if (configured) return;
    try {
      setAuthenticated(window.localStorage.getItem(STORAGE_KEY) === "active");
      const storedRole = window.localStorage.getItem(ROLE_KEY);
      if (isAccountRole(storedRole)) setRole(storedRole);
    } catch {
      /* localStorage unavailable — treat as logged out */
    }
    setReady(true);
  }, [configured]);

  // Supabase mode: re-sync when the server re-renders with fresh auth props
  // (after a login/logout server action calls router.refresh()).
  useEffect(() => {
    if (!configured) return;
    setAuthenticated(initialAuthed);
    setRole(initialRole);
    setDisplayName(initialDisplayName);
    setUsername(initialUsername);
  }, [configured, initialAuthed, initialRole, initialDisplayName, initialUsername]);

  // Supabase mode: keep in sync with the real auth session.
  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      router.refresh();
    });
    return () => subscription.unsubscribe();
  }, [configured, router]);

  const enterDemo = useCallback(
    (chosenRole?: AccountRole) => {
      if (configured) return; // real sign-up handles this path
      try {
        window.localStorage.setItem(STORAGE_KEY, "active");
        if (chosenRole) window.localStorage.setItem(ROLE_KEY, chosenRole);
      } catch {
        /* ignore persistence failure */
      }
      setAuthenticated(true);
      if (chosenRole) setRole(chosenRole);
    },
    [configured],
  );

  const signOut = useCallback(() => {
    if (configured) {
      void signOutAction().then(() => {
        setAuthenticated(false);
        router.refresh();
      });
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ROLE_KEY);
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
    setRole(null);
  }, [configured, router]);

  const value = useMemo<SessionValue>(
    () => ({
      isAuthenticated,
      ready,
      mode: configured ? "supabase" : "demo",
      currentUserId: CURRENT_USER_ID,
      role,
      displayName,
      username,
      enterDemo,
      signOut,
    }),
    [isAuthenticated, ready, configured, role, displayName, username, enterDemo, signOut],
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
