import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of StrikersFeed.",
};

const UPDATED = "August 6, 2026";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated={UPDATED}
      intro={`These terms are an agreement between you and ${siteConfig.name} ("we", "us")
      governing your use of the ${siteConfig.domain} website and mobile apps (the
      "Service"). By creating an account or using the Service, you agree to these
      terms.`}
    >
      <LegalSection heading="1. Who can use StrikersFeed">
        <p>
          You must be at least 13 years old (or the minimum age of digital consent
          in your country, if higher) to use the Service. You&apos;re responsible
          for keeping your account credentials secure and for activity on your
          account.
        </p>
      </LegalSection>

      <LegalSection heading="2. Independence">
        <p>{siteConfig.disclaimer}</p>
        <p>
          &quot;Strikers Club&quot; and related marks belong to their respective
          owners. We use them only to describe the community this platform serves.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your content">
        <p>
          You keep ownership of the content you post. By posting, you grant us a
          non-exclusive, worldwide, royalty-free licence to host, store, display
          and distribute that content for the purpose of operating and promoting
          the Service. You represent that you have the rights to everything you
          post and that it doesn&apos;t infringe anyone else&apos;s rights.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>
          You agree to follow our{" "}
          <a className="text-accent hover:underline" href="/community-guidelines">
            Community Guidelines
          </a>
          . Don&apos;t misuse the Service — no impersonation, harassment, illegal
          content, scraping, attempts to break security, or interference with
          other users. We may remove or hide content and suspend or terminate
          accounts that violate these terms.
        </p>
      </LegalSection>

      <LegalSection heading="5. Moderation">
        <p>
          We may review, hide, remove, or restrict content and accounts to enforce
          these terms and our guidelines, including automated hiding of content
          that receives multiple reports. We aren&apos;t obligated to host any
          particular content.
        </p>
      </LegalSection>

      <LegalSection heading="6. Ending your account">
        <p>
          You can delete your account at any time from Settings. Deleting your
          account permanently removes your profile and content. We may suspend or
          terminate accounts that break these terms.
        </p>
      </LegalSection>

      <LegalSection heading="7. Disclaimers and liability">
        <p>
          The Service is provided &quot;as is&quot; without warranties of any
          kind. To the maximum extent permitted by law, we aren&apos;t liable for
          indirect, incidental, or consequential damages arising from your use of
          the Service.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes">
        <p>
          We may update these terms from time to time. If we make material
          changes, we&apos;ll take reasonable steps to let you know. Continuing to
          use the Service after changes take effect means you accept them.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions about these terms? Email{" "}
          <a className="text-accent hover:underline" href="mailto:support@strikersfeed.club">
            support@strikersfeed.club
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
