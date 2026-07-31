import Link from "next/link";
import type { TrendingTopic as TrendingTopicType } from "@/types";
import { formatCount } from "@/lib/format";

export function TrendingTopic({ topic }: { topic: TrendingTopicType }) {
  return (
    <Link
      href="/feed"
      className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-hover"
    >
      <span className="mt-0.5 text-sm font-bold text-ink-muted tabular-nums">
        {topic.rank}
      </span>
      <span className="min-w-0 flex-1">
        {topic.category && (
          <span className="block text-[11px] text-ink-muted">{topic.category}</span>
        )}
        <span className="block truncate text-sm font-semibold text-ink">
          #{topic.tag}
        </span>
        <span className="block text-xs text-ink-muted">
          {formatCount(topic.postCount)} posts
        </span>
      </span>
    </Link>
  );
}
