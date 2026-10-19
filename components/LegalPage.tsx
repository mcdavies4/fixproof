import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 pb-16">
      <nav className="flex items-center justify-between py-4">
        <Logo />
        <Link href="/" className="text-sm font-semibold text-muted">
          Home
        </Link>
      </nav>
      <h1 className="mt-6 text-3xl font-black">{title}</h1>
      <p className="mt-1 font-mono text-xs text-muted">Last updated {SITE.updated}</p>
      <div className="legal mt-6 space-y-4 text-[15px] leading-relaxed [&_a]:font-semibold [&_a]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </main>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-muted">
      <p>
        Fixproof provides information and letter templates, not legal advice. For advice on your situation contact
        Shelter, Citizens Advice or a housing solicitor. Covers private tenancies in England only — the law differs in
        Scotland, Wales and Northern Ireland.
      </p>
      <p className="mt-3 flex gap-4 font-semibold">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href={`mailto:${SITE.contactEmail}`}>Contact</a>
      </p>
      <p className="mt-3">
        © {new Date().getFullYear()} {SITE.company}
        {SITE.companyNumber ? ` · Company no. ${SITE.companyNumber}` : ""}
      </p>
    </footer>
  );
}
