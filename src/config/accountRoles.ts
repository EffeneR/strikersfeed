import { Heart, Megaphone, Shield, Sparkles, UserRound, type LucideIcon } from "lucide-react";

/**
 * Account role chosen at registration. This captures signup *intent* — how a
 * member wants to use StrikersFeed. It is distinct from the data-model
 * `AccountType` in `@/types`, and in Phase 2 it maps onto the Supabase profile
 * created for the new account.
 */
export type AccountRole = "player" | "team" | "influencer" | "fan" | "other";

export interface AccountRoleOption {
  role: AccountRole;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const accountRoles: AccountRoleOption[] = [
  {
    role: "player",
    label: "Player",
    description: "Compete in ranked & tournaments",
    icon: UserRound,
  },
  {
    role: "team",
    label: "Team",
    description: "Manage a roster & recruit players",
    icon: Shield,
  },
  {
    role: "influencer",
    label: "Influencer",
    description: "Grow an audience & share content",
    icon: Megaphone,
  },
  {
    role: "fan",
    label: "Fan",
    description: "Follow players, teams & matches",
    icon: Heart,
  },
  {
    role: "other",
    label: "Other",
    description: "Coach, organiser or something else",
    icon: Sparkles,
  },
];

/** Human label for a role value, for surfacing the choice elsewhere. */
export function accountRoleLabel(role: AccountRole): string {
  return accountRoles.find((r) => r.role === role)?.label ?? "Member";
}
