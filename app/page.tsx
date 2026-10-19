import Link from "next/link";
import { Logo } from "@/components/Logo";

const steps = [
  { n: "01", t: "Snap it", d: "Take a photo of the mould, leak, broken boiler or dead smoke alarm." },
  { n: "02", t: "Get the letter", d: "Fixproof identifies the problem and writes a formal repair request citing your rights." },
  { n: "03", t: "Keep the proof", d: "Every report, photo and reply is timestamped. If they stall, you're ready to escalate." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 pb-16">
      <nav className="flex items-center justify-between py-4">
        <Logo />
        <Link href="/login" className="text-sm font-bold underline underline-offset-4">
          Sign in
        </Link>
      </nav>

      <section className="pt-8">
        <span className="stamp border-alert text-alert">Landlord ignoring you?</span>
        <h1 className="mt-4 text-[44px] font-black leading-[0.95] tracking-tight sm:text-6xl">
          Photo in.
          <br />
          Repair letter out.
          <br />
          <span className="bg-hivis px-1">Proof kept.</span>
        </h1>
        <p className="mt-5 text-lg text-muted">
          Fixproof turns a photo of a problem in your rented home into a formal repair request in seconds, then keeps a
          timestamped record so &ldquo;I never got your message&rdquo; stops working.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className="btn-primary">
            Report a problem — free
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted">For private renters in England. Takes about a minute.</p>
      </section>

      <section className="mt-14 space-y-3">
        {steps.map((s) => (
          <div key={s.n} className="card flex gap-4 p-5">
            <span className="font-mono text-sm font-semibold text-muted">{s.n}</span>
            <div>
              <h3 className="text-lg font-extrabold">{s.t}</h3>
              <p className="text-muted">{s.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <span className="font-mono text-xs text-muted">REPAIR REQUEST · PREVIEW</span>
          <span className="stamp border-ok text-ok">Logged 09:42</span>
        </div>
        <div className="space-y-3 px-5 py-5 font-mono text-[13px] leading-relaxed">
          <p>Re: Repair request: Black mould on bedroom ceiling</p>
          <p>I am writing to formally report a disrepair at the property I rent from you&hellip;</p>
          <p className="text-muted">
            &hellip;the property must be fit for human habitation at the start of the tenancy and throughout it.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-black">What it covers</h2>
        <p className="mt-2 text-muted">
          Damp &amp; mould · heating &amp; hot water · leaks · electrics · gas · smoke &amp; CO alarms · structure ·
          windows &amp; doors · pests · toilets &amp; drains.
        </p>
      </section>

      <footer className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-muted">
        Fixproof provides information and letter templates, not legal advice. For advice on your situation contact
        Shelter, Citizens Advice or a housing solicitor. Covers private tenancies in England only — the law differs in
        Scotland, Wales and Northern Ireland.
      </footer>
    </main>
  );
}
