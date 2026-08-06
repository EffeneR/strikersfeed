import { Download } from "lucide-react";
import { ANDROID_APK_URL } from "@/config/mobileApp";
import { cn } from "@/lib/cn";

/**
 * Direct Android APK download (EAS build) — a real, installable app that doesn't
 * need the Play Store. Renders nothing if no valid APK URL is configured.
 */
export function AndroidApkButton({ className }: { className?: string }) {
  if (!ANDROID_APK_URL) return null;
  return (
    <a
      href={ANDROID_APK_URL}
      className={cn(
        "inline-flex h-12 items-center gap-3 rounded-xl bg-accent px-5 font-semibold text-black transition-colors hover:bg-accent-hover",
        className,
      )}
    >
      <Download className="h-5 w-5" />
      <span className="flex flex-col text-left leading-tight">
        <span className="text-sm">Download for Android</span>
        <span className="text-[11px] font-medium text-black/70">Free · direct .apk install</span>
      </span>
    </a>
  );
}
