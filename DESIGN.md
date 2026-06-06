---
name: SIKAWAL
description: Alat kerja internal untuk kendali koreksi, snapshot, versi, dan audit naskah BPS.
colors:
  primary: "#0b56ad"
  ink: "#181c25"
  canvas: "#f9f9fb"
  surface: "#ffffff"
  secondary: "#ebf5f1"
  secondary-ink: "#254138"
  muted: "#f3f4f6"
  muted-ink: "#616875"
  destructive: "#c32222"
  border: "#d7dae0"
  input-border: "#d1d4dc"
  status-draft: "#64748b"
  status-waiting-general: "#f59e0b"
  status-needs-revision: "#f43f5e"
  status-waiting-head: "#0ea5e9"
  status-approved: "#10b981"
  status-final: "#22c55e"
  status-canceled: "#a1a1aa"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  pill: "9999px"
spacing:
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  status-badge:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: SIKAWAL

## 1. Overview

**Creative North Star: "The Control Desk"**

SIKAWAL is the desk a clerk sits at to keep every letter moving: one glance tells you what each document is, who it's waiting on, and what to do next. The interface is the control surface for an evidence trail, not a showcase. Every screen earns its place by answering a status question faster than asking a colleague would. Calm, ordered, and trustworthy: the feeling of a well-kept registry where nothing is lost and every action leaves a mark.

The system speaks in a quiet institutional voice. A single deep civic blue (#0b56ad) carries authority and is spent sparingly, on the actions and states that matter. Everything else is near-white canvas, white cards, soft borders, and ink-dark text tuned for legibility under bright office lighting. Hierarchy comes from weight and scale, not decoration. Depth is mostly flat: hairline borders and a whisper of shadow separate surfaces, never a stack of drop shadows competing for attention.

This system explicitly rejects the four things SIKAWAL's users have seen fail them: the **jadul government app** (cramped, gray, dense tables with no hierarchy, generic gray buttons), the **playful startup** (loud colors, emoji, cute illustration, flashy gradients), the **boring gray corporate template** (characterless blue-gray sameness), and the **overdesigned interface** (too many cards, shadows, and animations smothering the work). Refined and restrained beats decorated every time.

**Key Characteristics:**
- One civic blue, spent sparingly; tonal soft-color badges carry workflow status.
- Near-white canvas, white cards, hairline borders; flat by default.
- Hierarchy through weight + scale, not ornament.
- Legibility-first: tuned for non-technical staff under bright light, WCAG AA.
- Status is always one glance away; the timeline is the proof.

## 2. Colors

A restrained civic palette: one deep blue of authority over warm-neutral paper, with a soft teal-tinted secondary and a disciplined family of status tones.

### Primary
- **Civic Blue** (#0b56ad): The single voice of authority. Primary buttons, active navigation, focus rings, eyebrow labels, and key links. It also doubles as the focus `ring` token. Used on a small fraction of any screen; its scarcity is what makes it read as "important", not "decorative".

### Secondary
- **Sage Mist** (#ebf5f1): A soft teal-green tint for secondary buttons and quiet affordances (the "Keluar" action, neutral counters). Its deep partner **Pine Ink** (#254138) carries text on sage surfaces.

### Neutral
- **Ink** (#181c25): Primary text. A near-black with a faint cool-blue cast, never pure #000.
- **Paper** (#f9f9fb): The app canvas. An almost-white with the faintest blue breath, not warm cream.
- **Surface** (#ffffff): Pure white for cards and raised content, so cards lift gently off Paper without a shadow.
- **Muted** (#f3f4f6): Quiet fill for table headers, inset panels, badges, and progress tracks.
- **Muted Ink** (#616875): Secondary and helper text. Verified at ≥4.5:1 on Paper/Surface; this is the lightest gray permitted for readable text.
- **Border** (#d7dae0) / **Input Border** (#d1d4dc): Hairline separation and field strokes. Borders do the work shadows would in a heavier system.

### Status (workflow tones)
Each document status owns one hue, used two ways: a soft badge (tinted background + dark ink) and a solid bar fill for the distribution chart.
- **Draft** — Slate (#64748b): not yet submitted.
- **Menunggu Kasubbag Umum** — Amber (#f59e0b): waiting on first reviewer.
- **Perlu Revisi Pegawai** — Rose (#f43f5e): bounced back to the author.
- **Menunggu Kepala BPS** — Sky (#0ea5e9): waiting on final reviewer.
- **Disetujui Internal** — Emerald (#10b981): cleared, ready to finalize.
- **Final** — Green (#22c55e): locked terminal state.
- **Dibatalkan** — Zinc (#a1a1aa): canceled terminal state.

### Named Rules
**The One Voice Rule.** Civic Blue appears on ≤10% of any screen: one primary action, the active nav item, focus rings. If two blue buttons compete on a screen, one is wrong.

**The Status-Hue Rule.** A status color is *only* ever a status. Never use amber, rose, sky, emerald, green, or zinc decoratively; if it's colored like a status, it must mean that status.

**The No-Warm-Cream Rule.** The canvas is cool near-white (#f9f9fb), never beige/sand/cream. Warmth is not this brand; institutional calm is.

## 3. Typography

**Display Font:** System UI sans (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …`)
**Body Font:** Same system UI sans.
**Label/Mono Font:** None distinct; labels are the body family at small size + medium weight.

**Character:** One trustworthy system sans, no webfont. Hierarchy is built entirely from weight and scale contrast, which keeps the app fast (zero font payload) and native-feeling on government Windows machines. Restraint as a feature: one family, clearly stepped.

### Hierarchy
- **Display** (600, clamp(1.875rem → 2.25rem)/1.1, -0.02em): Public/marketing hero headings only (login, landing). `text-wrap: balance`.
- **Headline** (600, 1.5rem/1.2, -0.02em): In-app page titles ("Ringkasan kerja", "Daftar Dokumen").
- **Title** (600, 1.125rem/1.4): Section and card headings.
- **Body** (400, 0.875rem/1.5): Default running text and table cells. Secondary text uses Muted Ink. Cap measure at 65–75ch.
- **Label** (500, 0.75rem, 0.04em): Eyebrows (Civic Blue), field labels, table headers (uppercase), and metadata. Uppercase reserved for ≤4-word labels only.

### Named Rules
**The Weight-Not-Family Rule.** Need emphasis? Change weight or size, never add a typeface. The cap is one family.

**The 14px Floor Rule.** Body text never drops below 0.875rem (14px); 0.75rem is for labels and metadata only, never sentences.

## 4. Elevation

Flat by default. Surfaces separate through a hairline border (#d7dae0) plus the tonal step from Paper (#f9f9fb) canvas to white (#ffffff) cards. A single soft ambient shadow (`shadow-sm`) is the only shadow in the system, used as a gentle lift on cards and the active nav pill, never stacked or darkened for "depth".

### Shadow Vocabulary
- **Ambient lift** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): The one permitted shadow. Cards, the active navigation item, and primary buttons at rest.

### Named Rules
**The Flat-By-Default Rule.** Depth is carried by border + tonal contrast. If a surface needs more than `shadow-sm` to feel separated, the layout is wrong, not the shadow. No nested cards, ever.

## 5. Components

Refined and restrained: every component is border-led, calm at rest, and reacts with a quiet state change, not a flourish.

### Buttons
- **Shape:** Gently rounded (6px, `rounded-md`). Height 40px default (`h-10`), 36px small (`h-9`), 44px large (`h-11`).
- **Primary:** Civic Blue fill (#0b56ad), white text, padding 8px 16px. Hover darkens to ~90% opacity of blue. The one loud element per screen.
- **Secondary:** Sage Mist fill (#ebf5f1) with Pine Ink text; for low-stakes actions (logout, neutral confirms).
- **Outline:** White surface, Ink text, Border stroke; hover fills Muted. The default for "Detail / Unduh / Docs" row actions.
- **Ghost:** Transparent, Ink text, hover fills Muted; for back/quiet navigation.
- **Hover / Focus:** `transition-colors` only. Focus shows a 2px Civic Blue ring via `:focus-visible` (keyboard only), never on mouse click.

### Chips / Badges
- **Status Badge:** Soft tonal background + matching dark ink per the Status palette (e.g. Sky-50 fill / Sky-800 text for "Menunggu Kepala BPS"). Rounded 6px, padding 4px 10px, 0.75rem medium. Unknown statuses fall back to Muted.
- **Counters:** Civic Blue tint (`primary/10`) or Sage Mist for "N dokumen / N tugas" pills.

### Cards / Containers
- **Corner Style:** 8px (`rounded-lg`).
- **Background:** White (#ffffff) on Paper canvas.
- **Shadow Strategy:** `shadow-sm` ambient lift only (see Elevation).
- **Border:** Hairline #d7dae0.
- **Internal Padding:** 20–24px (`p-5`/`p-6`). Inset sub-panels use Muted at reduced opacity.

### Inputs / Fields
- **Style:** 40px tall, 6px radius, hairline Input Border, Paper-tinted background that resolves to white on focus. Consistent across Input, Textarea (min 96px, vertical resize), and Select.
- **Focus:** 2px Civic Blue ring via `:focus-visible`.
- **Error:** Field message uses the `destructive` token (#c32222) on a 5%-tint background with a 30%-tint border; `aria-invalid` set. Success messages use Emerald.
- **File picker:** Native input is visually hidden; a bordered "Pilih file" button (upload icon) plus the chosen filename. Keyboard focus rings the button via `peer-focus-visible`.

### Navigation
- **Style:** Left sidebar on `lg+`, horizontal scroll bar on mobile. Items are 6px-radius rows, 0.875rem medium.
- **States:** Active = Civic Blue fill, white text, `shadow-sm`. Inactive = Muted Ink, hover fills Muted and darkens to Ink. `aria-current="page"` on the active route.
- **Skip link:** "Lewati ke konten" is visually hidden until focused, then a Civic Blue pill jumping to `#main-content`.

### Distribution Bar (signature)
A labeled row (icon + name + helper) with a count and a thin 8px-radius track (`bg-muted`) whose fill width is the count as a share of the total, colored by that status's solid tone. Proportional, never maxed-to-equal.

## 6. Do's and Don'ts

### Do:
- **Do** spend Civic Blue (#0b56ad) sparingly: one primary action, active nav, focus rings (The One Voice Rule).
- **Do** carry workflow meaning only through the seven status hues, used as soft badge + solid bar.
- **Do** separate surfaces with hairline borders + Paper→white tonal step; reach for `shadow-sm` only as a whisper.
- **Do** build hierarchy from weight and scale in one system font; keep body ≥14px and measure ≤75ch.
- **Do** ring focus with `:focus-visible` and give every animation a `prefers-reduced-motion` path (WCAG AA is the target).
- **Do** keep Muted Ink (#616875) as the lightest readable gray; bump toward Ink if contrast is even close to 4.5:1.

### Don't:
- **Don't** look like a **jadul government app**: no cramped gray tables without hierarchy, no generic gray buttons, no 2010s density.
- **Don't** look like a **playful startup**: no loud/neon colors, no emoji, no cute illustration, no flashy gradients.
- **Don't** look like a **boring gray corporate template**: no characterless blue-gray sameness; the civic blue + status system is the character.
- **Don't** **overdesign**: no nested cards, no stacked drop shadows, no decorative animation, no card for everything.
- **Don't** use a warm cream/sand/beige canvas; the surface is cool near-white (#f9f9fb).
- **Don't** use a status hue decoratively, or introduce a second typeface, or drop sentence text below 14px.
- **Don't** use `border-left`/`border-right` >1px as a colored accent stripe, or `background-clip: text` gradient text.
