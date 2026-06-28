"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSubjectColors } from "@/lib/SubjectContext";
import {
  Search,
  X,
  FileText,
  ClipboardList,
  FlaskConical,
  User,
  FolderOpen,
  CornerDownLeft,
  History,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const { getSubject, getColor } = useSubjectColors();

  const [data, setData] = useState({
    notes: [],
    assignments: [],
    labReports: [],
    teachers: [],
    files: [],
  });

  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Listen for global toggle
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-search", handleOpen);
    return () => window.removeEventListener("open-search", handleOpen);
  }, []);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Hydrate recents
  useEffect(() => {
    const stored = localStorage.getItem("orios_recent_searches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Body scroll lock + fetch fresh data on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 50);
      
      // Fetch fresh data
      async function loadSearchData() {
        setLoading(true);
        try {
          const [
            { data: notes },
            { data: assignments },
            { data: labReports },
            { data: teachers },
            { data: files }
          ] = await Promise.all([
            supabase.from("notes").select("*"),
            supabase.from("assignments").select("*"),
            supabase.from("lab_reports").select("*"),
            supabase.from("teachers").select("*"),
            supabase.from("files").select("*"),
          ]);
          
          setData({
            notes: notes || [],
            assignments: assignments || [],
            labReports: labReports || [],
            teachers: teachers || [],
            files: files || [],
          });
        } catch (err) {
          console.error("Failed to load search data:", err);
        } finally {
          setLoading(false);
        }
      }
      loadSearchData();
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const addRecentSearch = (term) => {
    if (!term.trim()) return;
    const next = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem("orios_recent_searches", JSON.stringify(next));
  };

  const clearRecentSearch = (term) => {
    const next = recentSearches.filter((t) => t !== term);
    setRecentSearches(next);
    localStorage.setItem("orios_recent_searches", JSON.stringify(next));
  };

  // Filter items based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const term = query.toLowerCase();

    const matchesSubject = (subjectId) => {
      const subject = getSubject(subjectId);
      if (!subject) return false;
      return (
        subject.code.toLowerCase().includes(term) ||
        subject.name.toLowerCase().includes(term) ||
        subject.shortName.toLowerCase().includes(term)
      );
    };

    const notes = data.notes
      .filter((n) => n.title.toLowerCase().includes(term) || (n.description && n.description.toLowerCase().includes(term)) || matchesSubject(n.subject_id))
      .map((n) => ({
        id: `note-${n.id}`,
        title: n.title,
        subtitle: n.description || "Class note",
        subjectId: n.subject_id,
        category: "Notes",
        icon: FileText,
        action: () => {
          if (n.url) window.open(n.url, "_blank");
          else router.push("/notes");
        },
      }));

    const assignments = data.assignments
      .filter((a) => a.title.toLowerCase().includes(term) || (a.description && a.description.toLowerCase().includes(term)) || matchesSubject(a.subject_id))
      .map((a) => ({
        id: `assign-${a.id}`,
        title: a.title,
        subtitle: `Due: ${new Date(a.due_date).toLocaleDateString()} • ${a.status}`,
        subjectId: a.subject_id,
        category: "Assignments",
        icon: ClipboardList,
        action: () => router.push("/assignments"),
      }));

    const labReports = data.labReports
      .filter((l) => l.title.toLowerCase().includes(term) || (l.description && l.description.toLowerCase().includes(term)) || matchesSubject(l.subject_id))
      .map((l) => ({
        id: `lab-${l.id}`,
        title: `Lab ${l.lab_number}: ${l.title}`,
        subtitle: `Due: ${new Date(l.due_date).toLocaleDateString()} • ${l.status}`,
        subjectId: l.subject_id,
        category: "Lab Reports",
        icon: FlaskConical,
        action: () => router.push("/lab-reports"),
      }));

    const teachers = data.teachers
      .filter((t) => t.name.toLowerCase().includes(term) || t.initials.toLowerCase().includes(term) || t.role.toLowerCase().includes(term))
      .map((t) => ({
        id: `teacher-${t.id}`,
        title: t.name,
        subtitle: `${t.role} (${t.initials}) • ${t.email}`,
        subjectId: null,
        category: "Teachers",
        icon: User,
        action: () => router.push("/teachers"),
      }));

    const files = data.files
      .filter((f) => f.name.toLowerCase().includes(term) || f.uploaded_by.toLowerCase().includes(term) || matchesSubject(f.subject_id))
      .map((f) => ({
        id: `file-${f.id}`,
        title: f.name,
        subtitle: `${f.size} • Uploaded by ${f.uploaded_by}`,
        subjectId: f.subject_id,
        category: "Files",
        icon: FolderOpen,
        action: () => {
          if (f.url) window.open(f.url, "_blank");
          else router.push("/files");
        },
      }));

    return [...notes, ...assignments, ...labReports, ...teachers, ...files];
  }, [query, data, getSubject, router]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Key navigation handlers
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev + 1) % filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev - 1 + filteredResults.length) % filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        addRecentSearch(query);
        filteredResults[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] transition-all duration-200 animate-scale-in">
        {/* Header/Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-base border-none p-0 focus:ring-0"
            placeholder="Search notes, assignments, files, teachers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-2 py-3 space-y-4"
        >
          {query.trim() === "" ? (
            <div className="px-3 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Recent Searches
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-sm text-zinc-600 dark:text-zinc-400 transition-colors group cursor-pointer"
                        onClick={() => setQuery(term)}
                      >
                        <div className="flex items-center gap-2.5">
                          <History className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{term}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentSearch(term);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions/Quick Actions */}
              <div>
                <div className="px-1 mb-2">
                  <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Quick Links
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Notes Hub", href: "/notes", icon: FileText },
                    { label: "Assignments", href: "/assignments", icon: ClipboardList },
                    { label: "Lab Reports", href: "/lab-reports", icon: FlaskConical },
                    { label: "Class Schedule", href: "/schedule", icon: Sparkles },
                  ].map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.href}
                        onClick={() => {
                          router.push(link.href);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700/60 bg-zinc-50/50 dark:bg-zinc-800/10 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {link.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-0.5">
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;
                const subject = result.subjectId ? getSubject(result.subjectId) : null;
                const subjectColor = result.subjectId ? getColor(result.subjectId) : null;

                return (
                  <div
                    key={result.id}
                    data-active={isSelected}
                    onClick={() => {
                      addRecentSearch(query);
                      result.action();
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-medium"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-white dark:bg-zinc-900 text-indigo-500"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate block">
                            {result.title}
                          </span>
                          {subject && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 border uppercase tracking-wide ${
                                subjectColor?.bg || "bg-zinc-100"
                              } ${subjectColor?.text || "text-zinc-600"} ${
                                subjectColor?.border || "border-zinc-200"
                              }`}
                            >
                              {subject.shortName}
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium font-mono shrink-0 uppercase">
                            {result.category}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate block mt-0.5">
                          {result.subtitle}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <span className="text-sm text-zinc-400 dark:text-zinc-600 block">
                No results found for &ldquo;{query}&rdquo;
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 block mt-1">
                Try searching for something else
              </span>
            </div>
          )}
        </div>

        {/* Footer/Help */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm font-sans">
                &darr;&uarr;
              </kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm font-sans">
                enter
              </kbd>{" "}
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm font-sans">
                esc
              </kbd>{" "}
              Close
            </span>
          </div>
          <div>Orios Search</div>
        </div>
      </div>
    </div>
  );
}
