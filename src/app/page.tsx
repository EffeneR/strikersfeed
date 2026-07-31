import { Hero } from "@/components/landing/Hero";
import { TrendingClips } from "@/components/landing/TrendingClips";
import { FeedPreview } from "@/components/landing/FeedPreview";
import { UpcomingTournaments } from "@/components/landing/UpcomingTournaments";
import { FeaturedTeams } from "@/components/landing/FeaturedTeams";
import { LandingRightRail } from "@/components/landing/LandingRightRail";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="container-shell py-10 lg:py-14">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
          <div className="space-y-6">
            <TrendingClips />
            <FeedPreview />
            <UpcomingTournaments />
            <FeaturedTeams />
          </div>
          <aside className="mt-6 xl:mt-0">
            <LandingRightRail />
          </aside>
        </div>
      </div>

      <FinalCta />
      <Footer />
    </>
  );
}
