"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { compress, uploadShots, type Shot } from "@/lib/image";
import { addUpdate, markResolved } from "@/app/actions";

export function UpdateForm({ issueId, resolved }: { issueId: string; resolved: boolean }) {
  const [kind, setKind] = useState<"landlord_response" | "note">("landlord_response");
  const [note, setNote] = useState("");
  const [shots, setShots] = useState<Shot[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const added = await Promise.all(Array.from(files).slice(0, 4).map((f) => compress(f)));
    setShots((s) => [...s, ...added].slice(0, 4));
  }

  function submit() {
    setErr(null);
    start(async () => {
      try {
        let paths: string[] = [];
        if (shots.length) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) throw new Error("Signed out");
          paths = await uploadShots(supabase, user.id, issueId, shots);
        }
        await addUpdate(issueId, kind, note.trim(), paths);
        setNote("");
        setShots([]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Couldn't save");
      }
    });
  }

  return (
    <section className="card p-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">Add to the record</p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-paper p-1">
        {(
          [
            ["landlord_response", "Landlord replied"],
            ["note", "Update / photo"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-lg py-2 text-sm font-bold ${kind === k ? "bg-white shadow-sm" : "text-muted"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <textarea
        className="field mt-3 min-h-20"
        placeholder={
          kind === "landlord_response"
            ? "What did they say? e.g. 'Agent says a contractor will visit next Tuesday.'"
            : "e.g. Mould has spread to the wardrobe."
        }
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {shots.length > 0 && (
        <div className="mt-3 flex gap-2">
          {shots.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.preview} src={s.preview} alt="" className="h-16 w-16 rounded-lg object-cover" />
          ))}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <div className="mt-3 flex gap-2">
        <button className="btn-ghost flex-1 text-sm" onClick={() => fileRef.current?.click()}>
          + Photo
        </button>
        <button className="btn-primary flex-[2] text-sm" disabled={pending || (!note.trim() && !shots.length)} onClick={submit}>
          {pending ? "Saving…" : "Log it"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-alert">{err}</p>}
      {!resolved && (
        <button
          disabled={pending}
          onClick={() => confirm("Mark this repair as fixed?") && start(() => markResolved(issueId))}
          className="mt-4 w-full text-sm font-bold text-ok underline"
        >
          It&apos;s been fixed
        </button>
      )}
    </section>
  );
}
