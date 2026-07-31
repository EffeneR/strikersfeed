"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { accountRoleLabel } from "@/config/accountRoles";
import { Pill } from "@/components/ui/badges";

/**
 * Shows the account role chosen at (demo) registration, read from the client
 * demo session. Renders nothing until the session is read and only when a role
 * was actually selected — so it stays consistent between server and client.
 */
export function DemoRolePill() {
  const { demoRole, ready } = useSession();
  if (!ready || !demoRole) return null;
  return <Pill tone="accent">{accountRoleLabel(demoRole)}</Pill>;
}
