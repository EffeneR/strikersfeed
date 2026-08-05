import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "The rules that keep StrikersFeed a good place for the Strikers Club community — and how we enforce them.",
};

const UPDATED = "August 6, 2026";

export default function CommunityGuidelinesPage() {
  return (
    <LegalLayout
      title="Community Guidelines"
      updated={UPDATED}
      intro="StrikersFeed is a community for Strikers Club players, teams and fans. These
      guidelines apply to everything you post — text, images, clips, comments and
      profiles. Breaking them can lead to content being removed, hidden, or your
      account being restricted."
    >
      <LegalSection heading="Be real, don't impersonate">
        <p>
          Don&apos;t pretend to be another player, team, creator or organisation.
          Impersonation of well-known community members is taken seriously —
          verify your identity (for example by connecting Steam) if you want the
          verified badge, and never claim accomplishments or accounts that
          aren&apos;t yours.
        </p>
      </LegalSection>

      <LegalSection heading="No harassment, hate, or threats">
        <p>
          Treat people with respect. We don&apos;t allow targeted harassment,
          bullying, threats of violence, or hateful conduct against people based
          on protected characteristics such as race, ethnicity, national origin,
          religion, disability, gender, gender identity, or sexual orientation.
        </p>
      </LegalSection>

      <LegalSection heading="Keep it appropriate">
        <p>
          No sexual or adult content, graphic violence, or content that promotes
          self-harm. Keep the platform focused on Strikers Club — off-topic spam,
          scams, and repetitive promotional content aren&apos;t welcome.
        </p>
      </LegalSection>

      <LegalSection heading="Credit clips correctly">
        <p>
          When you share a clip (for example from Medal), post the real source and
          credit the actual creator. Don&apos;t re-upload someone else&apos;s clip
          as your own or misattribute it to another player. Only share content you
          have the right to share.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting and enforcement">
        <p>
          Every post and comment has a report option, and you can report or block
          any account. Reports are reviewed by our moderators. Content that draws
          multiple reports is automatically hidden while it&apos;s reviewed.
        </p>
        <p>
          Depending on severity and history, we may hide or remove content, issue
          a warning, or limit or remove an account. Serious or repeated violations
          can result in a permanent ban. If you block someone, you stop seeing
          their posts and comments right away.
        </p>
      </LegalSection>

      <LegalSection heading="Questions or appeals">
        <p>
          If you think we got a decision wrong, or you need help, contact us at{" "}
          <a className="text-accent hover:underline" href="mailto:support@strikersfeed.club">
            support@strikersfeed.club
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
