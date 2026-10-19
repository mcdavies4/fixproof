import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy — Fixproof" };

export default function Privacy() {
  const email = <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>;
  return (
    <LegalPage title="Privacy policy">
      <p>
        {SITE.name} is run by {SITE.company}
        {SITE.companyNumber ? ` (company number ${SITE.companyNumber})` : ""}, the data controller for the personal
        information described here. Questions or requests: {email}.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <b>Account:</b> your email address, used to sign you in.
        </li>
        <li>
          <b>Your details:</b> your name, the address of the home you rent, your tenancy start date, and your landlord
          or agent&apos;s name, email and postal address.
        </li>
        <li>
          <b>Repair records:</b> photos you take, your notes, the problem descriptions, and a timestamped log of what
          happened and when.
        </li>
        <li>
          <b>Technical:</b> sign-in cookies that keep you logged in, and basic server logs (such as IP address and
          errors) used to keep the service secure and working.
        </li>
      </ul>
      <p>
        We don&apos;t use advertising or analytics cookies, and we don&apos;t sell your data.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To identify the problem in your photos, write your repair letters and keep your evidence log. This is
          necessary to provide the service you asked for.</li>
        <li>To keep the service secure, prevent misuse and enforce usage limits (our legitimate interests).</li>
        <li>To reply when you contact us.</li>
      </ul>
      <p>
        Your photos may show the inside of your home. Please avoid photographing people, documents or anything you
        don&apos;t want stored. If a photo shows information about your health or someone else&apos;s, you choose to
        share it, and we only use it to provide the service to you.
      </p>

      <h2>Your landlord&apos;s details</h2>
      <p>
        You give us your landlord or agent&apos;s contact details so we can put them in your letters. We use them only
        for that and don&apos;t contact your landlord ourselves.
      </p>

      <h2>Who we share it with</h2>
      <p>We use these service providers to run {SITE.name}. They process data only on our instructions:</p>
      <ul>
        <li>
          <b>Supabase</b> — database, sign-in and photo storage.
        </li>
        <li>
          <b>Vercel</b> — website hosting.
        </li>
        <li>
          <b>Anthropic</b> — AI that analyses the photos you submit for diagnosis. Under its commercial terms,
          Anthropic does not use this data to train its models.
        </li>
        <li>
          <b>Our email provider</b> — to send sign-in emails.
        </li>
      </ul>
      <p>
        Some of these providers may process data outside the UK, including in the United States. Where they do, we
        rely on legal safeguards approved under UK data protection law, such as the UK International Data Transfer
        Addendum or the UK–US data bridge.
      </p>
      <p>We may disclose information if the law requires it.</p>

      <h2>How long we keep it</h2>
      <p>
        We keep your account and repair records while your account is open, because the point of {SITE.name} is a
        lasting record you can rely on. If you ask us to delete your account, we delete your details, records and
        photos within 30 days, except where we have to keep something by law. Server logs are kept for a short
        period for security.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK data protection law you can ask to access, correct, delete or receive a copy of your data, and to
        object to or restrict how we use it. Email {email} and we&apos;ll respond within one month.
      </p>
      <p>
        If you&apos;re unhappy with how we handle your data, you can complain to the Information Commissioner&apos;s
        Office at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk</a>. We&apos;d
        appreciate the chance to sort it out first.
      </p>

      <h2>Security</h2>
      <p>
        Photos are stored privately and are only accessible through your account using short-lived links. Each
        user&apos;s data is separated at the database level.
      </p>

      <h2>Who can use {SITE.name}</h2>
      <p>{SITE.name} is for adults aged 18 and over.</p>

      <h2>Changes</h2>
      <p>If we change this policy in a meaningful way, we&apos;ll update the date above and let you know by email.</p>
    </LegalPage>
  );
}
