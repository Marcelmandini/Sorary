# SORARY — status

_Last updated: 29 October 2026 · Phase 2 of 7_

## Phase 2: auth, artist onboarding, profile — built, final check in progress

### What works
- **Supabase connected:** project `zonkbijetabcwyvutfvl` ("Sorary Gallery"). Settings are in `.env.local`, which is not committed; `.env.example` shows the variables.
- **Sign-in by email link** (`/login`): no passwords, and the same link creates an account for new people. The link works in any browser or device (implicit flow, finished on `/auth/complete`). `/auth/callback` also accepts the standard `code` and `token_hash` links. Sign out is a POST to `/auth/signout`.
- **Session refresh** in `src/proxy.ts` (Next 16 renamed `middleware` to `proxy`).
- **Artist onboarding** (`/studio/onboarding`): name, profile address (filled in from the name, checked live, permanent), city, country, medium, year of birth and a one-line statement.
- **Studio profile** (`/studio/profile`): edit everything, plus biography, website, Instagram and a "Listed" switch. The studio menu shows Works, Inquiries and Analytics as "Soon".
- **Public artist page** (`/artists/[slug]`): profile, "New on SORARY" in the Momentum panel, Works and Available counts, works, About. A hidden profile is visible only to its owner, with a note.
- **For artists page** (`/sell`): plans and a "What the buyer pays" table calculated from `src/config/fees.ts`.
- **Header:** "For artists" becomes "Studio" once you have a profile.
- **Database** (`supabase/migrations/0001_artists.sql`, `0002_explicit_grants.sql`), already applied to the project:
  - `artists` table with RLS: anyone reads listed profiles; only the owner creates, edits or deletes their own.
  - The profile address cannot change. The database rejects bad data (length, medium, address format, reserved words).
  - `slug_available()` checks addresses, including hidden profiles. `admins` table plus `is_admin()`; the public API cannot read the table.
- **Permission tests:** `supabase/tests/rls_artists.sql` passed in the project ("All artist permission tests passed"). It runs in a transaction that is rolled back.
- **Tests (Vitest), 26 passing:** fees, SEK formatting, filters, profile validation, address rules (including that the reserved list matches the SQL), safe redirects.
- **Checked:** typecheck and production build pass. Login, For artists and artist pages checked at 375px with no horizontal scroll. Sign-in confirmed working end to end (in Edge).

### Still to confirm
- Creating the first real artist profile (Marcel, `marcel-mandini`), then the studio profile page at desktop and 375px. Paused: Supabase's built-in email limit was reached.

### Known limits
- **Email limit:** Supabase's built-in email only sends a few sign-in emails per hour, and its templates cannot be edited. Both go away with custom SMTP (Resend, phase 7, or earlier if needed). When that happens, switch sign-in back to the token-hash link in the templates.
- **Works are still sample data:** the 11 works in `src/data/sample.ts` appear on the page of whoever owns the address `marcel-mandini`. They move to the database in phase 3.
- **Account deletion** (GDPR) is not built yet. It needs a server-only secret key; planned before launch.

## Phase 1: project setup, design system, layout, static pages — done (commit d921a63)
- Next.js 16.4 (App Router) + TypeScript (strict) + Tailwind CSS 4.3. No component library.
- Design system in `src/app/globals.css`: colour tokens, Jost and DM Mono through `next/font`, buttons, form fields, chips, swatches, masonry. Square corners, no shadows or gradients, fades only, respects `prefers-reduced-motion`.
- Logo inlined from `brand/logo.svg`. Sticky header with a full-screen mobile menu, and a footer.
- Home and Artworks pages with sample works; Artworks filters for medium, availability, price, style, subject and colour.
- Fees in `src/config/fees.ts`; SEK formatting `SEK 24 000`.

## How to run it
Node.js and Git are not installed system-wide on this computer. Portable copies are in
`%LOCALAPPDATA%\Programs\sorary-tools` (Node 24.22.2 LTS, MinGit 2.56). In PowerShell:

```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\sorary-tools\node-v24.22.2-win-x64;$env:LOCALAPPDATA\Programs\sorary-tools\git\cmd;$env:Path"
npm run dev        # http://localhost:3000
npm test
npm run build
```

## Supabase settings in use
- Auth → URL Configuration: Site URL `http://localhost:3000`; Redirect URLs `http://localhost:3000/**`. Add the Netlify address here when the app is deployed.
- New database changes go in `supabase/migrations/` as numbered files and are run in the SQL Editor.

## Needs external setup (later phases)
- **GitHub:** create an empty repository and push.
- **Netlify:** a new site for this repo, with environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_SITE_URL`. Do not replace sorary.se until the platform is tested.
- **Stripe** (phase 5): Connect in test mode, webhook secret.
- **Resend** (phase 7): domain verification for sorary.se, then custom SMTP in Supabase.

## Not built yet
- Works upload, the works database, artwork pages and URL filters (phase 3). Artwork cards already link to `/artworks/[artist]/[work]`.
- Artists list, Momentum, Following, Buyer protection, About, Privacy and Terms pages. Their links lead to "Nothing here yet".
- Follow, save and inquiries (phase 4), checkout and payouts (phase 5), activity and Momentum (phase 6), Lift, admin, emails and legal pages (phase 7).
- Account and data deletion.
