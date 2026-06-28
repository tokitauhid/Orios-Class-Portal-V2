"use client";

import { useState, useMemo, useEffect } from "react";
import { mockWeeklyRoutine, mockAssignments, mockLabReports } from "@/lib/mock-data";
import { getSubject } from "@/lib/subjects";
import { useSubjectColors } from "@/lib/SubjectContext";
import {
  getTodayName,
  getNextClass,
  getItemsDueOnDate,
  formatTime,
} from "@/lib/schedule-helpers";
import DayView from "@/components/DayView";
import WeekGrid from "@/components/WeekGrid";
import { CalendarDays, Clock, LayoutGrid, List } from "lucide-react";

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState("day"); // "day" | "week"
  const [activeDay, setActiveDay] = useState(getTodayName());
  const [mounted, setMounted] = useState(false);
  const { getColor } = useSubjectColors();

  useEffect(() => {
    setMounted(true);
  }, []);

  // "Next Up" card data
  const nextClass = useMemo(() => {
    if (!mounted) return null;
    return getNextClass(mockWeeklyRoutine);
  }, [mounted]);

  // Calculate deadline dots for week grid (count of items due per day)
  const deadlineDots = useMemo(() => {
    const dots = {};
    const today = new Date();
    const jsRoutineDayMap = {
      Saturday: 6, Sunday: 0, Monday: 1, Tuesday: 2,
      Wednesday: 3, Thursday: 4, Friday: 5,
    };

    mockWeeklyRoutine.days.forEach((dayName) => {
      const targetJsDay = jsRoutineDayMap[dayName];
      if (targetJsDay === undefined) return;

      const todayDayIndex = today.getDay();
      let diff = targetJsDay - todayDayIndex;
      if (diff < 0) diff += 7;

      const d = new Date(today);
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);

      const allItems = [...mockAssignments, ...mockLabReports];
      const dueItems = getItemsDueOnDate(allItems, d);
      if (dueItems.length > 0) {
        dots[dayName] = dueItems.length;
      }
    });

    return dots;
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-950 dark:to-indigo-950/20" />
        <div className="relative max-w-4xl mx-auto px-5 md:px-6 pt-5 md:pt-10 pb-4 md:pb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Schedule
              </h1>
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {mounted
                  ? new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "\u00A0"}
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CalendarDays size={20} strokeWidth={1.8} />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 w-fit">
            <button
              onClick={() => setViewMode("day")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                viewMode === "day"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <List size={14} strokeWidth={2} />
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                viewMode === "week"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <LayoutGrid size={14} strokeWidth={2} />
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-24 md:pb-10 mt-4 md:mt-6">
        {/* "Next Up" Card — only shown in day view when viewing today */}
        {viewMode === "day" && mounted && nextClass && activeDay === getTodayName() && (
          <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/[0.07] border border-indigo-200/60 dark:border-indigo-500/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/15">
              <Clock size={14} strokeWidth={2} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Next up
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {(() => {
                  const subject = getSubject(nextClass.subjectId);
                  return subject ? subject.code : nextClass.subjectId;
                })()}
                <span className="font-normal text-zinc-500 dark:text-zinc-500">
                  {" · "}{nextClass.room} · in {nextClass.minutesUntil} min
                </span>
              </p>
            </div>
          </div>
        )}

        {/* View Content */}
        {viewMode === "day" ? (
          <DayView
            routine={mockWeeklyRoutine}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            assignments={mockAssignments}
            labReports={mockLabReports}
          />
        ) : (
          <WeekGrid
            routine={mockWeeklyRoutine}
            deadlineDots={deadlineDots}
          />
        )}
      </div>
    </div>
  );
}
