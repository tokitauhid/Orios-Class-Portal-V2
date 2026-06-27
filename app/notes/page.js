"use client";

import { useState, useMemo } from "react";
import { mockNotes } from "@/lib/mock-data";
import {
  FileText,
  Link2,
  Image,
  FileSpreadsheet,
  Search,
  StickyNote,
} from "lucide-react";

const typeConfig = {
  pdf: {
    label: "PDF",
    icon: FileText,
    badge: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  },
  doc: {
    label: "DOC",
    icon: FileSpreadsheet,
    badge: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
  },
  link: {
    label: "LINK",
    icon: Link2,
    badge: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  image: {
    label: "IMG",
    icon: Image,
    badge: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
};

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set(mockNotes.map((n) => n.subject));
    return ["All", ...Array.from(set).sort()];
  }, []);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return mockNotes.filter((note) => {
      const matchSubject = activeSubject === "All" || note.subject === activeSubject;
      const matchSearch =
        !search ||
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.description.toLowerCase().includes(search.toLowerCase()) ||
        note.subject.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [search, activeSubject]);

  // Group filtered notes by subject
  const groupedNotes = useMemo(() => {
    const groups = {};
    filteredNotes.forEach((note) => {
      if (!groups[note.subject]) groups[note.subject] = [];
      groups[note.subject].push(note);
    });
    return groups;
  }, [filteredNotes]);

  const noteCount = filteredNotes.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Notes
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {noteCount} {noteCount === 1 ? "note" : "notes"}{activeSubject !== "All" ? ` in ${activeSubject}` : ""}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <StickyNote size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-colors"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeSubject === subject
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-24 md:pb-10">
        {Object.keys(groupedNotes).length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No notes found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4 md:mt-6">
            {Object.entries(groupedNotes).map(([subject, notes]) => (
              <section key={subject}>
                {/* Subject Header (only show if not filtering by a single subject) */}
                {activeSubject === "All" && (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                      {subject}
                    </h2>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800/60" />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                      {notes.length}
                    </span>
                  </div>
                )}

                {/* Note Cards */}
                <div className="space-y-2">
                  {notes.map((note) => {
                    const config = typeConfig[note.type] || typeConfig.pdf;
                    const Icon = config.icon;
                    const formattedDate = new Date(note.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={note.id}
                        className="flex items-start gap-3 px-3 md:px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group"
                      >
                        {/* Icon */}
                        <div className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5">
                          <Icon size={18} strokeWidth={1.8} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {note.title}
                            </h3>
                            <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded-full ${config.badge}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                            {note.description}
                          </p>
                        </div>

                        {/* Date */}
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600 shrink-0 mt-1">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
