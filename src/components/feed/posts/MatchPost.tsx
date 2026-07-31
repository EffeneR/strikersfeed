import type { MatchPost as MatchPostType } from "@/types";
import { getMatch } from "@/data/mock";
import { MatchResultCard } from "./MatchResultCard";

export function MatchPost({ post }: { post: MatchPostType }) {
  const match = getMatch(post.matchId);
  if (!match) return null;
  return <MatchResultCard match={match} />;
}
