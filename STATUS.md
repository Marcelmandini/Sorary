# SORARY — status

_Last updated: 29 October 2026 · Phase 3 of 7 · Launch plan: artists first, payments later_

## Launch preparation (while the sorary.se email domain is being verified in Resend)
- **Privacy Policy** (`/privacy`) and **Terms of Service** (`/terms`): written to match what the platform actually does, marked "Draft · to be reviewed before launch". Fill in the company's legal name and organisation number in `LEGAL` in `src/config/site.ts`. Update both before messages and purchases open.
- **Buyer protection** (`/buyer-protection`) and **About** (`/about`) pages. Fee figures come from `src/config/fees.ts`.
- **Netlify:** `netlify.toml` (Node 24, `npm run build`) and `.nvmrc`. Security headers set in `next.config.ts`.
- **Waiting on:** Resend domain verification for sorary.se (24–48 h), then SMTP in Supabase and a higher email limit. A GitHub repository, then a new Netlify site for this repo.

## Phase 3: works upload, Artworks from the database, artwork page — done (commit 450cf47)

### What works
- **Database:** `supabase/migrations/0003_works.sql` (applied). `works` table with RLS: published works by listed artists are public; drafts are visible only to their artist; artists edit only their own; `lift_until` cannot be set through the API. The `artworks` storage bucket (public read, WebP/JPEG only, max 6 MB per file); artists can write only to their own folder.
- **Permission tests:** `supabase/tests/rls_works.sql` passed in the project ("All works permission tests passed"), rolled back.
- **Upload** (`/studio/works`): drop or choose JPG/PNG/WebP up to 25 MB. The browser resizes to WebP (2400px and 900px) and detects the colours, so the original never leaves the artist's computer and GPS data is stripped. Each upload becomes a draft.
- **Edit listing:** title, year, category, medium, dimensions, price ("You receive X. Buyer pays Y"), availability, styles (several), subject, alt text, description, Published switch, remove listing. A work for sale needs a price before it can be published.
- **Artworks** (`/artworks`) and **home** read published works from Supabase. Filters are saved in the address (`/artworks?style=Abstract&colour=blue`). Honest empty states when nothing is published yet.
- **Artwork page** (`/artworks/[artist]/[work]`): large image with a full-screen view, details, links from category, style, subject and colour into filtered Artworks, price, buyer protection and total, previous/next work. "Buy now" is shown but disabled: "Purchases with buyer protection open soon." Drafts show a note to their owner only.
- **Artist page** shows the artist's published works.
- **Sample works** only when `SHOW_SAMPLE_WORKS=true` (set in `.env.local` for development, unset in production). They are marked "Sample listing for development. Not for sale."
- **Tests:** 39 passing (adds work form, price parsing, colour detection, URL filters). Typecheck and build pass. Artwork page checked at 1280px and 375px.

### Not yet confirmed
- The upload flow by a signed-in artist, end to end in the browser. The database and storage rules are tested; the browser flow waits for the first artist sign-in (email limit, see below).

## Phase 2: auth, artist onboarding, profile — done (commit 6d036a3)

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
- **Before taking in artists:** custom email (Resend SMTP in Supabase), deploy to Netlify, legal review of the Privacy Policy and Terms.
- Reordering works in the studio, editing the detected colours, an artists list page.
- Artists list, Momentum and Following pages. Their links lead to "Nothing here yet".
- Follow, save and inquiries (phase 4), checkout and payouts (phase 5), activity and Momentum (phase 6), Lift, admin, emails and legal pages (phase 7).
- Account and data deletion.
