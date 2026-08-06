import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Apple, Smartphone } from "lucide-react";
import {
  androidDestination,
  iosDestination,
  ANDROID_APK_URL,
  storeCtas,
} from "@/config/mobileApp";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppDownloadQRCode } from "@/components/app/AppDownloadQRCode";
import { AndroidApkButton } from "@/components/app/AndroidApkButton";
import { DownloadAutoRedirect } from "@/components/app/DownloadAutoRedirect";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Download",
  description: "Download the StrikersFeed mobile app.",
};

export default function DownloadPage() {
  const ios = iosDestination();
  const android = androidDestination();

  // Nothing installable to offer yet — send people to the marketing page.
  if (!ios && !android && !ANDROID_APK_URL) redirect("/app");

  const cta = storeCtas();

  return (
    <PageContainer>
      {/* Only auto-redirect to a real store link; never auto-trigger an APK download. */}
      {(ios || android) && <DownloadAutoRedirect ios={ios} android={android} />}
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-condensed text-3xl font-bold tracking-wide text-ink">
          Get the StrikersFeed app
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {ANDROID_APK_URL
            ? "Android is available now as a direct download. iPhone is coming soon."
            : "Grab it on your phone, or scan the code."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          {ANDROID_APK_URL && <AndroidApkButton className="w-full max-w-xs justify-center" />}
          {android && (
            <a href={android} className={buttonClasses("secondary", "lg", "w-full max-w-xs gap-2")}>
              <Smartphone className="h-5 w-5 text-accent" /> {cta.android}
            </a>
          )}
          {ios && (
            <a href={ios} className={buttonClasses("secondary", "lg", "w-full max-w-xs gap-2")}>
              <Apple className="h-5 w-5 text-accent" /> {cta.ios}
            </a>
          )}
        </div>

        {ANDROID_APK_URL && (
          <div className="mx-auto mt-4 max-w-xs rounded-lg border border-line bg-surface p-3 text-left">
            <p className="text-xs font-semibold text-ink">Installing on Android</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-ink-muted">
              <li>Open this page on your Android phone and tap “Download for Android”.</li>
              <li>Open the downloaded file.</li>
              <li>If asked, allow “install from this source”, then tap Install.</li>
            </ol>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-2">
          <AppDownloadQRCode size={160} />
          <p className="text-xs text-ink-muted">Scan to open this page on your phone.</p>
        </div>

        <p className="mt-6 text-xs text-ink-muted">
          {ANDROID_APK_URL && "The iPhone version is on the way. "}
          <a href="/app" className="text-accent hover:underline">
            Learn more about the app
          </a>
          .
        </p>
      </div>
    </PageContainer>
  );
}
