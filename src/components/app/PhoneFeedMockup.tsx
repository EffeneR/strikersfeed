import { Logo } from "@/components/layout/Logo";
import { PitchArt } from "@/components/ui/PitchArt";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { cn } from "@/lib/cn";

function MiniPost({
  initials,
  name,
  handle,
  text,
  media,
  seed,
}: {
  initials: string;
  name: string;
  handle: string;
  text: string;
  media?: boolean;
  seed?: string;
}) {
  return (
    <div className="border-b border-line px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-[9px] font-bold text-accent">
          {initials}
        </span>
        <span className="text-[11px] font-semibold text-ink">{name}</span>
        <span className="text-[10px] text-ink-muted">@{handle}</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-ink">{text}</p>
      {media && (
        <div className="mt-2 aspect-video overflow-hidden rounded-md border border-line">
          <PitchArt seed={seed} />
        </div>
      )}
      <div className="mt-2 flex items-center gap-4 text-ink-muted">
        <MessageCircle className="h-3 w-3" />
        <Repeat2 className="h-3 w-3" />
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3 fill-live text-live" />
          <span className="text-[9px]">128</span>
        </span>
      </div>
    </div>
  );
}

/** Decorative phone frame previewing the mobile feed, in brand colours. */
export function PhoneFeedMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[240px] rounded-[2.2rem] border-[6px] border-[#1b1f1b] bg-background shadow-pop",
        className,
      )}
      aria-hidden="true"
    >
      {/* notch */}
      <div className="absolute left-1/2 top-0 z-10 h-4 w-24 -translate-x-1/2 rounded-b-xl bg-[#1b1f1b]" />
      <div className="h-[460px] overflow-hidden rounded-[1.7rem]">
        <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
          <Logo height={16} showDomain={false} href={null} />
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
        <MiniPost
          initials="AR"
          name="ArmanPlayz"
          handle="armanplayz"
          text="Ranked grind doesn't stop. Big W in the Elite Division 💪"
          media
          seed="mock-a"
        />
        <MiniPost
          initials="LX"
          name="Lexi10"
          handle="lexi10"
          text="Top bins from outside the box 🎯"
          media
          seed="mock-b"
        />
        <MiniPost
          initials="SF"
          name="StrikersFeed"
          handle="strikersfeed"
          text="Match Review: Strikers United vs Vortex FC is live."
        />
      </div>
    </div>
  );
}
