export default function ScheduleCard({ time, subject, teacher, room, type }) {
  const isLab = type === "lab";

  // Convert 24h time to 12h format
  function formatTime(timeStr) {
    if (!timeStr || !timeStr.includes(":")) return timeStr;
    const [hourStr, minStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const isPM = hour >= 12 || (hour >= 1 && hour <= 7);
    const suffix = isPM ? "PM" : "AM";
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return `${hour}:${minStr || "00"} ${suffix}`;
  }

  return (
    <div className="flex items-stretch gap-3 group">
      {/* Time column */}
      <div className="flex flex-col items-center w-16 shrink-0 pt-1">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatTime(time)}
        </span>
      </div>

      {/* Connector line */}
      <div className="flex flex-col items-center w-3 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full border-2 mt-1.5 ${
          isLab
            ? "border-emerald-500 dark:border-emerald-400 bg-emerald-100 dark:bg-emerald-500/20"
            : "border-indigo-500 dark:border-indigo-400 bg-indigo-100 dark:bg-indigo-500/20"
        }`} />
        <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Content card */}
      <div className="flex-1 pb-4">
        <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 p-3.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {subject}
            </h4>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isLab
                ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
            }`}>
              {isLab ? "Lab" : "Lecture"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {room} · {teacher}
          </p>
        </div>
      </div>
    </div>
  );
}
