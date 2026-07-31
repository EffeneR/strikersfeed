import { Fragment } from "react";
import Link from "next/link";

/**
 * Renders post text with #hashtags and @mentions highlighted as accent links.
 * Hashtags route to the Feed; mentions route to the matching profile.
 */
export function RichText({ text }: { text: string }) {
  // Split while keeping the delimiters (#tag / @handle).
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, i) => {
        const hashtag = part.match(/^#([A-Za-z0-9_]+)$/);
        if (hashtag) {
          return (
            <Link
              key={i}
              href="/feed"
              className="text-accent hover:underline"
            >
              {part}
            </Link>
          );
        }
        const mention = part.match(/^@([A-Za-z0-9_]+)$/);
        if (mention) {
          return (
            <Link
              key={i}
              href={`/players/${mention[1]!.toLowerCase()}`}
              className="text-accent hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
