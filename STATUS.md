# SORARY — status

_Last updated: 29 October 2026 · Phase 1 of 7_

## Phase 1: project setup, design system, layout, static pages — built, waiting for review

### What works
- **Project:** Next.js 16.4 (App Router) + TypeScript (strict) + Tailwind CSS 4.3. No component library.
- **Design system** (`src/app/globals.css`):
  - Colour tokens from CLAUDE.md as Tailwind colours: `bg`, `fg`, `muted`, `line`, `surface`, `hover`, `error`, `up`, `down`, `sold`.
  - Fonts: Jost 200/300/400 and DM Mono 300/400, served from the app through `next/font` (no request to Google from visitors' browsers).
  - Building blocks: `.btn` / `.btn-outline` / `.btn-sm`, `.link`, `.textbtn`, `.field` + `.in` (text, select, textarea), `.check`, `.chip`, `.swatch`, `.eyebrow` / `.lbl`, `.mono`, `.delta-up` / `.delta-down`, `.sponsored`, `.demo-tag`, `.masonry`.
  - Square corners, no shadows, no gradients. Motion is gentle fades only and switches off with `prefers-reduced-motion`.
- **Logo:** read from `brand/logo.svg` on the server and inlined, so it takes the text colour. Never redrawn in a font.
- **Header:** sticky, Discover / Artworks / Artists / Momentum | Following / For artists, with the current page underlined. Below 1000px it becomes a full-screen menu (Escape closes it, focus returns to the Menu button).
- **Footer:** logo, links, support email with a Copy button, and "Showing genuine platform activity only."
- **Home (`/`):** hero with a featured work, Momentum strip, Trending, Featured by artists (shown only when a Lift is active), New to SORARY, New artists, For artists.
- **Artworks (`/artworks`):** masonry grid with working filters for medium, availability, price, style (several at once), subject and colour (11 swatches), plus sort. On phones the secondary filters fold behind a "Filters" button.
- **Fees in one place:** `src/config/fees.ts` (0% from artists, buyer protection 5% + 99 kr, Lift 49 kr / 7 days, Pro 79 kr/month, payout 2 days after delivery).
- **SEK formatting:** `SEK 24 000` (`src/lib/format.ts`).
- **Tests (Vitest), 14 passing:** fees, totals and artist payout; SEK formatting; filters.
- **Checked:** `npm test`, `npx tsc --noEmit` and `npm run build` all pass. Checked in the browser at 1280px desktop and 375px mobile, with no horizontal scroll on either page.

### Sample data
- `src/data/sample.ts` holds 11 real works by Marcel Mandini, taken from the prototype, with images in `public/art/`. They are real works with real prices, so they carry no "Demo" label.
- No activity numbers are invented. Momentum, Trending and views show honest empty states ("appears once there is genuine activity") until phase 6.
- "Emerging" on the home page is shown as **New artists** (recently joined) until Momentum exists.

### How to run it
Node.js and Git are not installed system-wide on this computer. Portable copies are in
`%LOCALAPPDATA%\Programs\sorary-tools` (Node 24.22.2 LTS, MinGit 2.56). In PowerShell:

```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\sorary-tools\node-v24.22.2-win-x64;$env:LOCALAPPDATA\Programs\sorary-tools\git\cmd;$env:Path"
npm run dev        # http://localhost:3000
npm test
npm run build
```

Installing Node.js LTS from nodejs.org and Git for Windows normally makes the first line unnecessary.

## Needs external setup (later phases)
- **GitHub:** create an empty repository and push. Phase 1 is committed locally on `main`.
- **Netlify:** connect the GitHub repo. Build command `npm run build`. The Next.js runtime is detected automatically. Do not replace sorary.se until the platform is tested.
- **Supabase** (phase 2): project in eu-north-1, Auth, Storage.
- **Stripe** (phase 5): Connect in test mode, webhook secret.
- **Resend** (phase 7): domain verification for sorary.se.

## Not built yet
- Artist, Momentum, Following, For artists, Buyer protection, About, Privacy and Terms pages. Their links lead to the "Nothing here yet" page.
- Artwork detail pages (`/artworks/[artist]/[work]`) and artist profiles (`/artists/[slug]`). Cards already link to these addresses.
- Filters saved in the URL, and automatic colour detection on upload (phase 3).
- Save and follow (phase 4), checkout (phase 5), activity and Momentum (phase 6), Lift, admin, emails and legal pages (phase 7).
- Auth, database, uploads and payments.
