"use client";

import { useMemo } from "react";
import ScheduleCard from "@/components/ScheduleCard";
import { useSubjectColors } from "@/lib/SubjectContext";
import {
  getClassesForDay,
  getItemsDueOnDate,
  getUpcomingItems,
  getTodayName,
  timeToMinutes,
} from "@/lib/schedule-helpers";
import { ClipboardList, FlaskConical, ArrowRight, BookOpen } from "lucide-react";
import { triggerDownload } from "@/lib/download";

/**
 * DayView — Daily planner hub.
 * Shows classes, due items, and upcoming deadlines for the selected day.
 */
export default function DayView({
  routine,
  activeDay,
  onDayChange,
  assignments = [],
  labReports = [],
  exams = [],
}) {
  const { getColor, getSubject } = useSubjectColors();
  const todayName = getTodayName();


  // Classes for the selected day
  const dayClasses = useMemo(
    () => getClassesForDay(routine, activeDay),
    [routine, activeDay]
  );

  // Determine if a class is happening "now"
  const currentSlotTime = useMemo(() => {
    if (activeDay !== todayName) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const cls of dayClasses) {
      const startMin = timeToMinutes(cls.time);
      const endMin = startMin + 60;
      if (nowMinutes >= startMin && nowMinutes < endMin) {
        return cls.time;
      }
    }
    return null;
  }, [activeDay, todayName, dayClasses]);

  // Build a date object for the selected day (for filtering assignments/labs)
  const selectedDate = useMemo(() => {
    const today = new Date();
    const todayDayIndex = today.getDay();
    const routineDayIndex = routine.days.indexOf(activeDay);
    // Map routine day index to JS day index
    // routine.days: ["Saturday", "Sunday", ...] 
    // JS: 0=Sunday, 1=Monday, ... 6=Saturday
    const jsRoutineDayMap = {
      Saturday: 6, Sunday: 0, Monday: 1, Tuesday: 2,
      Wednesday: 3, Thursday: 4, Friday: 5,
    };
    const targetJsDay = jsRoutineDayMap[activeDay];
    if (targetJsDay === undefined) return today;

    let diff = targetJsDay - todayDayIndex;
    // Show the upcoming occurrence (this week)
    if (diff < 0) diff += 7;

    const d = new Date(today);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [activeDay, routine.days]);

  // Items due on the selected day
  const dueToday = useMemo(() => {
    const allItems = [
      ...assignments.map((a) => ({ ...a, _type: "assignment" })),
      ...labReports.map((r) => ({ ...r, _type: "lab" })),
    ];
    return getItemsDueOnDate(allItems, selectedDate);
  }, [assignments, labReports, selectedDate]);

  // Exams scheduled for the selected day
  const examsToday = useMemo(() => {
    const items = exams.map(e => ({ ...e, dueDate: e.examDate }));
    return getItemsDueOnDate(items, selectedDate);
  }, [exams, selectedDate]);

  console.log("DayView Debug:", { activeDay, selectedDate: selectedDate?.toDateString(), exams, examsToday });

  // Upcoming items (next 3 days from selected day)
  const comingUp = useMemo(() => {
    if (activeDay !== todayName) return []; // Only show for today
    const allItems = [
      ...assignments.filter((a) => a.status === "pending").map((a) => ({ ...a, _type: "assignment" })),
      ...labReports.filter((r) => r.status === "pending").map((r) => ({ ...r, _type: "lab" })),
      ...exams.map((e) => ({ ...e, dueDate: e.examDate, _type: "exam" })),
    ];
    return getUpcomingItems(allItems, selectedDate, 3);
  }, [assignments, labReports, exams, selectedDate, activeDay, todayName]);

  return (
    <div className="space-y-5">
      {/* Day Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-hide">
        {routine.days.map((day) => {
          const isActive = day === activeDay;
          const isToday = day === todayName;

          return (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`
                shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl
                text-xs font-medium transition-all duration-150
                ${isActive
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700"
                }
              `}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && !isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-500 dark:bg-indigo-400" />
              )}
              {isToday && isActive && (
                <span className="w-1 h-1 rounded-full bg-white/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section: Exams Today ── */}
      {examsToday.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3">
            Exams Today
          </h3>
          <div className="space-y-2">
            {examsToday.map((exam) => {
              const subject = getSubject(exam.subjectId);
              const colors = getColor(exam.subjectId);
              const hasFile = !!exam.fileUrl;

              return (
                <div
                  key={`exam-${exam.id}`}
                  onClick={() => {
                    if (hasFile) {
                      triggerDownload(exam.fileUrl, exam.resourceTitle || exam.title);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/[0.03] dark:bg-red-500/[0.02] border border-red-500/10 dark:border-red-500/10 hover:border-red-500/20 dark:hover:border-red-500/20 ${
                    hasFile ? "cursor-pointer active:scale-[0.99]" : ""
                  } transition-all duration-150 group`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.bg}`}>
                    <BookOpen size={14} strokeWidth={1.8} className={colors.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {exam.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      <span className={`font-semibold ${colors.text}`}>
                        {subject ? subject.code : exam.subjectId}
                      </span>
                      {exam.description && ` · ${exam.description}`}
                      {hasFile && " · 📄 Click to download study resource"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 1: Classes ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-3">
          Classes
        </h3>
        <div className="rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/40 p-4 md:p-5">
          {dayClasses.length > 0 ? (
            <div>
              {dayClasses.map((cls, index) => {
                const subject = getSubject(cls.subjectId);
                const isNow = currentSlotTime === cls.time;
                return (
                  <ScheduleCard
                    key={`${cls.subjectId}-${index}`}
                    time={cls.time}
                    subject={subject ? subject.code : cls.subjectId}
                    teacher={cls.teacher}
                    room={cls.room}
                    type={cls.type}
                    isNow={isNow}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-600">
              <span className="text-2xl mb-2 block">🎉</span>
              <p className="text-sm">No classes{activeDay === todayName ? " today" : ` on ${activeDay}`}!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 2: Due Today ── */}
      {dueToday.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-3">
            Due {activeDay === todayName ? "Today" : `on ${activeDay}`}
          </h3>
          <div className="space-y-2">
            {dueToday.map((item) => {
              const subject = getSubject(item.subjectId);
              const colors = getColor(item.subjectId);
              const Icon = item._type === "lab" ? FlaskConical : ClipboardList;
              const typeLabel = item._type === "lab" ? "Lab Report" : "Assignment";

              return (
                <div
                  key={`${item._type}-${item.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.bg}`}>
                    <Icon size={14} strokeWidth={1.8} className={colors.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      <span className={`font-medium ${colors.muted}`}>
                        {subject ? subject.code : item.subjectId}
                      </span>
                      {" · "}{typeLabel}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                    item.status === "pending"
                      ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : item.status === "submitted"
                      ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 3: Coming Up (only when viewing today) ── */}
      {comingUp.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-3 flex items-center gap-1.5">
            Coming Up
            <ArrowRight size={12} />
          </h3>
          <div className="space-y-2">
            {comingUp.map((item) => {
              const subject = getSubject(item.subjectId);
              const colors = getColor(item.subjectId);
              const isExam = item._type === "exam";
              const Icon = isExam ? BookOpen : item._type === "lab" ? FlaskConical : ClipboardList;
              const typeLabel = isExam ? "Exam" : item._type === "lab" ? "Lab Report" : "Assignment";
              const dueDate = new Date(item.dueDate);
              const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
              const hasFile = isExam && !!item.fileUrl;

              return (
                <div
                  key={`upcoming-${item._type}-${item.id}`}
                  onClick={() => {
                    if (hasFile) {
                      triggerDownload(item.fileUrl, item.resourceTitle || item.title);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-150 ${
                    hasFile ? "cursor-pointer active:scale-[0.99]" : ""
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colors.bg}`}>
                    <Icon size={14} strokeWidth={1.8} className={colors.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                      <span className={`font-medium ${colors.muted}`}>
                        {subject ? subject.code : item.subjectId}
                      </span>
                      {" · "}{typeLabel}
                      {hasFile && " · 📄 Click to download study resource"}
                    </p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium ${
                    daysLeft <= 2 ? "text-red-500 dark:text-red-400" : "text-zinc-400 dark:text-zinc-600"
                  }`}>
                    {daysLeft}d
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
