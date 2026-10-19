"use client";

import { useState, useTransition } from "react";
import { markEscalated } from "@/app/actions";

export function EscalatePanel({ issueId, overdue, escalated }: { issueId: string; overdue: number; escalated: boolean }) {
  const [pending, start] = useTransition();
  const [ref, setRef] = useState("");

  return (
    <section className="rounded-2xl border-2 border-alert bg-white p-4">
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-alert">
        {overdue} day{overdue === 1 ? "" : "s"} past your deadline
      </p>
      <h3 className="mt-1 text-xl font-black">Next steps</h3>
      <ol className="mt-3 list-decimal space-y-3 pl-5 text-[15px]">
        <li>
          <b>Send the second notice below.</b> It gives 7 more days and says you&apos;ll contact the council.
        </li>
        <li>
          <b>Contact your council&apos;s environmental health (private housing) team.</b> They can inspect for hazards
          and order your landlord to make repairs.{" "}
          <a
            className="font-semibold underline"
            href="https://www.gov.uk/find-local-council"
            target="_blank"
            rel="noreferrer"
          >
            Find your council
          </a>
          . Share your evidence pack.
        </li>
        <li>
          <b>Get free advice</b> from{" "}
          <a className="font-semibold underline" href="https://england.shelter.org.uk/get_help" target="_blank" rel="noreferrer">
            Shelter
          </a>{" "}
          or{" "}
          <a className="font-semibold underline" href="https://www.citizensadvice.org.uk/housing/" target="_blank" rel="noreferrer">
            Citizens Advice
          </a>{" "}
          before taking court action.
        </li>
      </ol>
      <p className="mt-3 text-xs text-muted">
        Don&apos;t stop paying rent — that can put your tenancy at risk even when repairs are outstanding.
      </p>
      {!escalated && (
        <div className="mt-4 flex gap-2">
          <input className="field text-sm" placeholder="Council case ref (optional)" value={ref} onChange={(e) => setRef(e.target.value)} />
          <button
            disabled={pending}
            className="btn-primary shrink-0 px-4 text-sm"
            onClick={() =>
              start(() =>
                markEscalated(
                  issueId,
                  ref.trim()
                    ? `Reported to council environmental health. Case ref: ${ref.trim()}`
                    : "Reported to council environmental health."
                )
              )
            }
          >
            Log council report
          </button>
        </div>
      )}
    </section>
  );
}
