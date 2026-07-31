import { getForYouPosts } from "@/data/mock";
import { Card, SectionHeader } from "@/components/ui/Card";
import { FeedPost } from "@/components/feed/posts/FeedPost";

const preview = getForYouPosts().slice(0, 3);

export function FeedPreview() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 pb-0">
        <SectionHeader title="From the Feed" viewAllHref="/feed" />
      </div>
      <div className="mt-2 divide-y divide-line">
        {preview.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
    </Card>
  );
}
