/**
 * Centralized Subject Registry
 *
 * Single source of truth for all subjects in the portal.
 * Every page that references a subject should import from here
 * and resolve via subjectId.
 *
 * In production, this list will be managed from the Admin Panel.
 */

// ─── Subject Color Palettes ───────────────────────────────────
// Maps a color name to Tailwind class sets for consistent theming.
const colorPalettes = {
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
    border: "border-indigo-200 dark:border-indigo-500/20",
    pillActive: "bg-indigo-600 dark:bg-indigo-500",
    gradient: "from-indigo-50/30 dark:from-indigo-950/20",
    muted: "text-indigo-500 dark:text-indigo-400",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-200 dark:border-emerald-500/20",
    pillActive: "bg-emerald-600 dark:bg-emerald-500",
    gradient: "from-emerald-50/30 dark:from-emerald-950/20",
    muted: "text-emerald-500 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-500/20",
    pillActive: "bg-amber-600 dark:bg-amber-500",
    gradient: "from-amber-50/30 dark:from-amber-950/20",
    muted: "text-amber-500 dark:text-amber-400",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-200 dark:border-rose-500/20",
    pillActive: "bg-rose-600 dark:bg-rose-500",
    gradient: "from-rose-50/30 dark:from-rose-950/20",
    muted: "text-rose-500 dark:text-rose-400",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-500/10",
    text: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
    border: "border-violet-200 dark:border-violet-500/20",
    pillActive: "bg-violet-600 dark:bg-violet-500",
    gradient: "from-violet-50/30 dark:from-violet-950/20",
    muted: "text-violet-500 dark:text-violet-400",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-400",
    dot: "bg-cyan-500",
    border: "border-cyan-200 dark:border-cyan-500/20",
    pillActive: "bg-cyan-600 dark:bg-cyan-500",
    gradient: "from-cyan-50/30 dark:from-cyan-950/20",
    muted: "text-cyan-500 dark:text-cyan-400",
  },
  sky: {
    bg: "bg-sky-100 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-500",
    border: "border-sky-200 dark:border-sky-500/20",
    pillActive: "bg-sky-600 dark:bg-sky-500",
    gradient: "from-sky-50/30 dark:from-sky-950/20",
    muted: "text-sky-500 dark:text-sky-400",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    border: "border-orange-200 dark:border-orange-500/20",
    pillActive: "bg-orange-600 dark:bg-orange-500",
    gradient: "from-orange-50/30 dark:from-orange-950/20",
    muted: "text-orange-500 dark:text-orange-400",
  },
};

// ─── Subject Definitions ──────────────────────────────────────
// In production, this will be fetched from the backend / admin panel.
export const subjects = [
  {
    id: "eee-1201",
    code: "EEE 1201",
    name: "Electrical Circuits",
    shortName: "EEE",
    color: "indigo",
    creditHours: 3,
    teacherIds: [1], // Dr. Abdur Rahman
  },
  {
    id: "phy-1201",
    code: "PHY 1201",
    name: "Physics",
    shortName: "PHY",
    color: "emerald",
    creditHours: 3,
    teacherIds: [2], // Prof. Kamal Ahmed
  },
  {
    id: "cse-1201",
    code: "CSE 1201",
    name: "Computer Science",
    shortName: "CSE",
    color: "violet",
    creditHours: 3,
    teacherIds: [3], // Ms. Fatima Akter
  },
  {
    id: "math-1201",
    code: "MATH 1201",
    name: "Mathematics",
    shortName: "MATH",
    color: "amber",
    creditHours: 3,
    teacherIds: [4], // Dr. Imran Khan
  },
];

// ─── Lookup Helpers ───────────────────────────────────────────

/** All subject IDs */
export const allSubjectIds = subjects.map((s) => s.id);

/** Lookup a subject object by its ID. Returns undefined if not found. */
export function getSubject(id) {
  return subjects.find((s) => s.id === id);
}

/** Lookup a subject by its course code string (e.g. "EEE 1201"). */
export function getSubjectByCode(code) {
  return subjects.find((s) => s.code === code);
}

/**
 * Returns the Tailwind color palette for a subject.
 * Falls back to a neutral zinc palette if subject or color not found.
 */
export function getSubjectColor(id) {
  const subject = getSubject(id);
  if (subject && colorPalettes[subject.color]) {
    return colorPalettes[subject.color];
  }
  // Neutral fallback
  return {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-700 dark:text-zinc-400",
    dot: "bg-zinc-500",
    border: "border-zinc-200 dark:border-zinc-700",
    pillActive: "bg-zinc-600 dark:bg-zinc-500",
    gradient: "from-zinc-50/30 dark:from-zinc-950/20",
    muted: "text-zinc-500 dark:text-zinc-400",
  };
}

/** Get all subjects that a teacher (by teacherId) is assigned to. */
export function getSubjectsForTeacher(teacherId) {
  return subjects.filter((s) => s.teacherIds.includes(teacherId));
}

/** Get all teacher IDs for a given subject. */
export function getTeacherIdsForSubject(subjectId) {
  const subject = getSubject(subjectId);
  return subject ? subject.teacherIds : [];
}

/** Available color names (for the color picker in settings). */
export const availableColors = Object.keys(colorPalettes);
