"use client";

import { useSubjectColors } from "@/lib/SubjectContext";
import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import CountdownCard from "@/components/CountdownCard";
import ScheduleCard from "@/components/ScheduleCard";
import {
  mockStats,
  mockCountdowns,
  mockWeeklyRoutine,
  mockAssignments,
  mockLabReports,
} from "@/lib/mock-data";
import { getSubject } from "@/lib/subjects";
import { getTodayClasses } from "@/lib/schedule-helpers";
import {
  BookOpen,
  ClipboardList,
  Clock,
  Search,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { subjectColorsEnabled } = useSubjectColors();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const overdueAssignments = mockAssignments.filter(
    (a) => a.status === "pending" && a.dueDate && new Date(a.dueDate) < now
  );
  const overdueLabReports = mockLabReports.filter(
    (r) => r.status === "pending" && r.dueDate && new Date(r.dueDate) < now
  );
  const totalOverdue = overdueAssignments.length + overdueLabReports.length;

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* ========== HERO ========== */}
      <header className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950/20" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Mobile: Compact greeting */}
        <div className="relative md:hidden px-5 pt-5 pb-4">
          <div className="flex items-center justify-between animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Orios Class
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                {todayDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="/orio.png"
                alt="Orio"
                className="w-10 h-10 object-contain"
                style={{ transform: "rotate(12deg)" }}
              />
            </div>
          </div>
        </div>

        {/* Desktop: Full hero */}
        <div className="relative hidden md:block max-w-7xl mx-auto px-6 pt-20 pb-14">
          {/* Badge */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              Class Portal
            </span>
          </div>

          {/* Title */}
          <div className="animate-fade-in-up delay-1">
            <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              Welcome to{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Orios Class
              </span>
              <img
                src="/orio.png"
                alt="Orio"
                className="inline-block w-10 h-10 object-contain ml-2 align-middle"
                style={{ transform: "rotate(12deg)" }}
              />
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-fade-in-up delay-2">
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
              Your all-in-one class companion. Access notes, track assignments,
              check schedules, and stay updated.
            </p>
          </div>

          {/* Search bar (desktop only) */}
          <div className="animate-fade-in-up delay-3">
            <button className="flex items-center gap-3 w-full max-w-md px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 text-sm">
              <Search size={16} strokeWidth={2} />
              <span className="flex-1 text-left">Search everything...</span>
              <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono border border-zinc-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-5 md:px-6 space-y-8 md:space-y-10 pb-10">
        {/* Overdue Alerts Banner */}
        {totalOverdue > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/10 p-3 sm:p-4 animate-fade-in-up">
            <div className="flex items-start gap-0 sm:gap-3">
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle size={16} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-400">
                  Attention: Overdue Tasks ({totalOverdue})
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-500/80 mt-0.5">
                  You have tasks that are past their due dates. Please submit them as soon as possible.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {overdueAssignments.map((item) => (
                    <Link
                      key={`assign-${item.id}`}
                      href="/assignments"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950/40 hover:border-rose-300 dark:hover:border-rose-700/50 transition-colors text-xs"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate mr-2 text-left flex-1 min-w-0">
                        {item.title} (Assignment)
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 shrink-0 font-medium font-mono">
                        Overdue
                      </span>
                    </Link>
                  ))}
                  {overdueLabReports.map((item) => (
                    <Link
                      key={`lab-${item.id}`}
                      href="/lab-reports"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950/40 hover:border-rose-300 dark:hover:border-rose-700/50 transition-colors text-xs"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate mr-2 text-left flex-1 min-w-0">
                        {item.title} (Lab L{item.labNumber})
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 shrink-0 font-medium font-mono">
                        Overdue
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Stats Strip ===== */}
        <section className="animate-fade-in-up delay-4">
          <div className="grid grid-cols-3 gap-2 md:gap-3 md:grid-cols-3">
            <StatCard
              icon={BookOpen}
              value={mockStats.classesToday}
              label="Classes Today"
              href="/calendar"
            />
            <StatCard
              icon={ClipboardList}
              value={mockStats.pendingTasks}
              label="Pending Tasks"
              href="/assignments"
            />
            <StatCard
              icon={Clock}
              value={mockStats.upcomingEvents}
              label="Upcoming"
              href="/calendar"
            />
          </div>
        </section>

        {/* ===== Upcoming Deadlines ===== */}
        <section className="animate-fade-in-up delay-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Upcoming Deadlines
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                Countdowns for your next events
              </p>
            </div>
            <img
              src="/orio1.png"
              alt=""
              className="w-10 h-10 object-contain opacity-60 hidden md:block"
              style={{ transform: "rotate(-8deg)" }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockCountdowns.map((item) => {
              const subject = getSubject(item.subjectId);
              return (
                <CountdownCard
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  type={item.type}
                  subject={subject ? subject.code : item.subjectId}
                />
              );
            })}
          </div>
        </section>

        {/* ===== Today's Schedule ===== */}
        <section className="animate-fade-in-up delay-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Today's Schedule
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              {todayDate}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/40 p-4 md:p-5">
            {(() => {
              const todayClasses = getTodayClasses(mockWeeklyRoutine);
              return todayClasses.length > 0 ? (
                <div>
                  {todayClasses.map((cls, index) => {
                    const subject = getSubject(cls.subjectId);
                    return (
                      <ScheduleCard
                        key={`${cls.subjectId}-${index}`}
                        time={cls.time}
                        subject={subject ? subject.code : cls.subjectId}
                        teacher={cls.teacher}
                        room={cls.room}
                        type={cls.type}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
                  <span className="text-2xl mb-2 block">🎉</span>
                  <p className="text-sm">No classes today! Enjoy your day off.</p>
                </div>
              );
            })()}
          </div>
        </section>


        {/* ===== Footer ===== */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/40 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Built with ♥
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
