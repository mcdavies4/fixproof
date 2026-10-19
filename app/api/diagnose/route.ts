import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_KEYS, SEVERITY_KEYS } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

const Input = z.object({
  images: z
    .array(z.object({ data: z.string().min(100), mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]) }))
    .min(1)
    .max(4),
  note: z.string().max(1000).optional(),
});

const Output = z.object({
  is_repair_issue: z.boolean(),
  title: z.string().max(120),
  category: z.enum(CATEGORY_KEYS as [string, ...string[]]),
  severity: z.enum(SEVERITY_KEYS as [string, ...string[]]),
  location_in_home: z.string().max(60),
  observations: z.string().max(800),
  likely_cause: z.string().max(400),
  hazards: z.array(z.string().max(160)).max(4),
  safety_tips: z.array(z.string().max(200)).max(4),
});

const SYSTEM = `You are a building maintenance surveyor helping a private tenant in England document a repair problem from photos.

Return ONLY a JSON object, no prose, no markdown fences, with these keys:
- is_repair_issue: boolean. false if the photo doesn't show a home repair/condition problem.
- title: short plain-English name of the problem, e.g. "Black mould on bedroom ceiling".
- category: one of ${CATEGORY_KEYS.join(", ")}.
- severity: one of:
   emergency = immediate risk to safety (gas smell, exposed live wiring, no heating/hot water in cold weather with vulnerable occupants, major leak through ceiling/electrics, missing/disabled smoke alarm with other fire risk, structural collapse risk)
   urgent = significant hazard or loss of an essential service (widespread mould, no hot water, persistent leak, broken external door lock, faulty smoke/CO alarm)
   routine = needs repair but no immediate danger
   cosmetic = appearance only.
- location_in_home: room or area, e.g. "Bedroom", "Bathroom", "Kitchen", "Hallway", "Exterior". Use "Unknown" if unclear.
- observations: 1-3 factual sentences describing ONLY what is visible (extent, size estimate, staining, damage). First person tenant voice is NOT needed; write neutrally. Do not speculate about blame.
- likely_cause: 1-2 sentences, hedged ("likely", "may indicate"). Mention if it could be a building defect (e.g. leak, failed seal, poor ventilation provision, missing insulation) vs. day-to-day condensation, honestly.
- hazards: up to 4 short phrases on health or safety risks (e.g. "respiratory irritation from mould spores", "risk of electric shock").
- safety_tips: up to 4 short, practical things the tenant can do safely while waiting (never tell them to do repair work on gas or electrics; for gas smell tell them to call 0800 111 999).

Never give legal advice. Never invent details you can't see.`;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 500 });

  // Daily cap per user (rolling 24h). Rows are insert-only, so it can't be reset client-side.
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count, error: countErr } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if (countErr) {
    console.error("usage check failed", countErr);
    return NextResponse.json({ error: "Something went wrong. Try again shortly." }, { status: 500 });
  }
  if ((count ?? 0) >= SITE.dailyDiagnoseLimit) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${SITE.dailyDiagnoseLimit} photo checks. Try again tomorrow.` },
      { status: 429 }
    );
  }

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  // Count the attempt before calling the AI, so failed or repeated calls still count.
  await supabase.from("ai_usage").insert({ user_id: user.id, kind: "diagnose" });

  const { images, note } = parsed.data;
  const client = new Anthropic();

  try {
    const msg = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 1200,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            ...images.map((img) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: img.mediaType, data: img.data },
            })),
            {
              type: "text" as const,
              text: note?.trim()
                ? `Tenant's note: ${note.trim()}\n\nReturn the JSON now.`
                : "Return the JSON now.",
            },
          ],
        },
      ],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const out = Output.safeParse(JSON.parse(json));
    if (!out.success) {
      return NextResponse.json({ error: "Couldn't read that photo. Try a clearer, closer shot." }, { status: 422 });
    }
    return NextResponse.json(out.data);
  } catch (e) {
    console.error("diagnose failed", e);
    return NextResponse.json({ error: "Diagnosis failed. Try again." }, { status: 502 });
  }
}
