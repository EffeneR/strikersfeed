import type { SocialPost } from "@/types";
import { resolveAuthor } from "@/data/mock";
import { RichText } from "@/components/ui/RichText";
import { PostAuthor } from "./PostAuthor";
import { PostActions } from "./PostActions";
import { PostMenu } from "./PostMenu";
import { Poll } from "./Poll";
import { MediaPost } from "./MediaPost";
import { MatchPost } from "./MatchPost";
import { MatchReviewPost } from "./MatchReviewPost";
import { TournamentPost } from "./TournamentPost";
import { RecruitmentPost } from "./RecruitmentPost";

function PostBody({ post }: { post: SocialPost }) {
  switch (post.type) {
    case "text":
      return post.poll ? <Poll options={post.poll} /> : null;
    case "media":
      return <MediaPost post={post} />;
    case "match":
      return <MatchPost post={post} />;
    case "matchReview":
      return <MatchReviewPost post={post} />;
    case "tournament":
      return <TournamentPost post={post} />;
    case "recruitment":
      return <RecruitmentPost post={post} />;
    default:
      return null;
  }
}

/** Renders any {@link SocialPost} — the single entry point used by the feed. */
export function FeedPost({ post }: { post: SocialPost }) {
  const author = resolveAuthor(post.authorId);
  return (
    <article className="px-4 py-4 transition-colors hover:bg-surface/40">
      <PostAuthor
        author={author}
        createdAt={post.createdAt}
        pinned={post.pinned}
        menu={<PostMenu authorHandle={author.handle} />}
      />
      <div className="sm:pl-14">
        {post.content && (
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            <RichText text={post.content} />
          </p>
        )}
        <PostBody post={post} />
        <PostActions stats={post.stats} />
      </div>
    </article>
  );
}
