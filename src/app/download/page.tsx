import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Apple, Smartphone } from "lucide-react";
import {
  androidDestination,
  iosDestination,
  MOBILE_APP_STATUS,
  storeCtas,
} from "@/config/mobileApp";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppDownloadQRCode } from "@/components/app/AppDownloadQRCode";
import { DownloadAutoRedirect } from "@/components/app/DownloadAutoRedirect";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the StrikersFeed mobile app.",
};

export default function DownloadPage() {
  const ios = iosDestination();
  const android = androidDestination();

  // Nothing to send anyone to yet — send them to the marketing page instead.
  if (!ios && !android) redirect("/app");

  const cta = storeCtas();

  return (
    <PageContainer>
      <DownloadAutoRedirect ios={ios} android={android} />
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-condensed text-3xl font-bold tracking-wide text-ink">
          Get the StrikersFeed app
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {MOBILE_APP_STATUS === "BETA"
            ? "Join the beta on your phone, or scan the code."
            : "Grab it on your phone, or scan the code."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          {ios && (
            <a href={ios} className={buttonClasses("secondary", "lg", "w-full max-w-xs gap-2")}>
              <Apple className="h-5 w-5 text-accent" /> {cta.ios}
            </a>
          )}
          {android && (
            <a href={android} className={buttonClasses("secondary", "lg", "w-full max-w-xs gap-2")}>
              <Smartphone className="h-5 w-5 text-accent" /> {cta.android}
            </a>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <AppDownloadQRCode size={160} />
          <p className="text-xs text-ink-muted">Scan to open this page on your phone.</p>
        </div>

        <p className="mt-6 text-xs text-ink-muted">
          On the wrong device? Use the buttons above. Sent here by mistake?{" "}
          <a href="/app" className="text-accent hover:underline">
            Learn more about the app
          </a>
          .
        </p>
      </div>
    </PageContainer>
  );
}
