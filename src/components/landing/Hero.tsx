import Image from "next/image";
import { MessagesSquare, PlayCircle, Trophy, UserRound } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

const benefits = [
  { icon: UserRound, label: "Player & team profiles" },
  { icon: MessagesSquare, label: "Match discussions" },
  { icon: Trophy, label: "Community tournaments" },
  { icon: PlayCircle, label: "Clips & highlights" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0">
        <Image
          src="/assets/illustrations/landing-hero.png"
          alt="Strikers Club players walking out onto the pitch at a floodlit stadium at night"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_center]"
        />
        {/* Scrims for text legibility (CSS only — nothing baked into the image). */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container-shell relative">
        <div className="max-w-xl py-20 lg:py-28">
          <p className="mb-4 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent ring-1 ring-inset ring-accent/30">
            {siteConfig.positioning}
          </p>
          <h1 className="font-condensed text-4xl font-extrabold leading-[1.05] tracking-wide text-ink sm:text-5xl lg:text-6xl">
            The social home of <span className="text-accent">Strikers Club</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-ink-muted sm:text-lg">
            Follow players and teams, share clips, discuss matches and compete in
            community tournaments—all in one place.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/register" size="lg">
              Join the Feed
            </Button>
            <Button href="/matches" variant="outline" size="lg">
              Explore Matches
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <li
                  key={b.label}
                  className="inline-flex items-center gap-2 text-sm text-ink-muted"
                >
                  <Icon className="h-4 w-4 text-accent" />
                  {b.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
