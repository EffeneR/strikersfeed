import QRCode from "qrcode";
import { DOWNLOAD_URL } from "@/config/mobileApp";
import { cn } from "@/lib/cn";

/**
 * Server-rendered QR code (self-contained SVG, no external service). Points at
 * the stable /download route by default so the destination can change later
 * without reprinting the code.
 */
export async function AppDownloadQRCode({
  value = DOWNLOAD_URL,
  size = 160,
  className,
}: {
  value?: string;
  size?: number;
  className?: string;
}) {
  let svg = "";
  try {
    svg = await QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: size,
      color: { dark: "#080a09", light: "#ffffff" },
    });
  } catch {
    return null;
  }

  return (
    <div
      className={cn("inline-block rounded-xl bg-white p-3", className)}
      style={{ width: size + 24 }}
      aria-label={`QR code linking to ${value}`}
      role="img"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
