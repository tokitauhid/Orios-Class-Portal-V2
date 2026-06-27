"use client";

import { useState, useEffect } from "react";

function getTimeRemaining(targetDate) {
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    expired: false,
  };
}

const typeStyles = {
  exam: "border-red-500/20 dark:border-red-400/20 bg-red-50 dark:bg-red-500/5",
  lab: "border-emerald-500/20 dark:border-emerald-400/20 bg-emerald-50 dark:bg-emerald-500/5",
  assignment: "border-amber-500/20 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-500/5",
};

const typeBadgeStyles = {
  exam: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
  lab: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  assignment: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export default function CountdownCard({ title, date, type = "exam", subject }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(getTimeRemaining(date));

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(getTimeRemaining(date));
    }, 1000); // Update every second to be safe
    return () => clearInterval(interval);
  }, [date]);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`
        rounded-xl border p-3 md:p-4 transition-all duration-200 hover:scale-[1.01]
        ${typeStyles[type] || "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}
      `}
    >
      {/* Mobile: compact row with prominent date */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded-full ${typeBadgeStyles[type] || ""}`}>
            {type}
          </span>
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-1">
            {title}
          </h3>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {formattedDate}
          </span>
          {!mounted ? (
            <span className="opacity-0 text-[10px]">00:00:00</span>
          ) : time.expired ? (
            <span className="text-[10px] text-zinc-400 italic">Passed</span>
          ) : (
            <span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400 mt-0.5">
              {String(time.days).padStart(2, "0")}d {String(time.hours).padStart(2, "0")}h {String(time.minutes).padStart(2, "0")}m
            </span>
          )}
        </div>
      </div>

      {/* Desktop: full card layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeBadgeStyles[type] || ""}`}>
            {type}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1 truncate">
          {title}
        </h3>
        {subject && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-3">
            {subject}
          </p>
        )}

        {/* Countdown digits */}
        {!mounted ? (
          <div className="flex items-baseline gap-3 opacity-0">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums">00</span>
            </div>
          </div>
        ) : time.expired ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">
            Event has passed
          </p>
        ) : (
          <div className="flex items-baseline gap-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {String(time.days).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                days
              </span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700 text-lg font-light">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {String(time.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                hrs
              </span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700 text-lg font-light">:</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {String(time.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                min
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
