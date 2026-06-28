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
          {mockAssignments.filter((a) => a.status === "pending").slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Assignment</p>
                </div>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
          {mockLabReports.filter((r) => r.status === "pending").slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500">Lab Report</p>
                </div>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                {new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
