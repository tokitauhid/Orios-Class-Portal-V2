"use client";

import { useState, useMemo } from "react";
import { mockFiles } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import { useSubjectColors } from "@/lib/SubjectContext";
import {
  FolderOpen,
  FileText,
  Archive,
  Presentation,
  Code2,
  Search,
  Download,
  User,
} from "lucide-react";

const fileTypeConfig = {
  pdf: { label: "PDF", icon: FileText, color: "text-red-500 dark:text-red-400" },
  zip: { label: "ZIP", icon: Archive, color: "text-amber-500 dark:text-amber-400" },
  pptx: { label: "PPTX", icon: Presentation, color: "text-orange-500 dark:text-orange-400" },
  code: { label: "Code", icon: Code2, color: "text-emerald-500 dark:text-emerald-400" },
};

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const { getColor } = useSubjectColors();

  const filteredFiles = useMemo(() => {
    return mockFiles.filter((file) => {
      const matchSubject = activeSubject === "all" || file.subjectId === activeSubject;
      const subject = getSubject(file.subjectId);
      const subjectCode = subject ? subject.code : "";
      const matchSearch =
        !search ||
        file.name.toLowerCase().includes(search.toLowerCase()) ||
        subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        file.uploadedBy.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [search, activeSubject]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-violet-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-violet-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Files
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}{activeSubject !== "all" ? ` in ${getSubject(activeSubject)?.code || activeSubject}` : ""}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <FolderOpen size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40 transition-colors"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveSubject("all")}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeSubject === "all"
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              All
            </button>
            {subjects.map((subject) => {
              const colors = getColor(subject.id);
              const isActive = activeSubject === subject.id;
              return (
                <button
                  key={subject.id}
                  onClick={() => setActiveSubject(subject.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? `${colors.pillActive} text-white shadow-sm`
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : colors.dot}`} />
                  {subject.code}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-24 md:pb-10 mt-4 md:mt-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <Search size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No files found</p>
            <p className="text-xs mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const config = fileTypeConfig[file.type] || fileTypeConfig.pdf;
              const Icon = config.icon;
              const formattedDate = new Date(file.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group"
                >
                  {/* File icon */}
                  <div className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 ${config.color}`}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        {file.size}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <User size={10} className="text-zinc-400 dark:text-zinc-600" />
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        {file.uploadedBy}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Download button */}
                  <button className="p-2 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0">
                    <Download size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
