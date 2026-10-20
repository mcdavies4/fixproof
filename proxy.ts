import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { creatorFromPath } from "@/lib/creators";

const PROTECTED = ["/issues", "/settings", "/admin"];
const REF_COOKIE = "fp_ref";

export async function proxy(request: NextRequest) {
  // Creator short link: fixproof.co.uk/amara -> homepage, first-touch credit to "amara".
  const creator = creatorFromPath(request.nextUrl.pathname);
  if (creator) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    const res = NextResponse.redirect(url, 307);
    if (!request.cookies.get(REF_COOKIE)) {
      res.cookies.set(REF_COOKIE, creator, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", httpOnly: true });
    }
    return res;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return carryRef(request, NextResponse.redirect(url));
  }

  return carryRef(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};

/** First-touch creator tracking: ?ref=name sets a 30-day cookie unless one already exists. */
function carryRef(request: NextRequest, res: NextResponse) {
  const raw = request.nextUrl.searchParams.get("ref");
  if (!raw || request.cookies.get(REF_COOKIE)) return res;
  const ref = raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  if (ref) {
    res.cookies.set(REF_COOKIE, ref, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", httpOnly: true });
  }
  return res;
}
