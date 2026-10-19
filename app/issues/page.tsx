import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/supabase/server";
import { AppHeader } from "@/components/Logo";
import { StatusStamp, SeverityPill } from "@/components/Badges";
import { daysOverdue, deadlineFrom } from "@/lib/letters";
import { signOut } from "@/app/actions";
import type { Issue, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

function DeadlineLine({ issue }: { issue: Issue }) {
  if (issue.status === "resolved") return <span className="text-ok">Fixed</span>;
  const dl = deadlineFrom(issue);
  if (!dl) return <span className="text-muted">Letter not sent yet</span>;
  const over = daysOverdue(issue);
  if (over > 0) return <span className="font-bold text-alert">{over} day{over === 1 ? "" : "s"} overdue</span>;
  const left = Math.max(0, Math.ceil((dl.getTime() - Date.now()) / 86_400_000));
  return <span className="text-muted">{left} day{left === 1 ? "" : "s"} left to respond</span>;
}

export default async function IssuesPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");

  // First-touch attribution: records which creator link brought this user. Insert-only, ignored if already set.
  const ref = (await cookies()).get("fp_ref")?.value || "direct";

  const [{ data: issues }, { data: profile }] = await Promise.all([
    supabase.from("issues").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
    supabase.from("attributions").upsert({ user_id: user.id, ref }, { onConflict: "user_id", ignoreDuplicates: true }),
  ]);

  const needsProfile = !profile?.full_name || !profile?.property_address;
  const list = (issues ?? []) as Issue[];
  const open = list.filter((i) => i.status !== "resolved");
  const done = list.filter((i) => i.status === "resolved");

  return (
    <>
      <AppHeader
        right={
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/settings">Details</Link>
            <form action={signOut}>
              <button className="text-muted">Sign out</button>
            </form>
          </div>
        }
      />
      <main className="mx-auto max-w-xl px-4 pb-28 pt-6">
        {needsProfile && (
          <Link href="/settings?next=/issues/new" className="card mb-5 block border-hivis bg-hivis/20 p-4">
            <p className="font-bold">Add your address and landlord&apos;s details</p>
            <p className="text-sm text-muted">So your letters are ready to send. Takes 30 seconds.</p>
          </Link>
        )}

        <h1 className="text-3xl font-black">Your repairs</h1>

        {list.length === 0 ? (
          <div className="card mt-5 p-6 text-center">
            <p className="text-lg font-bold">Nothing logged yet</p>
            <p className="mt-1 text-muted">Snap the first problem and get your repair letter.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {[...open, ...done].map((i) => (
              <li key={i.id}>
                <Link href={`/issues/${i.id}`} className="card block p-4 active:bg-paper">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-extrabold leading-snug">{i.title}</p>
                    <SeverityPill severity={i.severity} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <DeadlineLine issue={i} />
                    <StatusStamp status={i.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <div className="no-print fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-xl">
          <Link href="/issues/new" className="btn-hivis w-full text-lg">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 8h3l2-3h8l2 3h3v11H3z" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Snap a problem
          </Link>
        </div>
      </div>
    </>
  );
}
