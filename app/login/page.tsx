"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/issues";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setStage("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col px-4 py-6">
      <Logo />
      <div className="my-auto">
        {stage === "email" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <h1 className="text-3xl font-black">Sign in</h1>
            <p className="text-muted">No password. We&apos;ll email you a sign-in link and code.</p>
            <input
              className="field"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Sending…" : "Email me a code"}
            </button>
            <p className="text-center text-xs text-muted">
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline">terms</Link> and{" "}
              <Link href="/privacy" className="underline">privacy policy</Link>.
            </p>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <h1 className="text-3xl font-black">Check your email</h1>
            <p className="text-muted">
              Tap the link in the email sent to <b className="text-ink">{email}</b>, or type the code here.
            </p>
            <input
              className="field text-center font-mono text-2xl tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn-primary w-full" disabled={busy || code.trim().length < 6}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button type="button" className="w-full text-sm text-muted underline" onClick={() => setStage("email")}>
              Use a different email
            </button>
          </form>
        )}
        {error && <p className="mt-4 rounded-xl bg-alert/10 p-3 text-sm text-alert">{error}</p>}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
