import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";
import { conversations, relativeTime, resolveAuthor } from "@/data/mock";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your direct messages on StrikersFeed.",
};

export default function MessagesPage() {
  return (
    <PageContainer>
      <PageHeader title="Messages" description="Your direct conversations." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="divide-y divide-line overflow-hidden">
          {conversations.map((c) => {
            const person = resolveAuthor(c.participantId);
            return (
              <div
                key={c.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5",
                  c.unread > 0 && "bg-accent/[0.04]",
                )}
              >
                {person.type === "team" ? (
                  <TeamCrest name={person.displayName} src={person.avatarUrl || undefined} size={44} />
                ) : (
                  <Avatar name={person.displayName} src={person.avatarUrl || undefined} size={44} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">
                      {person.displayName}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-muted">
                      {relativeTime(c.updatedAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "truncate text-sm",
                      c.unread > 0 ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {c.lastMessage}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-black">
                    {c.unread}
                  </span>
                )}
              </div>
            );
          })}
        </Card>

        <Card className="hidden flex-col items-center justify-center px-6 py-16 text-center lg:flex">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-inset ring-line">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <span className="mb-2 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent ring-1 ring-inset ring-accent/30">
            Coming soon
          </span>
          <p className="max-w-sm text-sm text-ink-muted">
            Full real-time messaging arrives with the Supabase integration. This is
            a preview of the inbox with demo conversations.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
