import Link from "next/link";
import { footerSections } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";

/** Global marketing/site footer with the required independence disclaimer. */
export function Footer() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="container-shell py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo height={30} />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              {siteConfig.tagline} Watch, post, discuss and compete with the
              community.
            </p>
          </div>
          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="text-xs text-ink-muted">{siteConfig.disclaimer}</p>
          <p className="mt-2 text-xs text-ink-muted">
            © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
