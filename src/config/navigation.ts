import {
  BarChart3,
  Bookmark,
  Clapperboard,
  Home,
  MessagesSquare,
  Rss,
  Save,
  Shield,
  Swords,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary top-navigation destinations (desktop). */
export const primaryNav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Matches", href: "/matches", icon: Swords },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Players", href: "/players", icon: UserRound },
  { label: "Rankings", href: "/rankings", icon: BarChart3 },
];

/** Compact mobile bottom-navigation (5 practical destinations). */
export const mobileBottomNav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Feed", href: "/feed", icon: Rss },
  { label: "Matches", href: "/matches", icon: Swords },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Profile", href: "/profile", icon: UserRound },
];

/** Left-rail navigation inside the logged-in Feed experience. */
export interface FeedNavItem extends NavItem {
  /** Feed filter key handled in-page, when the item is not a route. */
  filter?: "for-you" | "following" | "clips" | "bookmarks" | "saved";
}

export const feedSidebarNav: FeedNavItem[] = [
  { label: "For You", href: "/feed", icon: Home, filter: "for-you" },
  { label: "Following", href: "/feed?tab=following", icon: Users, filter: "following" },
  { label: "Match Threads", href: "/matches", icon: MessagesSquare },
  { label: "Clips", href: "/feed", icon: Clapperboard, filter: "clips" },
  { label: "Bookmarks", href: "/feed", icon: Bookmark, filter: "bookmarks" },
  { label: "Teams", href: "/teams", icon: Shield },
  { label: "Tournaments", href: "/tournaments", icon: Trophy },
  { label: "Saved", href: "/feed", icon: Save, filter: "saved" },
];

export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const footerSections: FooterSection[] = [
  {
    title: "Platform",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Matches", href: "/matches" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "Rankings", href: "/rankings" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Teams", href: "/teams" },
      { label: "Players", href: "/players" },
      { label: "Join Now", href: "/register" },
      { label: "Sign In", href: "/login" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Profile", href: "/profile" },
      { label: "Notifications", href: "/notifications" },
      { label: "Messages", href: "/messages" },
    ],
  },
];
