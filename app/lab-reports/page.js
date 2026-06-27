"use client";

import { useState, useMemo } from "react";
import { mockLabReports } from "@/lib/mock-data";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Award,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    badge: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  submitted: {
    label: "Submitted",
    badge: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  graded: {
    label: "Graded",
    badge: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
};

const filters = ["All", "Pending", "Submitted", "Graded"];

export default function LabReportsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    if (activeFilter === "All") return mockLabReports;
    return mockLabReports.filter(
      (r) => r.status === activeFilter.toLowerCase()
    );
  }, [activeFilter]);

  // Sort: pending first (by due date asc), then submitted, then graded
  const sorted = useMemo(() => {
    const order = { pending: 0, submitted: 1, graded: 2 };
    return [...filtered].sort((a, b) => {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [filtered]);

  const pendingCount = mockLabReports.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Lab Reports
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {pendingCount} pending · {mockLabReports.length} total
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FlaskConical size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeFilter === filter
                    ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lab Reports List */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-24 md:pb-10 mt-4 md:mt-6">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <CheckCircle2 size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No lab reports here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((report) => {
              const config = statusConfig[report.status];
              const dueDate = new Date(report.dueDate);
              const now = new Date();
              const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

              const formattedDate = dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={report.id}
                  className="flex items-start gap-3 px-3 md:px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group"
                >
                  {/* Lab number badge */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                    <span className="text-xs font-bold">L{report.labNumber}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {report.title}
                      </h3>
                      <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded-full ${config.badge}`}>
                        {report.grade || config.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                      {report.subject} · {report.description}
                    </p>
                  </div>

                  {/* Due date */}
                  <div className="flex flex-col items-end shrink-0 mt-0.5">
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {formattedDate}
                    </span>
                    {report.status === "pending" && (
                      <span className={`text-[10px] mt-0.5 ${
                        daysLeft <= 2 ? "text-red-500 dark:text-red-400 font-medium" : "text-zinc-400 dark:text-zinc-600"
                      }`}>
                        {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
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
