"use client";

import Link from "next/link";
import {
  mockNotes,
  mockAssignments,
  mockLabReports,
  mockTeachers,
  mockFiles,
  mockWeeklyRoutine,
} from "@/lib/mock-data";
import { subjects } from "@/lib/subjects";
import {
  FileText,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  FolderOpen,
  CalendarDays,
  BookOpen,
  Plus,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Notes", count: mockNotes.length, icon: FileText, href: "/admin/notes", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10" },
  { label: "Assignments", count: mockAssignments.length, icon: ClipboardList, href: "/admin/assignments", color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10" },
  { label: "Lab Reports", count: mockLabReports.length, icon: FlaskConical, href: "/admin/lab-reports", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10" },
  { label: "Teachers", count: mockTeachers.length, icon: GraduationCap, href: "/admin/teachers", color: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10" },
  { label: "Files", count: mockFiles.length, icon: FolderOpen, href: "/admin/files", color: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/10" },
  { label: "Subjects", count: subjects.length, icon: BookOpen, href: "/admin/routine", color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10" },
];

const quickActions = [
  { label: "Add Note", href: "/admin/notes", icon: FileText },
  { label: "Add Assignment", href: "/admin/assignments", icon: ClipboardList },
  { label: "Add Lab Report", href: "/admin/lab-reports", icon: FlaskConical },
  { label: "Edit Routine", href: "/admin/routine", icon: CalendarDays },
];

export default function AdminDashboard() {
  const now = new Date();

  const getIsOverdue = (item) => {
    return item.dueDate && new Date(item.dueDate) < now;
  };

  const pendingAssignments = mockAssignments
    .filter((a) => a.status === "pending")
    .map((a) => ({ ...a, type: "Assignment" }));

  const pendingLabReports = mockLabReports
    .filter((r) => r.status === "pending")
    .map((r) => ({ ...r, type: "Lab Report" }));

  const combinedPending = [...pendingAssignments, ...pendingLabReports].sort((a, b) => {
    const aOverdue = getIsOverdue(a);
    const bOverdue = getIsOverdue(b);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const displayedPending = combinedPending.slice(0, 5);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
          Manage your class portal content
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.color} mb-3`}>
                <Icon size={16} strokeWidth={1.8} />
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {stat.count}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                {stat.label}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-150 group"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                  <Plus size={14} strokeWidth={2} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Items Summary */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          Pending Items
        </h3>
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 divide-y divide-zinc-100 dark:divide-zinc-800/30">
          {displayedPending.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-600">
              No pending or overdue items!
            </div>
          ) : (
            displayedPending.map((item) => {
              const isOverdue = getIsOverdue(item);
              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.type === "Assignment" ? "/admin/assignments" : "/admin/lab-reports"}
                  className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors duration-150 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isOverdue ? "bg-rose-500 animate-pulse" : item.type === "Assignment" ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        {item.type} {item.labNumber && `L${item.labNumber}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-xs shrink-0 font-medium ${isOverdue ? "text-rose-500" : "text-zinc-400 dark:text-zinc-600"}`}>
                      {isOverdue ? "Overdue" : new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {isOverdue && (
                      <span className="text-[9px] text-rose-400 font-mono">
                        Due: {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
