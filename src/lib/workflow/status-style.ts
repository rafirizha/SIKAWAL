import { LETTER_STATUS } from "@/lib/workflow/constants";

/**
 * Single source of truth for status colors across the app.
 * `badge` tones are the soft fill used on chips/badges.
 * `bar` tones are the solid fill used on distribution bars.
 */
export const STATUS_BADGE_TONE: Record<string, string> = {
  [LETTER_STATUS.DRAFT]: "bg-slate-100 text-slate-700",
  [LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION]:
    "bg-amber-50 text-amber-800",
  [LETTER_STATUS.NEEDS_REVISION]: "bg-rose-50 text-rose-800",
  [LETTER_STATUS.WAITING_HEAD_CORRECTION]: "bg-sky-50 text-sky-800",
  [LETTER_STATUS.INTERNALLY_APPROVED]: "bg-emerald-50 text-emerald-800",
  [LETTER_STATUS.FINAL]: "bg-green-50 text-green-800",
  [LETTER_STATUS.CANCELED]: "bg-zinc-100 text-zinc-700",
};

export const STATUS_BAR_TONE: Record<string, string> = {
  [LETTER_STATUS.DRAFT]: "bg-slate-500",
  [LETTER_STATUS.WAITING_GENERAL_SUBDIVISION_CORRECTION]: "bg-amber-500",
  [LETTER_STATUS.NEEDS_REVISION]: "bg-rose-500",
  [LETTER_STATUS.WAITING_HEAD_CORRECTION]: "bg-sky-500",
  [LETTER_STATUS.INTERNALLY_APPROVED]: "bg-emerald-500",
  [LETTER_STATUS.FINAL]: "bg-green-500",
  [LETTER_STATUS.CANCELED]: "bg-zinc-400",
};

export const FALLBACK_BADGE_TONE = "bg-muted text-muted-foreground";
export const FALLBACK_BAR_TONE = "bg-muted-foreground";

export function statusBadgeTone(status: string) {
  return STATUS_BADGE_TONE[status] ?? FALLBACK_BADGE_TONE;
}

export function statusBarTone(status: string) {
  return STATUS_BAR_TONE[status] ?? FALLBACK_BAR_TONE;
}
