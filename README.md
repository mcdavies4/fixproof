# Fixproof

Snap a problem in your rented home → get a formal repair letter → keep timestamped proof.
For private renters in England.

**Stack:** Next.js 16 (App Router) · Supabase (auth, Postgres, storage) · Claude vision · Tailwind v4

## Setup (about 10 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates the tables, row-level security, server-side timestamps and the private `evidence` bucket.
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (change to your live domain later)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`
4. **Authentication → Email Templates → Magic Link**: make sure the template includes `{{ .Token }}`
   so people get a 6-digit code as well as the link (the code works on phones where the link opens in another browser). Example body:
   ```
   <h2>Your Fixproof sign-in</h2>
   <p>Your code: <b>{{ .Token }}</b></p>
   <p>Or <a href="{{ .ConfirmationURL }}">tap here to sign in</a>.</p>
   ```

### 2. Env
```powershell
copy .env.example .env.local
```
Fill in the Supabase URL + anon key (Project Settings → API) and your Anthropic API key.

### 3. Run
```powershell
npm install
npm run dev
```
Open http://localhost:3000 on your phone (same Wi-Fi: `http://YOUR-LAPTOP-IP:3000`) to test the camera.

### 4. Push to GitHub & deploy
```powershell
git init
git add .
git commit -m "Fixproof MVP"
gh repo create mcdavies4/fixproof --private --source=. --push
```
Then import the repo in Vercel and add the same env vars (set `NEXT_PUBLIC_SITE_URL` to your live URL).

## How it works

| Flow | Where |
|---|---|
| Photo → AI diagnosis (category, severity, observations, safety tips) | `app/issues/new`, `app/api/diagnose` |
| Legal references attached **deterministically** by category — the AI never writes law | `lib/legal.ts` |
| Repair letter + second notice | `lib/letters.ts` |
| Email / copy / PDF, then "log how you sent it" starts the response clock | `components/LetterPanel.tsx` |
| Append-only evidence log, server timestamps, no edits/backdating (enforced in Postgres) | `supabase/schema.sql` |
| Escalation steps once the deadline passes | `components/EscalatePanel.tsx` |
| Printable evidence pack for the council | `app/issues/[id]/report` |

Response windows by severity: emergency 24h · urgent 7 days · routine 14 days · cosmetic 28 days (`lib/legal.ts`).

## Before launch
- [ ] Have a housing solicitor review `lib/legal.ts` and the letter templates in `lib/letters.ts`.
- [ ] Add privacy policy + terms pages (you store photos of people's homes).
- [ ] Rate-limit `/api/diagnose` per user (e.g. 20/day) to cap AI cost.
- [ ] When Awaab's Law regulations for private landlords are published, add damp/mould timescales to `lib/legal.ts`.

## Next features (in order)
1. Unique tracked share links per creator (influencer test).
2. Paid escalation pack (£4.99): council complaint letter pre-filled from the evidence log.
3. Deposit-dispute pack: move-in/move-out photo comparison.
4. Reminder emails when the landlord's deadline passes.
