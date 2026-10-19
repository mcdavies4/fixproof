import Link from "next/link";
import { loadIssue, stamp, EVENT_LABEL } from "@/lib/load";
import { CATEGORIES, SEVERITY, type Category, type Severity } from "@/lib/legal";
import { deadlineFrom } from "@/lib/letters";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { issue, events, profile, urls } = await loadIssue(id);
  const deadline = deadlineFrom(issue);
  const allPhotos = [
    ...issue.photo_paths.map((p) => ({ p, at: issue.created_at })),
    ...events.filter((e) => e.kind !== "created").flatMap((e) => e.photo_paths.map((p) => ({ p, at: e.created_at }))),
  ];

  const rows: [string, string][] = [
    ["Tenant", profile.full_name || "—"],
    ["Property", profile.property_address || "—"],
    ["Landlord / agent", profile.landlord_name || "—"],
    ["Problem", issue.title],
    ["Type", CATEGORIES[issue.category as Category]?.label ?? issue.category],
    ["Severity (tenant's assessment)", SEVERITY[issue.severity as Severity]?.label ?? issue.severity],
    ["Location", issue.location_in_home || "—"],
    ["First noticed", issue.first_noticed ? new Date(issue.first_noticed).toLocaleDateString("en-GB") : "—"],
    ["Landlord first notified", issue.landlord_notified_at ? stamp(issue.landlord_notified_at) : "Not yet"],
    ["Response requested by", deadline ? stamp(deadline.toISOString()) : "—"],
  ];

  return (
    <main className="mx-auto max-w-2xl bg-white px-6 py-8 text-black print:p-0">
      <div className="no-print mb-6 space-y-3">
        <PrintButton label="Save evidence pack as PDF" />
        <Link href={`/issues/${id}`} className="block text-center text-sm font-semibold text-muted underline">
          Back
        </Link>
      </div>

      <header className="border-b-2 border-black pb-3">
        <p className="font-mono text-xs uppercase tracking-widest">Disrepair evidence pack</p>
        <h1 className="mt-1 text-2xl font-black">{issue.title}</h1>
        <p className="font-mono text-xs">Generated {stamp(new Date().toISOString())} · Ref {issue.id.slice(0, 8).toUpperCase()}</p>
      </header>

      <table className="mt-5 w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-gray-200 align-top">
              <td className="w-44 py-2 pr-3 font-semibold">{k}</td>
              <td className="whitespace-pre-wrap py-2">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {(issue.ai_observations || issue.tenant_notes) && (
        <section className="mt-6 text-sm">
          <h2 className="font-bold">Description</h2>
          {issue.ai_observations && <p className="mt-1">{issue.ai_observations}</p>}
          {issue.tenant_notes && <p className="mt-2"><b>Impact on household:</b> {issue.tenant_notes}</p>}
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-bold">Timeline</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-gray-200 align-top">
                <td className="w-44 py-2 pr-3 font-mono text-xs">{stamp(e.created_at)}</td>
                <td className="py-2">
                  <b>{EVENT_LABEL[e.kind] ?? e.kind}.</b> {e.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-600">
          Timestamps are recorded by the server when each entry is made and cannot be edited or backdated.
        </p>
      </section>

      {allPhotos.length > 0 && (
        <section className="mt-6 break-before-page">
          <h2 className="text-sm font-bold">Photographs</h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {allPhotos.map(({ p, at }) =>
              urls[p] ? (
                <figure key={p} className="break-inside-avoid">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls[p]} alt="" className="w-full rounded border border-gray-300" />
                  <figcaption className="mt-1 font-mono text-[11px]">Uploaded {stamp(at)}</figcaption>
                </figure>
              ) : null
            )}
          </div>
        </section>
      )}
    </main>
  );
}
