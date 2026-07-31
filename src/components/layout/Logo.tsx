import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

const LOGO_SRC = "/assets/brand/strikersfeed-logo.png";
const RATIO = 1148 / 245; // intrinsic aspect ratio of the trimmed wordmark

interface LogoProps {
  height?: number;
  showDomain?: boolean;
  priority?: boolean;
  className?: string;
  href?: string | null;
}

/** StrikersFeed wordmark, linking home by default. */
export function Logo({
  height = 30,
  showDomain = true,
  priority = false,
  className,
  href = "/",
}: LogoProps) {
  const width = Math.round(height * RATIO);
  const inner = (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Image
        src={LOGO_SRC}
        alt="StrikersFeed"
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto"
        style={{ height, width: "auto" }}
      />
      {showDomain && (
        <span className="hidden text-[11px] font-bold uppercase tracking-widest text-accent sm:inline">
          .club
        </span>
      )}
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} aria-label="StrikersFeed home" className="inline-flex items-center">
      {inner}
    </Link>
  );
}
