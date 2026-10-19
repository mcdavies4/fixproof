"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/");
}

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const get = (k: string) => (String(formData.get(k) ?? "").trim() || null);
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: get("full_name"),
    property_address: get("property_address"),
    landlord_name: get("landlord_name"),
    landlord_email: get("landlord_email"),
    landlord_address: get("landlord_address"),
    tenancy_start: get("tenancy_start"),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  const next = String(formData.get("next") || "/issues");
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/issues");
}

type EventKind = "letter_sent" | "chase_sent" | "landlord_response" | "note" | "escalated" | "resolved" | "photo_added";

async function logEvent(issueId: string, kind: EventKind, note?: string | null, photoPaths: string[] = []) {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/login");
  const { error } = await supabase
    .from("issue_events")
    .insert({ issue_id: issueId, user_id: user.id, kind, note: note || null, photo_paths: photoPaths });
  if (error) throw new Error(error.message);
  return supabase;
}

export async function markLetterSent(issueId: string, method: string) {
  const supabase = await logEvent(issueId, "letter_sent", `Repair request sent by ${method}.`);
  await supabase
    .from("issues")
    .update({ status: "reported", landlord_notified_at: new Date().toISOString() })
    .eq("id", issueId)
    .is("landlord_notified_at", null);
  revalidatePath(`/issues/${issueId}`);
}

export async function markChaseSent(issueId: string, method: string) {
  await logEvent(issueId, "chase_sent", `Second notice sent by ${method}.`);
  revalidatePath(`/issues/${issueId}`);
}

export async function addUpdate(issueId: string, kind: "landlord_response" | "note", note: string, photoPaths: string[]) {
  const supabase = await logEvent(issueId, photoPaths.length && !note ? "photo_added" : kind, note, photoPaths);
  if (kind === "landlord_response") {
    await supabase.from("issues").update({ status: "in_progress" }).eq("id", issueId).eq("status", "reported");
  }
  revalidatePath(`/issues/${issueId}`);
}

export async function markEscalated(issueId: string, note: string) {
  const supabase = await logEvent(issueId, "escalated", note || "Reported to the council's environmental health team.");
  await supabase.from("issues").update({ status: "escalated" }).eq("id", issueId);
  revalidatePath(`/issues/${issueId}`);
}

export async function markResolved(issueId: string) {
  const supabase = await logEvent(issueId, "resolved", "Repair completed.");
  await supabase.from("issues").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", issueId);
  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/issues");
}
