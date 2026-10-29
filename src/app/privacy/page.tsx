import type { Metadata } from "next";
import { ProsePage } from "@/components/ProsePage";
import { LEGAL, SUPPORT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SORARY collects, uses and protects personal data.",
};

// Keep this page in step with what the platform actually does. Update it before each new feature that
// handles personal data goes live (messages, orders and payments, activity statistics).

export default function PrivacyPage() {
  const operator = LEGAL.orgNumber ? `${LEGAL.operator} (org. no. ${LEGAL.orgNumber})` : LEGAL.operator;
  return (
    <ProsePage eyebrow="Legal" title="Privacy Policy" note={`Draft · last updated ${LEGAL.lastUpdated} · to be reviewed before launch`}>
      <p>
        This policy explains what personal data SORARY collects, why, and what rights you have. We collect as little as
        we can and never sell your data.
      </p>

      <h2>Who is responsible</h2>
      <p>
        {operator}, {LEGAL.location}, is the controller of the personal data described here. Contact us about anything
        in this policy at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>What we collect</h2>
      <h3>Your account</h3>
      <p>Your email address, used to sign you in with a link, and the dates you created your account and last signed in.</p>
      <h3>Artist profiles</h3>
      <p>
        If you create an artist profile: the name you work under, your profile address, city, country, medium, year of
        birth (optional), statement, biography, website and Instagram username. <b>A listed profile is public.</b> You
        can hide it at any time in your studio.
      </p>
      <h3>Artworks</h3>
      <p>
        Images and details of the works you upload. Published works are public. Images are resized in your own browser
        before they are uploaded, which also removes camera information such as GPS location.
      </p>
      <h3>The waitlist</h3>
      <p>
        If you joined the waitlist on sorary.se: your name, email address, whether you are a collector or an artist,
        your city, and anything you chose to add, such as a portfolio link or what you are looking for.
      </p>
      <h3>Technical data</h3>
      <p>
        A sign-in cookie that keeps you signed in. Our hosting provider records technical logs (such as IP address and
        browser) for security and to fix errors; these are kept for a short time. We do not use advertising or tracking
        cookies, and fonts are served from our own site rather than from Google.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>
          <b>To provide SORARY</b>: your account, your profile and your listings. The legal basis is our agreement with
          you (GDPR article 6(1)(b)).
        </li>
        <li>
          <b>To keep SORARY safe</b>: preventing abuse and fixing errors. The legal basis is our legitimate interest (article
          6(1)(f)).
        </li>
        <li>
          <b>To tell you about the launch</b>, if you joined the waitlist. The legal basis is your consent (article
          6(1)(a)), which you can withdraw at any time.
        </li>
      </ul>

      <h2>Who processes data for us</h2>
      <p>We use a small number of service providers, bound by data processing agreements:</p>
      <ul>
        <li>
          <b>Supabase</b>: database, sign-in and image storage, in the EU (Stockholm).
        </li>
        <li>
          <b>Netlify</b>: hosting of the website. Netlify is a US company; where data leaves the EU it is protected by
          the EU Standard Contractual Clauses.
        </li>
        <li>
          <b>Resend</b>: sending sign-in and service emails, in the EU (Ireland).
        </li>
      </ul>
      <p>
        We share data with authorities only when the law requires it. When purchases open, payment details will be
        handled by our payment provider and never stored by SORARY; this policy will be updated before then.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Account, profile and artworks: until you delete them or your account.</li>
        <li>Waitlist details: until the launch, or until you ask us to remove them.</li>
        <li>Technical logs: a short period, normally no more than 30 days.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, have it corrected or deleted, restrict or object to how we use it, and
        receive it in a portable format. To delete your account and everything connected to it, write to{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the email address you sign in with; we act within 30
        days. A self-service option in the studio is coming.
      </p>
      <p>
        If you are unhappy with how we handle your data, you can complain to the Swedish Authority for Privacy Protection
        (IMY) at <a href="https://www.imy.se" rel="noopener">imy.se</a>.
      </p>

      <h2>Age</h2>
      <p>SORARY is for people aged 18 and over.</p>

      <h2>Changes</h2>
      <p>
        We update this policy when SORARY changes, for example before messages and purchases open. The date at the top
        shows the latest version. Significant changes are announced by email to registered users.
      </p>
    </ProsePage>
  );
}
