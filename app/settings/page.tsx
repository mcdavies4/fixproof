import Link from "next/link";
import { redirect } from "next/navigation";
import { SITE } from "@/lib/site";
import { requireUser } from "@/lib/supabase/server";
import { AppHeader } from "@/components/Logo";
import { saveProfile } from "@/app/actions";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const { next } = await searchParams;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  const p = data ?? ({} as Partial<Profile>);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-6">
        <h1 className="text-3xl font-black">Your details</h1>
        <p className="mt-1 text-muted">These go at the top of every letter. Only you can see them.</p>

        <form action={saveProfile} className="mt-6 space-y-5">
          <input type="hidden" name="next" value={next || "/issues"} />
          <fieldset className="space-y-4">
            <legend className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted">You</legend>
            <div>
              <label className="label">Full name</label>
              <input className="field" name="full_name" required defaultValue={p.full_name ?? ""} autoComplete="name" />
            </div>
            <div>
              <label className="label">Address of the home you rent</label>
              <textarea
                className="field min-h-24"
                name="property_address"
                required
                defaultValue={p.property_address ?? ""}
                autoComplete="street-address"
              />
            </div>
            <div>
              <label className="label">Tenancy start date (optional)</label>
              <input className="field" type="date" name="tenancy_start" defaultValue={p.tenancy_start ?? ""} />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted">
              Landlord or letting agent
            </legend>
            <div>
              <label className="label">Name</label>
              <input className="field" name="landlord_name" defaultValue={p.landlord_name ?? ""} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="field" type="email" name="landlord_email" defaultValue={p.landlord_email ?? ""} />
            </div>
            <div>
              <label className="label">Postal address (optional)</label>
              <textarea className="field min-h-20" name="landlord_address" defaultValue={p.landlord_address ?? ""} />
              <p className="mt-1.5 text-xs text-muted">
                Your landlord must give you an address in England or Wales for notices — check your tenancy agreement.
              </p>
            </div>
          </fieldset>

          <button className="btn-primary w-full">Save</button>
        </form>

        <p className="mt-10 text-center text-xs text-muted">
          <Link href="/privacy" className="underline">Privacy</Link> ·{" "}
          <Link href="/terms" className="underline">Terms</Link> · To delete your account, email{" "}
          <a href={`mailto:${SITE.contactEmail}?subject=Delete my Fixproof account`} className="underline">
            {SITE.contactEmail}
          </a>
        </p>
      </main>
    </>
  );
}
