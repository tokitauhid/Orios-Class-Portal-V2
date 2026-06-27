"use client";

import { useTheme } from "@/components/ThemeProvider";
import StatCard from "@/components/StatCard";
import CountdownCard from "@/components/CountdownCard";
import ScheduleCard from "@/components/ScheduleCard";
import FeatureCard from "@/components/FeatureCard";
import {
  mockStats,
  mockCountdowns,
  mockSchedule,
  mockFeatures,
} from "@/lib/mock-data";
import {
  BookOpen,
  ClipboardList,
  Clock,
  StickyNote,
  Sun,
  Moon,
  Search,
} from "lucide-react";

import { useState, useEffect } from "react";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

        <div className="relative max-w-7xl mx-auto px-5 md:px-6 pt-12 md:pt-20 pb-8 md:pb-14">
          {/* Badge */}
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              Class Portal
            </span>
          </div>

          {/* Title */}
          <div className="animate-fade-in-up delay-1">
            <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
              Welcome to{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Orios Class
              </span>
              <img
                src="/orio.png"
                alt="Orio"
                className="inline-block w-8 h-8 md:w-10 md:h-10 object-contain ml-2 align-middle"
                style={{ transform: "rotate(12deg)" }}
              />
            </h1>
          </div>

          {/* Subtitle */}
          <div className="animate-fade-in-up delay-2">
            <p className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
              Your all-in-one class companion. Access notes, track assignments,
              check schedules, and stay updated.
            </p>
          </div>

          {/* Search bar */}
          <div className="animate-fade-in-up delay-3">
            <button className="flex items-center gap-3 w-full max-w-md px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200 text-sm">
              <Search size={16} strokeWidth={2} />
              <span className="flex-1 text-left">Search everything...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono border border-zinc-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-5 md:px-6 space-y-8 md:space-y-10 pb-10">
        {/* ===== Stats Strip ===== */}
        <section className="animate-fade-in-up delay-4">
          <div className="flex gap-3 overflow-x-auto snap-x-mandatory pb-1 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:overflow-visible">
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
            <StatCard
              icon={StickyNote}
              value={mockStats.totalNotes}
              label="Total Notes"
              href="/notes"
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
            {mockCountdowns.map((item) => (
              <CountdownCard
                key={item.id}
                title={item.title}
                date={item.date}
                type={item.type}
                subject={item.subject}
              />
            ))}
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
            {mockSchedule.length > 0 ? (
              <div>
                {mockSchedule.map((cls) => (
                  <ScheduleCard
                    key={cls.id}
                    time={cls.time}
                    subject={cls.subject}
                    teacher={cls.teacher}
                    room={cls.room}
                    type={cls.type}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
                <span className="text-2xl mb-2 block">🎉</span>
                <p className="text-sm">No classes today! Enjoy your day off.</p>
              </div>
            )}
          </div>
        </section>

        {/* ===== Quick Access ===== */}
        <section className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Quick Access
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                Jump to what you need
              </p>
            </div>
            <img
              src="/pucu.png"
              alt=""
              className="w-10 h-10 object-contain opacity-60 hidden md:block"
              style={{ transform: "rotate(5deg)" }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockFeatures.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                icon={feature.icon}
              />
            ))}
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800/40 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Built with ♥
            </p>
            {/* Mobile theme toggle (since it's not in bottom nav) */}
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors duration-150"
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
              ) : (
                <div className="w-[16px] h-[16px]" />
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
