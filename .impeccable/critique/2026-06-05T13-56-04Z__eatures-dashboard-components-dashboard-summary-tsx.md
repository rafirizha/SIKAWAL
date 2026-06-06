---
target: /dashboard
total_score: 32
p0_count: 0
p1_count: 0
timestamp: 2026-06-05T13-56-04Z
slug: eatures-dashboard-components-dashboard-summary-tsx
---
# Critique — /dashboard (DashboardSummary)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | The surface *is* status; counts, distribution, recent activity all visible. |
| 2 | Match System / Real World | 4 | Domain-accurate Indonesian (Menunggu Kasubbag Umum, Perlu Revisi Pegawai). |
| 3 | User Control and Freedom | 3 | Read-only overview; little to undo, adequate exits via nav. |
| 4 | Consistency and Standards | 4 | Shared StatusBadge/tokens post-overhaul; cohesive. |
| 5 | Error Prevention | 3 | No inputs/destructive actions on this surface. |
| 6 | Recognition Rather Than Recall | 4 | Labeled icons, named statuses, everything on screen. |
| 7 | Flexibility and Efficiency | 2 | No clickable metrics, no shortcuts; must go to Dokumen and filter manually. |
| 8 | Aesthetic and Minimalist Design | 3 | "Profil aktif" card is low-value filler in prime real estate. |
| 9 | Error Recovery | 3 | No error surfaces here; empty states are handled well. |
| 10 | Help and Documentation | 2 | No contextual help/onboarding; Panduan link was removed. |
| **Total** | | **32/40** | **Good** |

## Anti-Patterns Verdict

**LLM assessment:** Does NOT read as obvious AI slop. Avoids the saturated tells: no gradient text, no hero-metric gradient template, no identical-card-grid spam, no glassmorphism. Composition is calm and status-first, consistent with the "Control Desk" North Star. One mild reflex: small blue sentence-case eyebrows ("Dashboard", "Profil aktif") sit above multiple card titles — an eyebrow cadence, though not the banned uppercase-tracked kicker.

**Deterministic scan:** `detect.mjs` on `dashboard-summary.tsx` + `dashboard/page.tsx` returned `[]` (exit 0). No banned patterns (side-stripes, gradient text, etc.).

**Visual overlays:** Not injected (CLI detector is the authoritative deterministic source here; visual review done via desktop + mobile screenshots).

## Overall Impression

A genuinely good, on-brand dashboard. It answers "what's the state of the pipeline" cleanly. Its weakness is the gap between *seeing* status and *acting* on it: every number is a dead end, so a reviewer reads the dashboard then re-navigates and re-filters to actually do anything. The single biggest opportunity is turning the dashboard from a display into a launchpad.

## What's Working

1. **Status-first IA.** The whole surface is built around "where are things / who's waiting" — exactly the product's core job. Strong Visibility-of-System-Status.
2. **Consistency after the overhaul.** Shared `StatusBadge`, tokens, and clean weight/scale hierarchy; the detector is clean.
3. **Honest empty states + domain copy.** "Belum ada dokumen aktif…" and accurate role/stage language speak the user's world.

## Priority Issues

- **[P2] "Profil aktif" card is filler in prime real estate.** It repeats the role (already in the sidebar), "Fokus berikutnya: Cek Dokumen" is non-actionable, and "Status pipeline: 4 dokumen" duplicates the "Dokumen aktif" stat. **Why it matters:** prime top-right space carries near-zero new information, diluting the minimalist intent. **Fix:** replace with an actionable "Tugas menunggu kamu" block (docs awaiting THIS user + a CTA), or remove it and let distribution breathe. **Command:** /impeccable distill

- **[P2] Metrics and distribution rows are dead ends.** "Menunggu Kasubbag Umum: 1" can't be clicked to see that document; the user must open Dokumen and filter by hand. **Why it matters:** breaks the see→act loop the dashboard exists to serve; pure extra navigation cost. **Fix:** make each distribution row and the overview counts link to `/letters` pre-filtered by that status. **Command:** /impeccable layout

- **[P2] No efficiency path for repeat reviewers (Alex).** No keyboard shortcuts, no clickable jump-to-queue, no "act now" affordance. The dashboard is read-only. **Why it matters:** Kasubbag/Kepala use this daily; every visit costs the same manual navigation. **Fix:** clickable metrics (above) + a primary "Tinjau antrean (N)" action when tasks are waiting. **Command:** /impeccable layout

- **[P2] Help/onboarding gap for first-timers (Jordan).** The Panduan entry was removed, and the dashboard offers no first-run guidance for non-technical staff who don't know the workflow. **Why it matters:** a new Pegawai lands here with no cue about draft → koreksi → revisi → final. **Fix:** a dismissible first-run guide or an inline "Bagaimana alurnya?" affordance; strong empty-state CTAs. **Command:** /impeccable onboard

- **[P3] Eyebrow cadence.** Blue mini-labels above multiple card titles read as a mild AI scaffold. **Fix:** keep one as a deliberate brand device or drop them. **Command:** /impeccable typeset

- **[P3] Distribution bars are thin and low-contrast.** The proportional fill is hard to read at a glance; the number carries all the signal. **Fix:** thicken slightly or raise fill contrast; ensure the bar adds information, not just decoration. **Command:** /impeccable layout

## Persona Red Flags

**Alex (Power User):** Distribution rows and the "Dokumen aktif" count are not clickable; no keyboard shortcuts; no bulk/quick path. To act on "1 menunggu Kasubbag Umum" he must navigate to Dokumen and filter manually every time.

**Sam (Accessibility):** Mostly solid — status is conveyed by text label (not color alone), focus-visible rings exist, skip-link present. Verify Muted Ink (#616875) body text holds ≥4.5:1 on the `bg-muted/20` tinted panels, and that distribution-bar color is purely redundant to the number (it is) so color-blind users lose nothing.

**Pak Kasubbag (project persona — non-technical daily reviewer):** Opens the dashboard to learn "what needs MY action now," but the surface reports aggregate pipeline counts, not a personal task list. He still has to go to Dokumen to find the document waiting on him. The dashboard answers "state of the pipeline" better than "what do I do next."

## Minor Observations

- "Dokumen aktif" and "Total dokumen" being equal (4/4) is fine, but consider whether both stats earn their place when they often coincide for small teams.
- The distribution panel is tall (7 rows); with little data it's a lot of vertical scroll for low information. Fine now; revisit if it stays sparse.
- Mobile: layout stacks cleanly and is readable; primary actions sit near the top rather than the thumb zone (acceptable for a desk-first work app).

## Questions to Consider

- What if the dashboard's job were "what do I do next," not "what is the state of everything"? Would a personal task list outrank the distribution chart?
- Should every number on this page be a link into a filtered Dokumen view?
- Does "Profil aktif" earn its prime real estate, or is it there because the column looked empty?
