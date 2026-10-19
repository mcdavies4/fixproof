"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { mailto } from "@/lib/letters";
import { markChaseSent, markLetterSent } from "@/app/actions";

const METHODS = ["email", "post", "letting agent portal", "text message", "in person"];

export function LetterPanel({
  issueId,
  kind,
  subject,
  body,
  landlordEmail,
  alreadySent,
}: {
  issueId: string;
  kind: "repair" | "chase";
  subject: string;
  body: string;
  landlordEmail: string | null;
  alreadySent: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  const record = (method: string) =>
    start(async () => {
      if (kind === "repair") await markLetterSent(issueId, method);
      else await markChaseSent(issueId, method);
      setConfirm(false);
    });

  return (
    <section className="card overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-4 text-left">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted">
            {kind === "repair" ? "Your repair letter" : "Second notice"}
          </p>
          <p className="font-bold">{subject}</p>
        </div>
        <span className="text-2xl text-muted">{open ? "–" : "+"}</span>
      </button>

      {open && (
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap border-t border-line bg-paper/60 px-4 py-4 font-mono text-[13px] leading-relaxed">
          {body}
        </pre>
      )}

      <div className="grid grid-cols-3 gap-2 border-t border-line p-3">
        <a
          href={mailto(landlordEmail, subject, body)}
          onClick={() => !alreadySent && setTimeout(() => setConfirm(true), 800)}
          className="btn-primary px-2 text-sm"
        >
          Email
        </a>
        <button
          className="btn-ghost px-2 text-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(body);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
            if (!alreadySent) setConfirm(true);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <Link href={`/issues/${issueId}/letter?type=${kind}`} className="btn-ghost px-2 text-sm">
          PDF
        </Link>
      </div>

      {!alreadySent && !confirm && (
        <button onClick={() => setConfirm(true)} className="w-full border-t border-line py-3 text-sm font-bold underline">
          I&apos;ve already sent it
        </button>
      )}

      {confirm && !alreadySent && (
        <div className="border-t border-line bg-hivis/25 p-4">
          <p className="font-bold">Did it send? Log it as evidence.</p>
          <p className="text-sm text-muted">This starts the clock on your landlord&apos;s response.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                disabled={pending}
                onClick={() => record(m)}
                className="rounded-full border border-ink bg-white px-3 py-1.5 text-sm font-semibold capitalize"
              >
                {m}
              </button>
            ))}
            <button onClick={() => setConfirm(false)} className="px-2 text-sm text-muted">
              Not yet
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
