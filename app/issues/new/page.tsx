"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { compress, uploadShots, type Shot } from "@/lib/image";
import { CATEGORIES, CATEGORY_KEYS, SEVERITY, SEVERITY_KEYS, EMERGENCY_NUMBERS, type Severity } from "@/lib/legal";
import type { Diagnosis } from "@/lib/types";
import { AppHeader } from "@/components/Logo";

type Stage = "capture" | "diagnosing" | "review" | "saving";

export default function NewIssue() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("capture");
  const [shots, setShots] = useState<Shot[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [d, setD] = useState<Diagnosis | null>(null);
  const [firstNoticed, setFirstNoticed] = useState("");
  const [impact, setImpact] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    try {
      const added = await Promise.all(Array.from(files).slice(0, 4 - shots.length).map((f) => compress(f)));
      setShots((s) => [...s, ...added].slice(0, 4));
    } catch {
      setError("Couldn't read that image. Try another photo.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function diagnose() {
    setStage("diagnosing");
    setError(null);
    const res = await fetch("/api/diagnose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ images: shots.map((s) => ({ data: s.base64, mediaType: "image/jpeg" })), note }),
    });
    const json = await res.json().catch(() => ({ error: "Something went wrong." }));
    if (!res.ok) {
      setError(json.error);
      setStage("capture");
      return;
    }
    const diag = json as Diagnosis;
    if (!diag.is_repair_issue) {
      setError("That doesn't look like a repair problem. Try a closer photo of the damage.");
      setStage("capture");
      return;
    }
    setD(diag);
    setImpact(note);
    setStage("review");
  }

  async function save() {
    if (!d) return;
    setStage("saving");
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.replace("/login?next=/issues/new");

      const id = crypto.randomUUID();
      const paths = await uploadShots(supabase, user.id, id, shots);
      const sev = d.severity as Severity;

      const { error: e1 } = await supabase.from("issues").insert({
        id,
        user_id: user.id,
        title: d.title,
        category: d.category,
        severity: d.severity,
        location_in_home: d.location_in_home === "Unknown" ? null : d.location_in_home,
        first_noticed: firstNoticed || null,
        tenant_notes: impact.trim() || null,
        ai_observations: d.observations,
        ai_likely_cause: d.likely_cause,
        ai_hazards: d.hazards,
        ai_safety_tips: d.safety_tips,
        legal_refs: [...CATEGORIES[d.category as keyof typeof CATEGORIES].refs],
        photo_paths: paths,
        response_days: SEVERITY[sev]?.days ?? 14,
      });
      if (e1) throw e1;

      await supabase.from("issue_events").insert({
        issue_id: id,
        user_id: user.id,
        kind: "created",
        note: `Problem logged with ${paths.length} photo${paths.length === 1 ? "" : "s"}.`,
        photo_paths: paths,
      });

      router.replace(`/issues/${id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save. Try again.");
      setStage("review");
    }
  }

  const set = <K extends keyof Diagnosis>(k: K, v: Diagnosis[K]) => setD((x) => (x ? { ...x, [k]: v } : x));

  return (
    <>
      <AppHeader right={<Link href="/issues" className="text-sm font-semibold text-muted">Cancel</Link>} />
      <main className="mx-auto max-w-xl px-4 pb-32 pt-6">
        {(stage === "capture" || stage === "diagnosing") && (
          <>
            <h1 className="text-3xl font-black">Show us the problem</h1>
            <p className="mt-1 text-muted">One close-up and one wider shot works best. Up to 4 photos.</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {shots.map((s, i) => (
                <div key={s.preview} className="relative aspect-square overflow-hidden rounded-2xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setShots((x) => x.filter((_, j) => j !== i))}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/80 text-paper"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              {shots.length < 4 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-ink/30 bg-white"
                >
                  <span className="text-center">
                    <svg viewBox="0 0 24 24" className="mx-auto h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 8h3l2-3h8l2 3h3v11H3z" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                    <span className="mt-1 block text-sm font-bold">{shots.length ? "Add another" : "Take photo"}</span>
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={(e) => onFiles(e.target.files)}
            />

            <label className="label mt-6">Anything we can&apos;t see? (optional)</label>
            <textarea
              className="field min-h-24"
              placeholder="e.g. It's been there 3 months, the room smells damp, my child has a cough…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        )}

        {(stage === "review" || stage === "saving") && d && (
          <>
            {d.severity === "emergency" && (
              <div className="mb-5 rounded-2xl bg-alert p-4 text-white">
                <p className="font-black">This looks like an emergency</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {EMERGENCY_NUMBERS.map((n) => (
                    <li key={n.number}>
                      {n.when}:{" "}
                      <a href={`tel:${n.number.replace(/\s/g, "")}`} className="font-bold underline">
                        {n.number}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <span className="stamp border-ok text-ok">Identified</span>
            <input
              className="mt-3 w-full bg-transparent text-3xl font-black leading-tight outline-none"
              value={d.title}
              onChange={(e) => set("title", e.target.value)}
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="field" value={d.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {CATEGORIES[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">How serious</label>
                <select className="field" value={d.severity} onChange={(e) => set("severity", e.target.value)}>
                  {SEVERITY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {SEVERITY[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Where</label>
                <input className="field" value={d.location_in_home} onChange={(e) => set("location_in_home", e.target.value)} />
              </div>
              <div>
                <label className="label">First noticed</label>
                <input
                  className="field"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={firstNoticed}
                  onChange={(e) => setFirstNoticed(e.target.value)}
                />
              </div>
            </div>

            <label className="label mt-5">What&apos;s visible</label>
            <textarea className="field min-h-24" value={d.observations} onChange={(e) => set("observations", e.target.value)} />

            <label className="label mt-5">How it&apos;s affecting you (goes in the letter)</label>
            <textarea
              className="field min-h-20"
              placeholder="e.g. We can't use the bedroom; my daughter has asthma."
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            />

            <div className="card mt-5 p-4">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">Likely cause</p>
              <p className="mt-1">{d.likely_cause}</p>
              {d.safety_tips.length > 0 && (
                <>
                  <p className="mt-4 font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                    While you wait
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {d.safety_tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}

        {error && <p className="mt-5 rounded-xl bg-alert/10 p-3 text-sm text-alert">{error}</p>}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-xl">
          {stage === "capture" && (
            <button className="btn-hivis w-full text-lg" disabled={!shots.length} onClick={diagnose}>
              Identify the problem
            </button>
          )}
          {stage === "diagnosing" && (
            <button className="btn-hivis w-full text-lg" disabled>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              Looking at your photos…
            </button>
          )}
          {stage === "review" && (
            <button className="btn-primary w-full text-lg" onClick={save}>
              Save &amp; write my letter
            </button>
          )}
          {stage === "saving" && (
            <button className="btn-primary w-full text-lg" disabled>
              Saving evidence…
            </button>
          )}
        </div>
      </div>
    </>
  );
}
