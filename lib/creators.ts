// Creator short links: fixproof.co.uk/<handle> → homepage, credited to that creator.
// To add a creator: add their handle (lowercase, letters/numbers/-/_), commit, push. Live in ~1 minute.
// Unknown handles 404, so typos don't pollute your stats.
export const CREATORS: string[] = [
  // "amara",
  // "rentingwithjay",
];

// Never usable as handles — these are real pages.
const RESERVED = new Set(["login", "issues", "settings", "admin", "privacy", "terms", "auth", "api", "direct"]);

export function creatorFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/([a-z0-9_-]{2,40})\/?$/i);
  if (!m) return null;
  const handle = m[1].toLowerCase();
  if (RESERVED.has(handle)) return null;
  return CREATORS.includes(handle) ? handle : null;
}
