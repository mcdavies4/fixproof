import { refsFor } from "./legal";
import type { Issue, Profile } from "./types";

const ukDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function deadlineFrom(issue: Issue): Date | null {
  if (!issue.landlord_notified_at) return null;
  const d = new Date(issue.landlord_notified_at);
  d.setDate(d.getDate() + issue.response_days);
  return d;
}

export function daysOverdue(issue: Issue): number {
  const dl = deadlineFrom(issue);
  if (!dl || issue.status === "resolved") return 0;
  return Math.floor((Date.now() - dl.getTime()) / 86_400_000);
}

function header(p: Profile) {
  return [
    p.full_name || "[Your name]",
    p.property_address || "[Property address]",
    "",
    ukDate(new Date()),
    "",
    p.landlord_name || "[Landlord / agent name]",
    p.landlord_address || "",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n")
    .trimEnd();
}

export function repairLetter(issue: Issue, p: Profile) {
  const refs = refsFor(issue.category).filter((r) => r.letterText);
  const urgentLine =
    issue.severity === "emergency"
      ? "Because this is a safety risk, I am asking you to attend within 24 hours."
      : `I would be grateful if you could arrange for the problem to be inspected, and confirm in writing within ${issue.response_days} days when the repair will be carried out.`;

  const subject = `Repair request: ${issue.title} at ${p.property_address || "the property"}`;

  const body = `${header(p)}

Dear ${p.landlord_name || "Sir or Madam"},

Re: ${subject}

I am writing to formally report a disrepair at the property I rent from you.

The problem: ${issue.title}${issue.location_in_home ? `, in the ${issue.location_in_home.toLowerCase()}` : ""}.
${issue.first_noticed ? `I first noticed it on ${ukDate(issue.first_noticed)}.\n` : ""}
${issue.ai_observations ? `What I can see: ${issue.ai_observations}\n` : ""}${issue.tenant_notes ? `\nHow it is affecting me: ${issue.tenant_notes}\n` : ""}${issue.ai_hazards.length ? `\nI am concerned about: ${issue.ai_hazards.join("; ")}.\n` : ""}
${refs.map((r) => r.letterText).join("\n\n")}

${urgentLine}

I can provide access for an inspection and repairs. Please contact me to arrange a time, giving at least 24 hours' notice as required.

I have kept dated photographs of the problem and a record of this request. Please treat this letter as formal notice of the disrepair.

Yours sincerely,

${p.full_name || "[Your name]"}`;

  return { subject, body };
}

export function chaseLetter(issue: Issue, p: Profile) {
  const sent = issue.landlord_notified_at ? ukDate(issue.landlord_notified_at) : "[date]";
  const elapsed = issue.landlord_notified_at
    ? Math.max(1, Math.floor((Date.now() - new Date(issue.landlord_notified_at).getTime()) / 86_400_000))
    : issue.response_days;
  const subject = `Second notice: unresolved repair — ${issue.title}`;
  const body = `${header(p)}

Dear ${p.landlord_name || "Sir or Madam"},

Re: ${subject}

On ${sent} I reported the following problem at ${p.property_address || "the property"}: ${issue.title}.

${elapsed === 1 ? "1 day has" : `${elapsed} days have`} passed and the repair has not been carried out${issue.status === "reported" ? ", and I have not received a satisfactory response" : ""}.

Please confirm within 7 days of this letter the date on which the repair will be carried out.

If I do not hear from you, I intend to contact the local council's environmental health team and ask them to inspect the property under the Housing Act 2004. I will also consider my other options, including under the Homes (Fitness for Human Habitation) Act 2018.

I continue to keep dated photographs and a record of all correspondence.

Yours sincerely,

${p.full_name || "[Your name]"}`;
  return { subject, body };
}

export function mailto(to: string | null, subject: string, body: string) {
  return `mailto:${encodeURIComponent(to || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
