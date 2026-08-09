import type { Metadata } from "next";
import { Heart, MessageCircle, UserPlus, type LucideIcon } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import { getNotifications, type NotificationType } from "@/lib/notifications/queries";
import { timeAgo } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { MarkReadOnView } from "@/components/notifications/MarkReadOnView";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your latest activity on StrikersFeed.",
};

const META: Record<NotificationType, { icon: LucideIcon; className: string; verb: string }> = {
  reply: { icon: MessageCircle, className: "text-ink-muted", verb: "replied to your post" },
  reaction: { icon: Heart, className: "text-live", verb: "liked your post" },
  follow: { icon: UserPlus, className: "text-accent", verb: "started following you" },
};

export default async function NotificationsPage() {
  const user = isSupabaseConfigured() ? await getCurrentUser() : null;

  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title="Sign in to see your notifications"
          description="Replies, likes and new followers show up here once you're signed in."
          primary={{ label: "Sign in", href: "/login" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  const items = await getNotifications();

  return (
    <PageContainer>
      <MarkReadOnView />
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Notifications" description="Recent activity from your community." />
        {items.length === 0 ? (
          <Card className="p-8 text-center text-sm text-ink-muted">
            No notifications yet. Post something and follow a few people to get started.
          </Card>
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {items.map((n) => {
              const meta = META[n.type];
              const Icon = meta.icon;
              const actorName = n.actor?.displayName ?? "Someone";
              const href = n.actor ? `/players/${n.actor.handle}` : "/feed";
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3.5",
                    !n.read && "bg-accent/[0.04]",
                  )}
                >
                  <span className={cn("mt-0.5 shrink-0", meta.className)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <a href={href} className="shrink-0">
                    <Avatar name={actorName} src={n.actor?.avatarUrl || undefined} size={36} />
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{actorName}</span>{" "}
                      <span className="text-ink-muted">{meta.verb}</span>
                    </p>
                    {n.type === "reply" && n.snippet && (
                      <p className="mt-0.5 truncate text-sm text-ink-muted">“{n.snippet}”</p>
                    )}
                    <p className="mt-0.5 text-xs text-ink-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
