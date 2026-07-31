import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-accent ring-1 ring-inset ring-line">
          <Compass className="h-8 w-8" />
        </div>
        <p className="font-condensed text-6xl font-extrabold tracking-wide text-ink">404</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">This page is offside</h1>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          We couldn&apos;t find the page you were looking for. It may have moved,
          or the link might be broken.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" size="md">
            Back to home
          </Button>
          <Button href="/feed" variant="outline" size="md">
            Go to the Feed
          </Button>
        </div>
        <div className="mt-12 opacity-60">
          <Logo height={26} href={null} />
        </div>
      </div>
      <Footer />
    </>
  );
}
