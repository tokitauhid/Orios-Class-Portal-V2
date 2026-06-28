/**
 * Schedule Helper Utilities
 *
 * Shared functions for the schedule page and homepage.
 * All routine data operations should go through these helpers
 * to maintain a single source of truth.
 */

// ─── Day Name Mapping ─────────────────────────────────────────
// JS Date.getDay() returns 0=Sunday, 1=Monday, ..., 6=Saturday
const jsToRoutineDay = [
  "Sunday",    // 0
  "Monday",    // 1
  "Tuesday",   // 2
  "Wednesday", // 3
  "Thursday",  // 4
  "Friday",    // 5
  "Saturday",  // 6
];

/**
 * Maps a JS day index (0–6) to the routine day name.
 * @param {number} dayIndex - from new Date().getDay()
 * @returns {string} e.g. "Sunday"
 */
export function getDayName(dayIndex) {
  return jsToRoutineDay[dayIndex] || "Sunday";
}

/**
 * Returns today's day name from the routine.
 * @returns {string} e.g. "Saturday"
 */
export function getTodayName() {
  return getDayName(new Date().getDay());
}

// ─── Time Utilities ───────────────────────────────────────────

/**
 * Converts a time string like "9:00" or "14:00" to 12-hour format.
 * Uses a simple heuristic: 1:00–7:00 are treated as PM for class schedules.
 * @param {string} timeStr - e.g. "9:00", "2:00", "14:00"
 * @returns {string} e.g. "9:00 AM", "2:00 PM"
 */
export function formatTime(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return timeStr || "";
  const [hourStr, minStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const min = minStr || "00";

  // 24h format detection
  if (hour >= 13) {
    return `${hour - 12}:${min} PM`;
  }
  if (hour === 12) {
    return `12:${min} PM`;
  }
  if (hour === 0) {
    return `12:${min} AM`;
  }
  // Heuristic for class schedules: 1–7 are likely PM
  if (hour >= 1 && hour <= 7) {
    return `${hour}:${min} PM`;
  }
  return `${hour}:${min} AM`;
}

/**
 * Parses a time string to minutes since midnight (for comparison).
 * Applies the same PM heuristic as formatTime.
 * @param {string} timeStr - e.g. "9:00", "2:00"
 * @returns {number} minutes since midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [hourStr, minStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr || "0", 10);

  // Apply same PM heuristic
  if (hour >= 1 && hour <= 7) {
    hour += 12;
  }
  return hour * 60 + min;
}

// ─── Routine Data Extractors ──────────────────────────────────

/**
 * Returns today's class slots from the weekly routine (filters out nulls).
 * @param {object} routine - mockWeeklyRoutine object
 * @returns {Array} non-null class objects with their timeSlot attached
 */
export function getTodayClasses(routine) {
  if (!routine || !routine.schedule) return [];
  const today = getTodayName();
  return getClassesForDay(routine, today);
}

/**
 * Returns class slots for a specific day name.
 * @param {object} routine
 * @param {string} dayName - e.g. "Saturday"
 * @returns {Array} non-null class objects with `time` field attached
 */
export function getClassesForDay(routine, dayName) {
  if (!routine || !routine.schedule || !routine.schedule[dayName]) return [];
  const daySlots = routine.schedule[dayName];
  const classes = [];

  daySlots.forEach((slot, index) => {
    if (slot) {
      classes.push({
        ...slot,
        time: routine.timeSlots[index] || "",
        slotIndex: index,
      });
    }
  });

  return classes;
}

/**
 * Returns the class happening right now (if any).
 * Assumes each class occupies 1 hour from its start time.
 * @param {object} routine
 * @returns {object|null} class object or null
 */
export function getCurrentClass(routine) {
  const classes = getTodayClasses(routine);
  if (classes.length === 0) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const cls of classes) {
    const startMin = timeToMinutes(cls.time);
    const endMin = startMin + 60; // 1-hour slot assumption
    if (nowMinutes >= startMin && nowMinutes < endMin) {
      return cls;
    }
  }
  return null;
}

/**
 * Returns the next upcoming class today (not yet started).
 * @param {object} routine
 * @returns {object|null} class object with `minutesUntil` attached, or null
 */
export function getNextClass(routine) {
  const classes = getTodayClasses(routine);
  if (classes.length === 0) return null;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const cls of classes) {
    const startMin = timeToMinutes(cls.time);
    if (startMin > nowMinutes) {
      return { ...cls, minutesUntil: startMin - nowMinutes };
    }
  }
  return null;
}

// ─── Cross-Data Helpers ───────────────────────────────────────

/**
 * Filters assignments/lab reports that are due on a specific date.
 * Compares year-month-day only (ignores time).
 * @param {Array} items - array of objects with `dueDate` field (ISO string)
 * @param {Date} date - the date to match
 * @returns {Array} matching items
 */
export function getItemsDueOnDate(items, date) {
  if (!items || !Array.isArray(items)) return [];
  const targetDay = date.toDateString();
  return items.filter((item) => {
    if (!item.dueDate) return false;
    return new Date(item.dueDate).toDateString() === targetDay;
  });
}

/**
 * Returns items due within the next N days from a given date.
 * Excludes items due on the given date itself (those go in "Due Today").
 * @param {Array} items - array of objects with `dueDate` field
 * @param {Date} fromDate - start date
 * @param {number} daysAhead - how many days to look ahead (default 3)
 * @returns {Array} matching items, sorted by dueDate ascending
 */
export function getUpcomingItems(items, fromDate, daysAhead = 3) {
  if (!items || !Array.isArray(items)) return [];

  const startOfTomorrow = new Date(fromDate);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);

  const endDate = new Date(fromDate);
  endDate.setDate(endDate.getDate() + daysAhead + 1);
  endDate.setHours(0, 0, 0, 0);

  return items
    .filter((item) => {
      if (!item.dueDate) return false;
      const due = new Date(item.dueDate);
      return due >= startOfTomorrow && due < endDate;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}
