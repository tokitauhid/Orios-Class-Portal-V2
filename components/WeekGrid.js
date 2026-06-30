"use client";

import { useMemo } from "react";
import { getSubject, getSubjectColor } from "@/lib/subjects";
import { useSubjectColors } from "@/lib/SubjectContext";
import { formatTime, getTodayName, timeToMinutes } from "@/lib/schedule-helpers";

/**
 * WeekGrid — Screenshot-friendly timetable grid.
 * Days on Y-axis, Time slots on X-axis.
 * Horizontally scrollable on mobile with sticky day column.
 */
export default function WeekGrid({ routine, deadlineDots = {} }) {
  const { getColor } = useSubjectColors();
  const todayName = getTodayName();

  // Determine current slot for "now" highlighting
  const currentSlotInfo = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const todaySchedule = routine.schedule[todayName];
    if (!todaySchedule) return null;

    for (let i = 0; i < routine.timeSlots.length; i++) {
      const startMin = timeToMinutes(routine.timeSlots[i]);
      const endMin = i < routine.timeSlots.length - 1
        ? timeToMinutes(routine.timeSlots[i + 1])
        : startMin + 60;
      if (nowMinutes >= startMin && nowMinutes < endMin) {
        return { day: todayName, slotIndex: i };
      }
    }
    return null;
  }, [routine, todayName]);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          {/* Header row — time labels */}
          <thead>
            <tr>
              {/* Day column header */}
              <th className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900 border-b border-r border-zinc-200 dark:border-zinc-800/60 px-3 py-2.5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                  Day
                </span>
              </th>
              {routine.timeSlots.map((slot, i) => {
                const isNowCol = currentSlotInfo && currentSlotInfo.slotIndex === i;
                return (
                  <th
                    key={i}
                    className={`border-b border-zinc-200 dark:border-zinc-800/60 px-2 py-2.5 text-center min-w-[80px] ${
                      isNowCol
                        ? "bg-indigo-50 dark:bg-indigo-500/5"
                        : "bg-zinc-50 dark:bg-zinc-900"
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isNowCol
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}>
                      {formatTime(slot)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body — one row per day */}
          <tbody>
            {routine.days.map((dayName) => {
              const isToday = dayName === todayName;
              const daySlots = routine.schedule[dayName] || [];
              const dots = deadlineDots[dayName] || 0;

              return (
                <tr
                  key={dayName}
                  className={isToday ? "bg-indigo-50/30 dark:bg-indigo-500/[0.03]" : ""}
                >
                  {/* Sticky day label */}
                  <td className={`sticky left-0 z-10 border-r border-b border-zinc-200 dark:border-zinc-800/60 px-3 py-2 ${
                    isToday
                      ? "bg-indigo-50/80 dark:bg-zinc-900/95"
                      : "bg-white dark:bg-zinc-900/95"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-semibold ${
                        isToday
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}>
                        {dayName.slice(0, 3)}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                      )}
                      {/* Deadline dots */}
                      {dots > 0 && (
                        <div className="flex gap-0.5 ml-0.5">
                          {Array.from({ length: Math.min(dots, 3) }).map((_, di) => (
                            <span key={di} className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Time slot cells */}
                  {routine.timeSlots.map((_, slotIndex) => {
                    const slot = daySlots[slotIndex] || null;
                    const isNowCell = currentSlotInfo
                      && currentSlotInfo.day === dayName
                      && currentSlotInfo.slotIndex === slotIndex;

                    return (
                      <td
                        key={slotIndex}
                        className={`border-b border-zinc-200 dark:border-zinc-800/60 p-1 ${
                          isNowCell ? "ring-1 ring-inset ring-indigo-400/50 dark:ring-indigo-500/40" : ""
                        }`}
                      >
                        {slot ? (
                          <GridCell slot={slot} isNow={isNowCell} getColor={getColor} />
                        ) : (
                          <div className="h-12 rounded-lg border border-dashed border-zinc-100 dark:border-zinc-800/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * A single filled cell in the week grid.
 */
function GridCell({ slot, isNow, getColor }) {
  const subject = getSubject(slot.subjectId);
  const colors = getColor(slot.subjectId);
  const subjectCode = subject ? subject.code || subject.shortName : slot.subjectId;
  const isLab = slot.type === "lab";

  return (
    <div
      className={`h-12 rounded-lg px-2 py-1.5 flex flex-col justify-center border transition-colors duration-150 ${
        colors.bg
      } ${colors.border} ${
        isNow ? "ring-1 ring-indigo-400 dark:ring-indigo-500 shadow-sm shadow-indigo-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        <span className={`text-[11px] font-bold leading-tight ${colors.text}`}>
          {subjectCode}
        </span>
        {isLab && (
          <span className="text-[8px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Lab
          </span>
        )}
      </div>
      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 leading-tight truncate">
        {slot.room}
      </span>
    </div>
  );
}
