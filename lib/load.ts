import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import type { Issue, IssueEvent, Profile } from "@/lib/types";

export async function loadIssue(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) redirect(`/login?next=/issues/${id}`);

  const [{ data: issue }, { data: events }, { data: profile }] = await Promise.all([
    supabase.from("issues").select("*").eq("id", id).maybeSingle<Issue>(),
    supabase.from("issue_events").select("*").eq("issue_id", id).order("created_at", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
  ]);
  if (!issue) notFound();

  const evs = (events ?? []) as IssueEvent[];
  const allPaths = Array.from(new Set([...issue.photo_paths, ...evs.flatMap((e) => e.photo_paths)]));
  const urls: Record<string, string> = {};
  if (allPaths.length) {
    const { data } = await supabase.storage.from("evidence").createSignedUrls(allPaths, 60 * 60);
    data?.forEach((d) => d.path && d.signedUrl && (urls[d.path] = d.signedUrl));
  }

  const p: Profile =
    profile ??
    ({
      id: user.id,
      full_name: null,
      property_address: null,
      landlord_name: null,
      landlord_email: null,
      landlord_address: null,
      tenancy_start: null,
    } as Profile);

  return { issue, events: evs, profile: p, urls };
}

export const stamp = (d: string) =>
  new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

export const EVENT_LABEL: Record<string, string> = {
  created: "Problem logged",
  photo_added: "Photo added",
  letter_sent: "Repair request sent",
  chase_sent: "Second notice sent",
  landlord_response: "Landlord replied",
  note: "Update",
  escalated: "Escalated",
  resolved: "Fixed",
};
