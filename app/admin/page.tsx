import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { createAdminClient, isAdmin } from "@/lib/supabase/admin";
import { AppHeader } from "@/components/Logo";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Fixproof", robots: { index: false } };

type Funnel = {
  ref: string;
  signups: number;
  signups_24h: number;
  signups_7d: number;
  logged_issue: number;
  sent_letter: number;
};
type Day = { day: string; signups: number; issues: number; letters: number; ai_checks: number };

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

export default async function AdminPage() {
  const { user } = await requireUser();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin(user.email)) notFound();

  const db = createAdminClient();
  const [{ data: funnel, error: fErr }, { data: daily, error: dErr }] = await Promise.all([
    db.from("admin_ref_funnel").select("*"),
    db.from("admin_daily").select("*"),
  ]);

  if (fErr || dErr) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="font-bold">Couldn&apos;t load stats.</p>
        <p className="mt-2 text-sm text-muted">
          Have you run <code>supabase/003_ref_admin.sql</code>? Error: {(fErr || dErr)?.message}
        </p>
      </main>
    );
  }

  const rows = (funnel ?? []) as Funnel[];
  const days = (daily ?? []) as Day[];
  const total = rows.reduce(
    (a, r) => ({
      signups: a.signups + r.signups,
      s24: a.s24 + r.signups_24h,
      s7: a.s7 + r.signups_7d,
      issue: a.issue + r.logged_issue,
      letter: a.letter + r.sent_letter,
    }),
    { signups: 0, s24: 0, s7: 0, issue: 0, letter: 0 }
  );
  const today = days[days.length - 1];
  const maxSignups = Math.max(1, ...days.map((d) => d.signups));

  return (
    <>
      <AppHeader right={<span className="stamp border-ink text-ink">Admin</span>} />
      <main className="mx-auto max-w-xl space-y-5 px-4 pb-16 pt-6">
        <h1 className="text-3xl font-black">How it&apos;s going</h1>

        <section className="grid grid-cols-2 gap-3">
          <Stat label="Sign-ups (24h)" value={total.s24} sub={`${total.s7} this week · ${total.signups} total`} />
          <Stat label="Letter sent rate" value={pct(total.letter, total.signups)} sub={`${total.letter} of ${total.signups} users`} highlight />
          <Stat label="Logged an issue" value={pct(total.issue, total.signups)} sub={`${total.issue} users`} />
          <Stat
            label="Photo checks today"
            value={today?.ai_checks ?? 0}
            sub={`Cap ${SITE.dailyDiagnoseLimit}/user/day`}
          />
        </section>

        <section className="card p-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">Sign-ups, last 14 days</p>
          <div className="mt-4 flex h-28 items-end gap-1">
            {days.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[10px] text-muted">{d.signups || ""}</span>
                <div
                  className="w-full rounded-t bg-ink"
                  style={{ height: `${Math.max(2, (d.signups / maxSignups) * 88)}px` }}
                  title={`${d.day}: ${d.signups} sign-ups, ${d.letters} letters`}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
            <span>{days[0]?.day.slice(5)}</span>
            <span>today</span>
          </div>
        </section>

        <section className="card overflow-hidden">
          <p className="px-4 pt-4 font-mono text-xs font-semibold uppercase tracking-widest text-muted">By creator link</p>
          {rows.length === 0 ? (
            <p className="p-4 text-muted">No sign-ups yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-y border-line bg-paper text-left text-xs text-muted">
                    <th className="px-4 py-2 font-semibold">Ref</th>
                    <th className="px-2 py-2 text-right font-semibold">24h</th>
                    <th className="px-2 py-2 text-right font-semibold">Total</th>
                    <th className="px-2 py-2 text-right font-semibold">Issue</th>
                    <th className="px-4 py-2 text-right font-semibold">Letter</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.ref} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-bold">{r.ref}</td>
                      <td className="px-2 py-3 text-right font-mono">{r.signups_24h}</td>
                      <td className="px-2 py-3 text-right font-mono">{r.signups}</td>
                      <td className="px-2 py-3 text-right font-mono">{pct(r.logged_issue, r.signups)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{pct(r.sent_letter, r.signups)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-muted">
          Creator links: <code className="font-mono">{"<your-domain>"}/?ref=creatorname</code>. Attribution is first
          touch, 30 days, same browser. Someone who watches on TikTok&apos;s in-app browser but signs up later in
          Safari shows as &ldquo;direct&rdquo;, so treat creator numbers as a floor.
        </p>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? "border-ink bg-hivis/30" : ""}`}>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
