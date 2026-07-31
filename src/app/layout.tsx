import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { siteConfig } from "@/config/site";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/user";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Strikers Club",
    "StrikersFeed",
    "football gaming",
    "community",
    "clips",
    "tournaments",
    "esports",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: "/assets/illustrations/landing-hero.png",
        width: 1707,
        height: 951,
        alt: siteConfig.og.imageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/assets/illustrations/landing-hero.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080a09",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();
  // Only touches cookies when a project is connected, so demo builds stay static.
  const user = configured ? await getCurrentUser() : null;

  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider
          configured={configured}
          initialAuthed={!!user}
          initialRole={user?.role ?? null}
          initialDisplayName={user?.displayName ?? null}
          initialUsername={user?.username ?? null}
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
          >
            Skip to content
          </a>
          <div className="flex min-h-dvh flex-col">
            <SiteNavbar />
            <main id="main-content" className="flex-1 pb-20 lg:pb-0">
              {children}
            </main>
            <MobileBottomNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
