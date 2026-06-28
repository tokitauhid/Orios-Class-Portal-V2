"use client";

import { useState } from "react";
import { subjects as initialSubjects, availableColors } from "@/lib/subjects";
import { mockWeeklyRoutine } from "@/lib/mock-data";
import RoutineEditor from "@/components/admin/RoutineEditor";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import { CalendarDays, Save, RotateCcw, BookOpen, Plus } from "lucide-react";

const colorOptions = availableColors.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));

const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "shortName", label: "Short" },
  {
    key: "color",
    label: "Color",
    render: (item) => (
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`} />
        <span className="capitalize">{item.color}</span>
      </div>
    ),
  },
  { key: "creditHours", label: "Credits" },
];

const fields = [
  { key: "id", label: "ID (slug)", type: "text", required: true, placeholder: "eee-1201" },
  { key: "code", label: "Course Code", type: "text", required: true, placeholder: "EEE 1201" },
  { key: "name", label: "Full Name", type: "text", required: true, placeholder: "Electrical Circuits" },
  { key: "shortName", label: "Short Name", type: "text", required: true, placeholder: "EEE" },
  { key: "color", label: "Color", type: "select", required: true, options: colorOptions },
  { key: "creditHours", label: "Credit Hours", type: "number", placeholder: "3" },
];

export default function AdminRoutinePage() {
  // State for Subjects (Subject management on top)
  const [subjectsData, setSubjectsData] = useState([...initialSubjects]);
  const [subjectDrawerOpen, setSubjectDrawerOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // State for Routine (Routine management below)
  const [routine, setRoutine] = useState(JSON.parse(JSON.stringify(mockWeeklyRoutine)));
  const [saved, setSaved] = useState(false);

  // Subject Handlers
  function handleEditSubject(item) {
    setEditingSubject(item);
    setSubjectDrawerOpen(true);
  }

  function handleAddSubject() {
    setEditingSubject(null);
    setSubjectDrawerOpen(true);
  }

  function handleSubjectSubmit(formData) {
    if (editingSubject) {
      setSubjectsData((prev) =>
        prev.map((s) => (s.id === editingSubject.id ? { ...editingSubject, ...formData } : s))
      );
    } else {
      setSubjectsData((prev) => [{ ...formData, id: Date.now() }, ...prev]);
    }
    setSubjectDrawerOpen(false);
    setEditingSubject(null);
  }

  function handleSubjectDelete(item) {
    setSubjectsData((prev) => prev.filter((s) => s.id !== item.id));
  }

  // Routine Handlers
  function handleSaveRoutine() {
    // In production, this would POST to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleResetRoutine() {
    setRoutine(JSON.parse(JSON.stringify(mockWeeklyRoutine)));
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-10">
      {/* 1. Subject Management Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <BookOpen size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Subject Management
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {subjectsData.length} total subjects
              </p>
            </div>
          </div>

          <button
            onClick={handleAddSubject}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2} />
            Add Subject
          </button>
        </div>

        {/* Data Table */}
        <AdminDataTable
          columns={columns}
          data={subjectsData}
          searchKeys={["code", "name", "shortName"]}
          onEdit={handleEditSubject}
          onDelete={handleSubjectDelete}
        />

        {/* Form Drawer */}
        <AdminFormDrawer
          isOpen={subjectDrawerOpen}
          onClose={() => {
            setSubjectDrawerOpen(false);
            setEditingSubject(null);
          }}
          onSubmit={handleSubjectSubmit}
          title="Subject"
          fields={fields}
          initialData={editingSubject}
        />
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800/60" />

      {/* 2. Routine Management Section */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CalendarDays size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Routine Editor
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                Click a cell to assign a subject
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetRoutine}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleSaveRoutine}
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
    </div>
  );
}
