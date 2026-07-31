import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="border-t border-line bg-background-secondary">
      <div className="container-shell flex flex-col items-center gap-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
        <div>
          <h2 className="font-condensed text-3xl font-bold tracking-wide text-ink lg:text-4xl">
            {siteConfig.campaignLine}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Join the community building around Strikers Club — post moments,
            discuss matches, follow your favourite players and enter tournaments.
          </p>
        </div>
        <Button href="/register" size="lg" className="shrink-0">
          Join {siteConfig.domain}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
