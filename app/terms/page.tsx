import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use — Fixproof" };

export default function Terms() {
  return (
    <LegalPage title="Terms of use">
      <p>
        These terms apply when you use {SITE.name}, run by {SITE.company}
        {SITE.companyNumber ? ` (company number ${SITE.companyNumber})` : ""}. By creating an account you agree to
        them. Contact: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2>What {SITE.name} is — and isn&apos;t</h2>
      <ul>
        <li>
          {SITE.name} helps private renters in England document repair problems, create repair request letters from
          templates, and keep a dated record.
        </li>
        <li>
          <b>It is not legal advice</b> and we are not a law firm. Letters are general templates. For advice on your
          situation, contact Shelter, Citizens Advice or a housing solicitor.
        </li>
        <li>
          It covers <b>private tenancies in England only</b>. It may not be suitable for social housing, lodgers,
          licences, or homes in Scotland, Wales or Northern Ireland.
        </li>
        <li>
          In an emergency — a gas smell, fire, or immediate danger — call 0800 111 999 (gas) or 999. Don&apos;t wait
          for the app.
        </li>
      </ul>

      <h2>AI diagnosis</h2>
      <p>
        {SITE.name} uses AI to suggest what a problem is, how serious it might be, and safety tips. It can be wrong.
        It&apos;s a starting point, not a professional inspection. Check and edit everything before you send a
        letter. You&apos;re responsible for what you send.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Only upload photos of the home you rent, and only information that&apos;s true.</li>
        <li>Don&apos;t upload photos of people without their permission, or anything unlawful or offensive.</li>
        <li>Don&apos;t use {SITE.name} to harass anyone or to make false claims.</li>
        <li>Keep your sign-in email secure.</li>
        <li>Keep paying your rent. Withholding rent can put your tenancy at risk, even when repairs are overdue.</li>
      </ul>

      <h2>Your records</h2>
      <p>
        Your photos and notes stay yours. You give us permission to store and process them only to provide the
        service. Log entries are timestamped by our servers and can&apos;t be edited or backdated, so the record stays
        reliable. We can&apos;t guarantee how a landlord, council or court will treat your records.
      </p>

      <h2>Fair use</h2>
      <p>
        To keep {SITE.name} running for everyone, photo checks are limited to {SITE.dailyDiagnoseLimit} per account
        per day. We may suspend accounts that misuse the service.
      </p>

      <h2>Paid features</h2>
      <p>
        {SITE.name} is free to use today. If we introduce paid features, we&apos;ll show the price clearly before you
        buy, and you keep your statutory rights as a consumer.
      </p>

      <h2>Our responsibility to you</h2>
      <p>
        We work hard to keep {SITE.name} accurate and available, but we can&apos;t promise it will be uninterrupted or
        error-free, or that using it will get your repair done. We aren&apos;t responsible for what your landlord or
        anyone else does. We don&apos;t exclude liability where it would be unlawful to, including for death or
        personal injury caused by our negligence, or for fraud. Nothing in these terms affects your statutory rights.
      </p>

      <h2>Closing your account</h2>
      <p>
        You can ask us to delete your account at any time by emailing us. Save your evidence pack as a PDF first if
        you want to keep it. We may close accounts that break these terms.
      </p>

      <h2>Changes and law</h2>
      <p>
        We may update these terms and will tell you about meaningful changes. These terms are governed by the law of
        England and Wales, and the courts of England and Wales have jurisdiction.
      </p>
    </LegalPage>
  );
}
