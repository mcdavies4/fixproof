import Link from "next/link";
import { loadIssue } from "@/lib/load";
import { repairLetter, chaseLetter } from "@/lib/letters";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function LetterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;
  const { issue, profile } = await loadIssue(id);
  const letter = type === "chase" ? chaseLetter(issue, profile) : repairLetter(issue, profile);

  return (
    <main className="mx-auto max-w-2xl bg-white px-6 py-8 print:p-0">
      <div className="no-print mb-6 space-y-3">
        <PrintButton />
        <Link href={`/issues/${id}`} className="block text-center text-sm font-semibold text-muted underline">
          Back
        </Link>
        <p className="text-center text-xs text-muted">Tip: choose &ldquo;Save as PDF&rdquo; as the printer on your phone.</p>
      </div>
      <article className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-black">{letter.body}</article>
    </main>
  );
}
