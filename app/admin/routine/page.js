"use client";

import { useState } from "react";
import { mockWeeklyRoutine } from "@/lib/mock-data";
import RoutineEditor from "@/components/admin/RoutineEditor";
import { CalendarDays, Save, RotateCcw } from "lucide-react";

export default function AdminRoutinePage() {
  const [routine, setRoutine] = useState(JSON.parse(JSON.stringify(mockWeeklyRoutine)));
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // In production, this would POST to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setRoutine(JSON.parse(JSON.stringify(mockWeeklyRoutine)));
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <CalendarDays size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Routine Editor
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Click a cell to assign a subject
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150 shadow-sm ${
              saved
                ? "bg-emerald-500"
                : "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
            }`}
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <RoutineEditor routine={routine} onChange={setRoutine} />

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
        <span>Click cell → pick subject</span>
        <span>·</span>
        <span>Edit room & type inline</span>
        <span>·</span>
        <span>Empty cell = free period</span>
      </div>
    </div>
  );
}
