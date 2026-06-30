"use client";

import { useState, useMemo, useEffect } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import { triggerDownload } from "@/lib/download";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badge: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    badge: "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    badge: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
};

const statusFilters = ["All", "Pending", "Overdue", "Submitted"];

export default function AssignmentsPage() {
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeSubject, setActiveSubject] = useState("all");
  const { getColor, subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAssignments() {
      try {
        const { data, error } = await supabase
          .from("assignments")
          .select("*")
          .order("due_date", { ascending: true });
        if (error) throw error;
        
        const mapped = (data || []).map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          subjectId: a.subject_id,
          dueDate: a.due_date,
          status: a.status,
          file: a.file_url,
          attachments: a.attachments || [],
        }));
        setAssignments(mapped);
      } catch (err) {
        console.error("Error loading assignments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAssignments();
  }, []);

  const getDynamicStatus = (item) => {
    if (item.status === "pending" && item.dueDate && new Date(item.dueDate) < new Date()) {
      return "overdue";
    }
    return item.status;
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const itemStatus = getDynamicStatus(a);
      const matchStatus = activeStatus === "All" || itemStatus === activeStatus.toLowerCase();
      const matchSubject = activeSubject === "all" || a.subjectId === activeSubject;
      return matchStatus && matchSubject;
    });
  }, [assignments, activeStatus, activeSubject]);

  // Sort: overdue first, then pending, then submitted
  const sortedAssignments = useMemo(() => {
    const order = { overdue: 0, pending: 1, submitted: 2 };
    return [...filteredAssignments].sort((a, b) => {
      const statusA = getDynamicStatus(a);
      const statusB = getDynamicStatus(b);
      if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [filteredAssignments]);

  const pendingCount = assignments.filter((a) => getDynamicStatus(a) === "pending").length;
  const overdueCount = assignments.filter((a) => getDynamicStatus(a) === "overdue").length;

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
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-amber-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-amber-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Assignments
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {pendingCount} pending · {overdueCount} overdue · {assignments.length} total
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ClipboardList size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveStatus(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeStatus === filter
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Subject Filter Pills */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveSubject("all")}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeSubject === "all"
                  ? "bg-zinc-700 dark:bg-zinc-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              All Subjects
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

      {/* Assignments List */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-20 md:pb-10 mt-4 md:mt-6">
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <CheckCircle2 size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No assignments here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAssignments.map((assignment) => {
              const itemStatus = getDynamicStatus(assignment);
              const config = statusConfig[itemStatus];
              const subject = getSubject(assignment.subjectId);
              const subjectCode = subject ? subject.code : assignment.subjectId;
              const subjectColors = getColor(assignment.subjectId);
              const dueDate = new Date(assignment.dueDate);
              const now = new Date();
              const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

              const formattedDate = dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              // Allow clicking to download/view the file if it exists
              const handleCardClick = () => {
                if (assignment.attachments && assignment.attachments.length > 0) {
                  triggerDownload(assignment.attachments[0].url, assignment.attachments[0].name);
                } else if (assignment.file) {
                  triggerDownload(assignment.file, assignment.title);
                }
              };

              const hasFile = (assignment.attachments && assignment.attachments.length > 0) || !!assignment.file;

              return (
                <div
                  key={assignment.id}
                  onClick={handleCardClick}
                  className={`flex items-start gap-3 px-3 md:px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 ${
                    hasFile ? "cursor-pointer group" : ""
                  }`}
                >
                  {/* Status indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${config.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate ${hasFile ? "group-hover:text-indigo-600 dark:group-hover:text-indigo-400" : ""}`}>
                        {assignment.title}
                      </h3>
                      <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                      <span className={`font-medium ${subjectColors.muted}`}>{subjectCode}</span>
                      {" · "}{assignment.description}
                    </p>
                    {assignment.attachments && assignment.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                        {assignment.attachments.map((att, idx) => (
                          <button
                            key={idx}
                            onClick={() => triggerDownload(att.url, att.name)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-zinc-200/60 dark:border-zinc-850 font-medium"
                          >
                            <Paperclip size={8} className="shrink-0" />
                            <span className="truncate max-w-[120px]">{att.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : assignment.file ? (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        <Paperclip size={10} className="shrink-0" />
                        <span className="truncate group-hover:underline">View Attachment</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Due date */}
                  <div className="flex flex-col items-end shrink-0 mt-0.5">
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {formattedDate}
                    </span>
                    {itemStatus === "pending" && (
                      <span className="text-[10px] mt-0.5 text-zinc-400 dark:text-zinc-600">
                        {daysLeft}d left
                      </span>
                    )}
                    {itemStatus === "overdue" && (
                      <span className="text-[10px] mt-0.5 text-red-500 dark:text-red-400 font-medium">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
