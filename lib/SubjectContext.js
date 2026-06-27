"use client";

/**
 * SubjectContext — Manages the "subject color coding" toggle.
 *
 * When enabled, subject-related elements (filter pills, dots, group headers, etc.)
 * are tinted with their assigned subject color. When disabled, everything falls
 * back to the neutral indigo/zinc palette.
 *
 * State is persisted to localStorage under "orios_subject_colors".
 * In future, this setting will be moved to the Admin Panel.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { getSubjectColor as getRawSubjectColor } from "@/lib/subjects";

const SubjectContext = createContext({
  subjectColorsEnabled: true,
  toggleSubjectColors: () => {},
  getColor: () => ({}),
});

// Neutral fallback palette (used when subject colors are disabled)
const neutralPalette = {
  bg: "bg-zinc-100 dark:bg-zinc-800",
  text: "text-zinc-600 dark:text-zinc-400",
  dot: "bg-indigo-500",
  border: "border-zinc-200 dark:border-zinc-700",
  pillActive: "bg-indigo-600 dark:bg-indigo-500",
  gradient: "from-zinc-50/30 dark:from-zinc-950/20",
  muted: "text-zinc-500 dark:text-zinc-400",
};

export function SubjectProvider({ children }) {
  const [subjectColorsEnabled, setSubjectColorsEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("orios_subject_colors");
    if (stored !== null) {
      setSubjectColorsEnabled(stored === "true");
    }
    setHydrated(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("orios_subject_colors", String(subjectColorsEnabled));
    }
  }, [subjectColorsEnabled, hydrated]);

  const toggleSubjectColors = () => {
    setSubjectColorsEnabled((prev) => !prev);
  };

  /**
   * Returns a color palette for the given subject ID.
   * If subject colors are disabled, returns the neutral palette.
   */
  const getColor = (subjectId) => {
    if (!subjectColorsEnabled) return neutralPalette;
    return getRawSubjectColor(subjectId);
  };

  return (
    <SubjectContext.Provider
      value={{
        subjectColorsEnabled,
        toggleSubjectColors,
        getColor,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubjectColors() {
  return useContext(SubjectContext);
}
