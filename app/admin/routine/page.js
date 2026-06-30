"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { availableColors } from "@/lib/subjects";
import { createClient } from "@/lib/supabase/client";
import RoutineEditor from "@/components/admin/RoutineEditor";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminFormDrawer from "@/components/admin/AdminFormDrawer";
import { CalendarDays, Save, RotateCcw, BookOpen, Plus, X } from "lucide-react";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const defaultTimeSlots = ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00"];

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
        <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`} style={{ backgroundColor: `var(--color-${item.color}-500)` }} />
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
  const { subjects, isLoading: subjectsLoading } = useSubjectColors();
  const supabase = createClient();

  // State for Subjects (managed dynamically in DB)
  const [subjectsData, setSubjectsData] = useState([]);
  const [subjectDrawerOpen, setSubjectDrawerOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // State for Routine
  const [routine, setRoutine] = useState({ timeSlots: [], days, schedule: {} });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Load routine and teachers data
  const loadRoutineData = async () => {
    try {
      const [routRes, teachRes, subRes, slotsRes] = await Promise.all([
        supabase.from("routine").select("*"),
        supabase.from("teachers").select("id, name"),
        supabase.from("subjects").select("*").order("code", { ascending: true }),
        supabase.from("time_slots").select("*").order("sort_order", { ascending: true }),
      ]);

      if (routRes.error) throw routRes.error;
      if (teachRes.error) throw teachRes.error;
      if (subRes.error) throw subRes.error;
      if (slotsRes.error) throw slotsRes.error;

      const dbTeachers = teachRes.data || [];
      setTeachers(dbTeachers);

      // Load Subjects List
      const mappedSubjects = (subRes.data || []).map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        shortName: s.short_name,
        color: s.color,
        creditHours: Number(s.credit_hours),
      }));
      setSubjectsData(mappedSubjects);

      // Load Time Slots
      const dbSlots = (slotsRes.data && slotsRes.data.length > 0)
        ? slotsRes.data.map((s) => s.time_label)
        : defaultTimeSlots;

      // Map routine
      const schedule = {};
      days.forEach((d) => {
        schedule[d] = Array(dbSlots.length).fill(null);
      });

      (routRes.data || []).forEach((row) => {
        const day = row.day_name;
        const index = row.time_slot_index;
        if (schedule[day] && index >= 0 && index < dbSlots.length) {
          const teacherObj = dbTeachers.find((t) => t.id === row.teacher_id);
          schedule[day][index] = {
            subjectId: row.subject_id,
            teacher: teacherObj ? teacherObj.name : "",
            room: row.room || "",
            type: row.type || "lecture",
          };
        }
      });

      setRoutine({ timeSlots: dbSlots, days, schedule });
    } catch (err) {
      console.error("Error loading routine page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutineData();
  }, []);

  // Subject Handlers
  async function handleAddSubject() {
    setEditingSubject(null);
    setSubjectDrawerOpen(true);
  }

  async function handleEditSubject(item) {
    setEditingSubject(item);
    setSubjectDrawerOpen(true);
  }

  async function handleSubjectSubmit(formData) {
    try {
      if (editingSubject) {
        // Update subject
        const { error } = await supabase
          .from("subjects")
          .update({
            code: formData.code,
            name: formData.name,
            short_name: formData.shortName,
            color: formData.color,
            credit_hours: Number(formData.creditHours),
          })
          .eq("id", editingSubject.id);

        if (error) throw error;
      } else {
        // Add new subject
        const { error } = await supabase.from("subjects").insert([
          {
            id: formData.id,
            code: formData.code,
            name: formData.name,
            short_name: formData.shortName,
            color: formData.color,
            credit_hours: Number(formData.creditHours),
          },
        ]);

        if (error) throw error;
      }
      setSubjectDrawerOpen(false);
      setEditingSubject(null);
      loadRoutineData(); // reload
    } catch (err) {
      alert(err.message || "Failed to save subject");
    }
  }

  async function handleSubjectDelete(item) {
    try {
      const { error } = await supabase.from("subjects").delete().eq("id", item.id);
      if (error) throw error;
      loadRoutineData();
    } catch (err) {
      alert(err.message || "Failed to delete subject");
    }
  }

  // Helper to match teacher name to DB ID
  const getTeacherIdByName = (name) => {
    if (!name) return null;
    const found = teachers.find(
      (t) =>
        t.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(t.name.toLowerCase())
    );
    return found ? found.id : null;
  };

  // Routine Handlers
  async function handleSaveRoutine() {
    try {
      setLoading(true);

      // 1. Delete all old time slots
      const { error: delSlotsErr } = await supabase
        .from("time_slots")
        .delete()
        .neq("id", 0); // deletes all rows

      if (delSlotsErr) throw delSlotsErr;

      // 2. Insert new time slots
      const slotsToInsert = routine.timeSlots.map((slot, index) => ({
        time_label: slot,
        sort_order: index,
      }));

      const { error: insSlotsErr } = await supabase.from("time_slots").insert(slotsToInsert);
      if (insSlotsErr) throw insSlotsErr;

      // 3. Delete all old routine slots
      const { error: delErr } = await supabase
        .from("routine")
        .delete()
        .neq("day_name", ""); // deletes all rows

      if (delErr) throw delErr;

      // 4. Prepare new routine slots
      const routineSlotsToInsert = [];
      Object.keys(routine.schedule).forEach((dayName) => {
        const slots = routine.schedule[dayName] || [];
        slots.forEach((slot, index) => {
          if (slot && index < routine.timeSlots.length) {
            routineSlotsToInsert.push({
              day_name: dayName,
              time_slot_index: index,
              subject_id: slot.subjectId,
              teacher_id: getTeacherIdByName(slot.teacher),
              room: slot.room || "",
              type: slot.type || "lecture",
            });
          }
        });
      });

      // 5. Insert new routine slots if any
      if (routineSlotsToInsert.length > 0) {
        const { error: insErr } = await supabase.from("routine").insert(routineSlotsToInsert);
        if (insErr) throw insErr;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message || "Failed to save schedule routine");
    } finally {
      setLoading(false);
    }
  }

  function handleResetRoutine() {
    loadRoutineData();
  }

  function handleAddTimeSlot() {
    const newSlots = [...routine.timeSlots, "4:00"];
    const newSchedule = { ...routine.schedule };
    Object.keys(newSchedule).forEach((day) => {
      newSchedule[day] = [...(newSchedule[day] || []), null];
    });
    setRoutine({ ...routine, timeSlots: newSlots, schedule: newSchedule });
  }

  function handleEditTimeSlot(index, value) {
    const newSlots = [...routine.timeSlots];
    newSlots[index] = value;
    setRoutine({ ...routine, timeSlots: newSlots });
  }

  function handleRemoveTimeSlot(index) {
    if (routine.timeSlots.length <= 1) {
      alert("At least one time slot is required.");
      return;
    }
    const newSlots = [...routine.timeSlots];
    newSlots.splice(index, 1);

    const newSchedule = { ...routine.schedule };
    Object.keys(newSchedule).forEach((day) => {
      const daySlots = [...(newSchedule[day] || [])];
      daySlots.splice(index, 1);
      newSchedule[day] = daySlots;
    });

    setRoutine({ ...routine, timeSlots: newSlots, schedule: newSchedule });
  }

  if (loading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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

        {/* Time Slots Manager */}
        <div className="mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Time Slots Configuration
            </h3>
            <button
              onClick={handleAddTimeSlot}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus size={12} strokeWidth={2.5} />
              Add Slot
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {routine.timeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => handleEditTimeSlot(index, e.target.value)}
                  className="w-16 text-center text-xs bg-transparent border-none outline-none font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-indigo-500/30 rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTimeSlot(index)}
                  className="text-red-500 hover:text-red-650 p-0.5 rounded transition-colors"
                  title="Delete slot"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-505 mt-2 leading-relaxed">
            * Note: Removing a time slot will shift all classes for that day. Remember to click "Save" above to apply your changes.
          </p>
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
