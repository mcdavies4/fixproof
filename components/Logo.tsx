import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-xl font-black tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-hivis text-ink">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      Fixproof
    </Link>
  );
}

export function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="no-print sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Logo href="/issues" />
        {right}
      </div>
    </header>
  );
}
