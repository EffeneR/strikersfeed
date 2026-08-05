import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How StrikersFeed collects, uses and protects your data.",
};

const UPDATED = "August 6, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated={UPDATED}
      intro={`This policy explains what data ${siteConfig.name} collects, how we use it,
      and the choices you have. It applies to the ${siteConfig.domain} website and
      our mobile apps.`}
    >
      <LegalSection heading="Data we collect">
        <p>
          <strong className="text-ink">Account data</strong> — your email address,
          display name, handle, account type, and password (stored only as a
          secure hash by our authentication provider).
        </p>
        <p>
          <strong className="text-ink">Profile and content</strong> — your bio,
          avatar, posts, comments, reactions, and any clips or images you share.
        </p>
        <p>
          <strong className="text-ink">Connected accounts</strong> — if you choose
          to verify with Steam, your public Steam ID and persona name, used to
          confirm your identity and show a verified badge.
        </p>
        <p>
          <strong className="text-ink">Technical data</strong> — basic device and
          log information needed to run the Service securely and reliably.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          To provide the Service (show your feed, deliver posts and notifications),
          to verify identity and prevent impersonation, to keep the community safe
          (moderation, reports, and blocking), and to improve the product. We do
          not sell your personal data.
        </p>
      </LegalSection>

      <LegalSection heading="Moderation data">
        <p>
          When you report content or block an account, we store that action so our
          moderators can act on it and so blocked accounts stay hidden from you.
          Reports are visible to our moderation team and to you (your own
          reports), not to the person you reported.
        </p>
      </LegalSection>

      <LegalSection heading="Sharing">
        <p>
          We share data with the service providers that operate the platform — for
          example our hosting and database provider (Supabase) and video/clip
          providers — only as needed to run the Service. We may disclose data if
          required by law.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices and rights">
        <p>
          You can edit your profile, control what you post, and block or report
          others at any time. You can permanently delete your account and its
          content from Settings → Account. Depending on where you live, you may
          have rights to access, correct, or export your data — contact us to make
          a request.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention">
        <p>
          We keep your data while your account is active. When you delete your
          account, we remove your profile and content; some records may be
          retained briefly where required for security, legal, or backup purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          The Service isn&apos;t directed to children under 13 (or the minimum age
          of digital consent in your country). We don&apos;t knowingly collect data
          from them.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          For privacy questions or data requests, email{" "}
          <a className="text-accent hover:underline" href="mailto:support@strikersfeed.club">
            support@strikersfeed.club
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
