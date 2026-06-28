"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { colorPalettes } from "@/lib/subjects";

const SubjectContext = createContext({
  subjects: [],
  subjectColorsEnabled: true,
  toggleSubjectColors: () => {},
  getSubject: () => undefined,
  getSubjectByCode: () => undefined,
  getColor: () => ({}),
  isLoading: true,
});

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
  const [subjects, setSubjects] = useState([]);
  const [subjectColorsEnabled, setSubjectColorsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const supabase = createClient();

  // Load subjects from Supabase on mount
  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("code", { ascending: true });
        if (error) throw error;

        // Map column names to camelCase if needed, but the DB uses:
        // id, code, name, short_name, color, credit_hours
        // Let's map short_name -> shortName, credit_hours -> creditHours to preserve compatibility
        const mappedSubjects = (data || []).map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          shortName: s.short_name,
          color: s.color,
          creditHours: Number(s.credit_hours),
        }));
        setSubjects(mappedSubjects);
      } catch (err) {
        console.error("Failed to load subjects from database:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubjects();

    // Listen for realtime subject changes in admin panel
    const channel = supabase
      .channel("realtime-subjects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subjects" },
        () => {
          loadSubjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Hydrate theme preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("orios_subject_colors");
    if (stored !== null) {
      setSubjectColorsEnabled(stored === "true");
    }
    setHydrated(true);
  }, []);

  // Persist preferences
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("orios_subject_colors", String(subjectColorsEnabled));
    }
  }, [subjectColorsEnabled, hydrated]);

  const toggleSubjectColors = () => {
    setSubjectColorsEnabled((prev) => !prev);
  };

  const getSubject = (id) => {
    return subjects.find((s) => s.id === id);
  };

  const getSubjectByCode = (code) => {
    return subjects.find((s) => s.code === code);
  };

  const getColor = (subjectId) => {
    if (!subjectColorsEnabled) return neutralPalette;
    const subject = getSubject(subjectId);
    if (subject && colorPalettes[subject.color]) {
      return colorPalettes[subject.color];
    }
    return neutralPalette;
  };

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        subjectColorsEnabled,
        toggleSubjectColors,
        getSubject,
        getSubjectByCode,
        getColor,
        isLoading,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubjectColors() {
  return useContext(SubjectContext);
}
