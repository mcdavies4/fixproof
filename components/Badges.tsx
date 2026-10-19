import { SEVERITY, type Severity } from "@/lib/legal";

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "Not sent yet", cls: "border-muted text-muted" },
  reported: { label: "Reported", cls: "border-ink text-ink" },
  in_progress: { label: "Landlord responded", cls: "border-ok text-ok" },
  escalated: { label: "Escalated", cls: "border-alert text-alert" },
  resolved: { label: "Fixed", cls: "border-ok text-ok" },
};

export function StatusStamp({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.draft;
  return <span className={`stamp ${s.cls}`}>{s.label}</span>;
}

export function SeverityPill({ severity }: { severity: string }) {
  const s = SEVERITY[severity as Severity] ?? SEVERITY.routine;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.tone}`}>{s.label}</span>;
}
