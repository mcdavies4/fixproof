import Link from "next/link";
import { AppHeader } from "@/components/Logo";
import { StatusStamp, SeverityPill } from "@/components/Badges";
import { LetterPanel } from "@/components/LetterPanel";
import { UpdateForm } from "@/components/UpdateForm";
import { EscalatePanel } from "@/components/EscalatePanel";
import { loadIssue, stamp, EVENT_LABEL } from "@/lib/load";
import { repairLetter, chaseLetter, daysOverdue, deadlineFrom } from "@/lib/letters";
import { refsFor, LEGAL_REFS, CATEGORIES, EMERGENCY_NUMBERS, type Category } from "@/lib/legal";

export const dynamic = "force-dynamic";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { issue, events, profile, urls } = await loadIssue(id);

  const letter = repairLetter(issue, profile);
  const sent = !!issue.landlord_notified_at;
  const overdue = daysOverdue(issue);
  const deadline = deadlineFrom(issue);
  const chaseSent = events.some((e) => e.kind === "chase_sent");
  const missingProfile = !profile.full_name || !profile.property_address;
  const rights = [...refsFor(issue.category), LEGAL_REFS.rra];

  return (
    <>
      <AppHeader right={<Link href="/issues" className="text-sm font-semibold">All repairs</Link>} />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-16 pt-6">
        <div>
          <div className="flex items-center gap-2">
            <SeverityPill severity={issue.severity} />
            <span className="text-sm text-muted">
              {CATEGORIES[issue.category as Category]?.label}
              {issue.location_in_home ? ` · ${issue.location_in_home}` : ""}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black leading-tight">{issue.title}</h1>
          <div className="mt-3 flex items-center justify-between">
            <StatusStamp status={issue.status} />
            {deadline && issue.status !== "resolved" && (
              <span className="font-mono text-xs text-muted">Response due {stamp(deadline.toISOString()).split(",")[0]}</span>
            )}
          </div>
        </div>

        {issue.severity === "emergency" && issue.status !== "resolved" && (
          <div className="rounded-2xl bg-alert p-4 text-sm text-white">
            {EMERGENCY_NUMBERS.map((n) => (
              <p key={n.number}>
                {n.when}:{" "}
                <a href={`tel:${n.number.replace(/\s/g, "")}`} className="font-bold underline">
                  {n.number}
                </a>
              </p>
            ))}
          </div>
        )}

        {issue.photo_paths.length > 0 && (
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4">
            {issue.photo_paths.map((p) =>
              urls[p] ? (
                <a key={p} href={urls[p]} target="_blank" rel="noreferrer" className="shrink-0 snap-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls[p]} alt="" className="h-44 w-44 rounded-2xl border border-line object-cover" />
                </a>
              ) : null
            )}
          </div>
        )}

        {missingProfile && (
          <Link href={`/settings?next=/issues/${issue.id}`} className="card block border-hivis bg-hivis/20 p-4">
            <p className="font-bold">Add your name, address and landlord details</p>
            <p className="text-sm text-muted">Your letter has blanks until you do.</p>
          </Link>
        )}

        {overdue > 0 && issue.status !== "resolved" && (
          <EscalatePanel issueId={issue.id} overdue={overdue} escalated={issue.status === "escalated"} />
        )}

        <LetterPanel
          issueId={issue.id}
          kind="repair"
          subject={letter.subject}
          body={letter.body}
          landlordEmail={profile.landlord_email}
          alreadySent={sent}
        />

        {overdue > 0 && issue.status !== "resolved" && (() => {
          const chase = chaseLetter(issue, profile);
          return (
            <LetterPanel
              issueId={issue.id}
              kind="chase"
              subject={chase.subject}
              body={chase.body}
              landlordEmail={profile.landlord_email}
              alreadySent={chaseSent}
            />
          );
        })()}

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">Evidence log</p>
            <Link href={`/issues/${issue.id}/report`} className="text-sm font-bold underline">
              Evidence pack
            </Link>
          </div>
          <ol className="mt-4 space-y-4 border-l-2 border-line pl-4">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-ink" />
                <p className="font-mono text-xs text-muted">{stamp(e.created_at)}</p>
                <p className="font-bold">{EVENT_LABEL[e.kind] ?? e.kind}</p>
                {e.note && <p className="text-[15px]">{e.note}</p>}
                {e.photo_paths.length > 0 && e.kind !== "created" && (
                  <div className="mt-2 flex gap-2">
                    {e.photo_paths.map((p) =>
                      urls[p] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p} src={urls[p]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      ) : null
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        <UpdateForm issueId={issue.id} resolved={issue.status === "resolved"} />

        <details className="card p-4">
          <summary className="cursor-pointer font-bold">Your rights on this</summary>
          <ul className="mt-3 space-y-3">
            {rights.map((r) => (
              <li key={r.key}>
                <p className="text-sm font-bold">{r.name}</p>
                <p className="text-[15px] text-muted">{r.plain}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Information, not legal advice. Private tenancies in England. For advice on your situation, contact Shelter
            or Citizens Advice.
          </p>
        </details>

        {issue.ai_safety_tips.length > 0 && issue.status !== "resolved" && (
          <details className="card p-4">
            <summary className="cursor-pointer font-bold">While you wait</summary>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
              {issue.ai_safety_tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </details>
        )}
      </main>
    </>
  );
}
