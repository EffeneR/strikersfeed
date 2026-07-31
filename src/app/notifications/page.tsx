import type { Metadata } from "next";
import Link from "next/link";
import {
  AtSign,
  Heart,
  MessageCircle,
  Repeat2,
  Swords,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types";
import { notifications, relativeTime, resolveAuthor } from "@/data/mock";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { cn } from "@/lib/cn";

const ICONS: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  like: { icon: Heart, className: "text-live" },
  reply: { icon: MessageCircle, className: "text-ink-muted" },
  repost: { icon: Repeat2, className: "text-emerald-400" },
  follow: { icon: UserPlus, className: "text-accent" },
  mention: { icon: AtSign, className: "text-accent" },
  match: { icon: Swords, className: "text-live" },
  tournament: { icon: Trophy, className: "text-accent" },
};

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your latest activity on StrikersFeed.",
};

export default function NotificationsPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Notifications" description="Recent activity from your community." />
        <Card className="divide-y divide-line overflow-hidden">
          {notifications.map((n) => {
            const actor = resolveAuthor(n.actorId);
            const { icon: Icon, className } = ICONS[n.type];
            const href = n.postId ? "/feed" : actor.profileHref;
            return (
              <Link
                key={n.id}
                href={href}
                className={cn(
                  "flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover",
                  !n.read && "bg-accent/[0.04]",
                )}
              >
                <span className={cn("mt-0.5 shrink-0", className)}>
                  <Icon className="h-5 w-5" />
                </span>
                {actor.type === "team" ? (
                  <TeamCrest name={actor.displayName} src={actor.avatarUrl || undefined} size={36} />
                ) : (
                  <Avatar name={actor.displayName} src={actor.avatarUrl || undefined} size={36} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{actor.displayName}</span>{" "}
                    <span className="text-ink-muted">{n.text}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">{relativeTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />
                )}
              </Link>
            );
          })}
        </Card>
      </div>
    </PageContainer>
  );
}
