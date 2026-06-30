"use client";

import { useState, useMemo, useEffect } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import {
  FolderOpen,
  FileText,
  Archive,
  Presentation,
  Code2,
  Search,
  Download,
  User,
  Image as ImageIcon,
} from "lucide-react";

import { triggerDownload } from "@/lib/download";

const fileTypeConfig = {
  pdf: { label: "PDF", icon: FileText, color: "text-red-500 dark:text-red-400" },
  zip: { label: "ZIP", icon: Archive, color: "text-amber-500 dark:text-amber-400" },
  pptx: { label: "PPTX", icon: Presentation, color: "text-orange-500 dark:text-orange-400" },
  code: { label: "Code", icon: Code2, color: "text-emerald-500 dark:text-emerald-400" },
  image: { label: "Image", icon: ImageIcon, color: "text-blue-500 dark:text-blue-400" },
};

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("all");
  const { getColor, subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFiles() {
      try {
        const { data, error } = await supabase
          .from("files")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        const mapped = (data || []).map((f) => ({
          id: f.id,
          name: f.name,
          subjectId: f.subject_id,
          type: f.type,
          size: f.size,
          uploadedBy: f.uploaded_by,
          url: f.url,
          attachments: f.attachments || [],
          date: f.created_at,
        }));
        setFiles(mapped);
      } catch (err) {
        console.error("Error loading files:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
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
  }, [files, search, activeSubject, getSubject]);

  const handleDownload = (fileUrl, fileName) => {
    triggerDownload(fileUrl, fileName);
  };

  if (loading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-20 md:pb-10 mt-4 md:mt-6">
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

              const handleCardClick = () => {
                if (file.attachments && file.attachments.length > 0) {
                  handleDownload(file.attachments[0].url, file.attachments[0].name);
                } else {
                  handleDownload(file.url, file.name);
                }
              };

              return (
                <div
                  key={file.id}
                  onClick={handleCardClick}
                  className="flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group"
                >
                  {/* File icon */}
                  <div className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 ${config.color}`}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                    {file.attachments && file.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                        {file.attachments.map((att, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleDownload(att.url, att.name)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-zinc-200/60 dark:border-zinc-850 font-medium"
                          >
                            <Download size={8} className="shrink-0" />
                            <span className="truncate max-w-[120px]">{att.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
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
