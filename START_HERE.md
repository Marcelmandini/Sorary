# Kom igång med SORARY i Claude Code

Den här mappen är starten på den riktiga SORARY-plattformen.

- **CLAUDE.md** är projektbeskrivningen. Claude Code läser den automatiskt varje gång, och den innehåller allt vi bestämt: affärsmodell, design, funktioner, Momentum och säkerhet.
- **reference/prototype.html** är prototypen av marknadsplatsen. Öppna den i webbläsaren för att se hur allt ska se ut.
- **reference/landing.html** är väntelistsidan som ligger ute nu.
- **brand/** innehåller loggan och ikonerna.

## 1. Förbered (en gång)
1. Lägg den här mappen där du vill ha projektet, till exempel `Dokument\sorary-app`.
2. Installera **Git for Windows** från git-scm.com med standardinställningarna.
3. Skapa gratiskonton på **GitHub**, **Supabase** och **Stripe**. Netlify har du redan.

## 2. Öppna projektet i Claude Code
1. Öppna Claude-appen på datorn och klicka på fliken **Code** i sidomenyn.
2. Välj **Local** och sedan **Open folder…**, och välj den här mappen.
3. Ställ in läget på **Manual** eller **Accept edits** till en början, så att du ser vad Claude gör.

## 3. Klistra in den här första prompten

```
Read CLAUDE.md and look at reference/prototype.html and reference/landing.html.
Then start phase 1 only: set up the Next.js + TypeScript + Tailwind project in this folder,
the design system (colours, Jost and DM Mono, buttons, form fields), the header and footer
with brand/logo.svg, and static versions of the home page and the Artworks page using a few
sample works. Initialise git, run the app, and show me how to preview it. Create STATUS.md.
Ask me before installing anything that costs money.
```

## 4. Därefter, en fas i taget
När fas 1 ser bra ut skriver du till exempel:

> Phase 1 looks good. Commit it, then start phase 2 (Supabase auth and artist onboarding). Tell me what I need to set up in Supabase first.

Fortsätt så genom faserna i CLAUDE.md. Tips:
- **Granska innan du godkänner.** Klicka på `+12 -3` för att se ändringarna.
- **Var specifik när något är fel**, till exempel "på mobil hamnar Buy now-knappen under bilden, den ska ligga direkt under priset".
- **Be Claude att committa** efter varje fungerande steg, så kan du alltid gå tillbaka.
- **Koppla repot till GitHub och Netlify** när fas 1 är klar, så får varje ändring en förhandslänk innan den går live.
- **Byt inte ut väntelistsidan på sorary.se** förrän den nya plattformen är testad.
