"use client";

import { useState, useRef, useEffect } from "react";
import { subjects, getSubject, getSubjectColor } from "@/lib/subjects";
import { useSubjectColors } from "@/lib/SubjectContext";
import { formatTime } from "@/lib/schedule-helpers";
import { X, Check, Trash2 } from "lucide-react";

/**
 * RoutineEditor — Interactive weekly schedule grid editor.
 * Click a cell to assign/edit a subject. Click X to clear it.
 */
export default function RoutineEditor({ routine, onChange }) {
  const { getColor } = useSubjectColors();
  const [activeCell, setActiveCell] = useState(null); // { day, slotIndex }
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);
  const gridRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActiveCell(null);
      }
    }
    if (activeCell) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [activeCell]);

  function handleCellClick(day, slotIndex, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const gridRect = gridRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

    setPopoverPos({
      top: rect.bottom - gridRect.top + 4,
      left: Math.min(rect.left - gridRect.left, window.innerWidth - 260),
    });
    setActiveCell({ day, slotIndex });
  }

  function assignSubject(subjectId) {
    if (!activeCell) return;
    const subject = getSubject(subjectId);
    if (!subject) return;

    const newSchedule = { ...routine.schedule };
    const daySlots = [...(newSchedule[activeCell.day] || [])];

    // Ensure array is long enough
    while (daySlots.length <= activeCell.slotIndex) daySlots.push(null);

    daySlots[activeCell.slotIndex] = {
      subjectId: subject.id,
      teacher: "",
      room: "",
      type: "lecture",
    };
    newSchedule[activeCell.day] = daySlots;
    onChange({ ...routine, schedule: newSchedule });
    setActiveCell(null);
  }

  function clearCell() {
    if (!activeCell) return;
    const newSchedule = { ...routine.schedule };
    const daySlots = [...(newSchedule[activeCell.day] || [])];
    daySlots[activeCell.slotIndex] = null;
    newSchedule[activeCell.day] = daySlots;
    onChange({ ...routine, schedule: newSchedule });
    setActiveCell(null);
  }

  function updateCellField(day, slotIndex, field, value) {
    const newSchedule = { ...routine.schedule };
    const daySlots = [...(newSchedule[day] || [])];
    if (daySlots[slotIndex]) {
      daySlots[slotIndex] = { ...daySlots[slotIndex], [field]: value };
      newSchedule[day] = daySlots;
      onChange({ ...routine, schedule: newSchedule });
    }
  }

  return (
    <div className="relative" ref={gridRef}>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            {/* Header — time slots */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900 border-b border-r border-zinc-200 dark:border-zinc-800/60 px-3 py-2.5 text-left min-w-[80px]">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                    Day
                  </span>
                </th>
                {routine.timeSlots.map((slot, i) => (
                  <th
                    key={i}
                    className="border-b border-zinc-200 dark:border-zinc-800/60 px-2 py-2.5 text-center min-w-[90px] bg-zinc-50 dark:bg-zinc-900"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                      {formatTime(slot)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body — days */}
            <tbody>
              {routine.days.map((dayName) => {
                const daySlots = routine.schedule[dayName] || [];
                return (
                  <tr key={dayName}>
                    {/* Day label */}
                    <td className="sticky left-0 z-10 border-r border-b border-zinc-200 dark:border-zinc-800/60 px-3 py-2 bg-white dark:bg-zinc-900/95">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {dayName.slice(0, 3)}
                      </span>
                    </td>

                    {/* Cells */}
                    {routine.timeSlots.map((_, slotIndex) => {
                      const slot = daySlots[slotIndex] || null;
                      const isActive = activeCell?.day === dayName && activeCell?.slotIndex === slotIndex;

                      return (
                        <td
                          key={slotIndex}
                          className={`border-b border-zinc-200 dark:border-zinc-800/60 p-1 cursor-pointer transition-colors duration-100 ${
                            isActive ? "bg-indigo-50 dark:bg-indigo-500/5" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/20"
                          }`}
                          onClick={(e) => handleCellClick(dayName, slotIndex, e)}
                        >
                          {slot ? (
                            <EditableCell
                              slot={slot}
                              getColor={getColor}
                              onFieldChange={(field, value) => updateCellField(dayName, slotIndex, field, value)}
                            />
                          ) : (
                            <div className="h-14 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800/40 flex items-center justify-center">
                              <span className="text-[10px] text-zinc-300 dark:text-zinc-700">+</span>
                            </div>
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

      {/* Subject Picker Popover */}
      {activeCell && (
        <div
          ref={popoverRef}
          className="absolute z-20 w-56 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl p-2 space-y-1 animate-fade-in"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Pick Subject
            </span>
            <div className="flex gap-1">
              {routine.schedule[activeCell.day]?.[activeCell.slotIndex] && (
                <button
                  onClick={clearCell}
                  className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Clear cell"
                >
                  <Trash2 size={12} />
                </button>
              )}
              <button
                onClick={() => setActiveCell(null)}
                className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          {subjects.map((sub) => {
            const colors = getColor(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => assignSubject(sub.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left"
              >
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {sub.code}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto">
                  {sub.shortName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * A single filled cell with inline-editable teacher, room, and type fields.
 */
function EditableCell({ slot, getColor, onFieldChange }) {
  const subject = getSubject(slot.subjectId);
  const colors = getColor(slot.subjectId);
  const subjectCode = subject ? subject.shortName || subject.code : slot.subjectId;

  return (
    <div className={`h-14 rounded-lg px-2 py-1 flex flex-col justify-center ${colors.bg} ${colors.border} border`}>
      <div className="flex items-center gap-1 mb-0.5">
        <span className={`text-[11px] font-bold leading-tight ${colors.text}`}>
          {subjectCode}
        </span>
        <select
          value={slot.type || "lecture"}
          onChange={(e) => { e.stopPropagation(); onFieldChange("type", e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          className="text-[8px] font-semibold uppercase bg-transparent border-none outline-none cursor-pointer text-zinc-500 dark:text-zinc-400 ml-auto"
        >
          <option value="lecture">LEC</option>
          <option value="lab">LAB</option>
        </select>
      </div>
      <input
        type="text"
        value={slot.room || ""}
        onChange={(e) => onFieldChange("room", e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder="Room"
        className="text-[9px] bg-transparent border-none outline-none text-zinc-500 dark:text-zinc-500 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 w-full leading-tight"
      />
    </div>
  );
}
