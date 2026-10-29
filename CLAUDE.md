# SORARY — project guide for Claude Code

SORARY is a marketplace for original contemporary art. Artists list and sell original works for free. Collectors discover artists, follow them and buy with buyer protection. Artist Momentum shows which artists are gathering attention, calculated only from genuine activity.

The waitlist landing page is live at sorary.se (Netlify, see `reference/landing.html`). This repository builds the real platform that will replace it.

## Decisions already made (do not change without asking)

**Business model**
- Artists pay nothing to list or sell. 0% is taken from artists; they receive the full price.
- Buyers pay buyer protection on top of the price: **5% of the price + 99 kr**, shown before payment.
- Optional artist add-ons: **Lift** (49 kr for 7 days, shown first in Artworks and on the front page, always labelled "Sponsored", never affects Momentum) and **Pro** (79 kr/month, extra analytics; build later).
- Keep all fee values in one config module, never hardcoded in components.

**Payments**
- Stripe Connect (Express accounts for artists). The buyer pays SORARY; funds are released to the artist 2 days after delivery is confirmed, unless the buyer opens a claim.
- Never mark an order paid from the client. Payment state comes only from verified Stripe webhooks.
- Build and test everything in Stripe test mode first.

**Language and market**
- UI in English. Currency SEK, formatted Swedish style: `SEK 24 000`.
- Founded in Stockholm; do not make the product Stockholm-only.

## Stack
- Next.js (App Router) + TypeScript, deployed on Netlify (the account already exists).
- Supabase: Auth, Postgres with Row Level Security, Storage. Region: eu-north-1 (Stockholm).
- Stripe Connect + Stripe webhooks (route handlers).
- Email: Resend (welcome, inquiry and order emails). Support address: sorary.support@gmail.com.
- Tailwind CSS with the design tokens below. No component library styling visible to users.

## Design system (match `reference/prototype.html` and `reference/landing.html`)
- Luxury through restraint: white space, thin lines, no shadows, no gradients, no rounded pill buttons (radius 0–2px), almost no icons.
- Colours: bg `#FFFFFF`, text `#111111`, muted `#777777`, lines `#EAEAEA`, surface `#F8F8F6`, hover `#F4F4F2`, error `#8A2B2B`, up `#3F5A45`, down/sold `#A3352A`.
- Fonts (Google Fonts): **Jost** 200/300/400 for everything; **DM Mono** 300/400 for numbers, prices, indices and table figures.
- Labels: 10.5–11px uppercase, letter-spacing .24em, muted.
- Buttons: black fill with white uppercase tracked text, or 1px black outline.
- Artworks sit on the `surface` colour with generous padding, never cropped.
- Logo: always use `brand/logo.svg` (custom letterforms; never recreate it in a font).
- Mobile is designed, not shrunk. Must work at 375px with no horizontal scroll.
- Respect `prefers-reduced-motion`. Motion is limited to gentle fades.

## Core features (all present in the prototype)
1. **Discover (home):** featured work, Momentum ticker, trending artists, "Featured by artists" (Lift, labelled Sponsored), new works, emerging artists.
2. **Artworks:** grid with filters for medium (Painting, Sculpture, Photography, Works on paper), price, availability, **style** (Abstract, Figurative, Expressive, Minimalist; several allowed), **subject** (Landscape & sea, Figures & faces, Nature, Architecture, Form & object, Non-figurative) and **colour** (11 swatches, detected automatically from the image on upload and stored on the artwork).
3. **Artwork page:** large image with lightbox, details, style/subject/colour links into filtered views, price, Buy now, Ask a question, Save, buyer-protection note, engagement figures.
4. **Checkout:** price + buyer protection = total; shipping quoted by the artist; Stripe payment; order states: pending → paid → shipped → delivered → released (or claim).
5. **Artist profile:** follow, contact, Momentum panel with 90-day chart and rank (or "New on SORARY" until there is activity), works, bio.
6. **Artist Momentum:** platform activity chart, leaderboard with Leaders / Trending / Emerging tabs, sparklines, methodology text.
7. **Collector:** follow artists, save works, "Following" page.
8. **Artist studio:** onboarding, upload works (JPG/PNG/WebP ≤ 25 MB, resized to WebP), edit listings (price shows "You receive X, buyer pays Y"), Lift, profile, inquiries inbox, orders, payouts (Stripe Connect onboarding), analytics.
9. **Analytics for artists:** profile visits, artwork views, saves, new followers, inquiries; 30/90-day charts with hover; engagement per work. Only genuine data.
10. **Admin (owner only, server-side check):** artists, works, orders, GMV, fee revenue, Lift revenue, waitlist import.

## Artist Momentum (keep exactly)
- Daily activity = profile visits × 1 + artwork views × 0.5 + saves × 3 + new followers × 5 + inquiries × 8.
- Smooth with an exponential average, 10-day half-life.
- Index = artist score ÷ today's leader score × 100. 30-day change compares today with 30 days ago.
- Count visits and views once per visitor per day; never count an artist's own visits. Store daily aggregates, not individual browsing history.
- Lift/sponsorship must never influence Momentum.
- Momentum is attention on SORARY, not a valuation; say so on the page.

## Data and security rules
- RLS on every table. Artists edit only their own profile, works and orders. Public can read listed artists and works only.
- Inquiries and buyer contact details are visible only to the receiving artist (and admin for disputes).
- Admin access through an `admins` table checked server-side, never a hidden route alone.
- No secrets in client code; use environment variables. Validate uploads by type and size on the server too.
- GDPR: store data in the EU region, allow account and data deletion, keep a real privacy policy before launch.

## Demo data
- The prototype uses generated demo artists. In production, demo data must be either absent or clearly labelled "Demo" and switchable off. Never mix demo numbers into real analytics.

## How to work in this repo
- Build in phases and get each phase working end to end before the next:
  1. Project setup, design system, layout, logo, static pages.
  2. Auth + artist onboarding + profile.
  3. Works upload, listing, Artworks grid with all filters, artwork page.
  4. Follow / save / inquiries.
  5. Stripe Connect checkout, orders, buyer protection, payouts (test mode).
  6. Activity tracking, analytics, Artist Momentum.
  7. Lift, admin, emails, legal pages, launch checklist.
- Write tests for money logic (fees, totals, payouts), permissions and Momentum maths.
- Before saying a phase is done: run the tests, run the app, check desktop and 375px mobile.
- Keep a `STATUS.md` with what works, what needs external setup, and what is not built.
- Ask before adding paid services, changing fees, or changing the design direction.
