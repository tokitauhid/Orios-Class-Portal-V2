"use client";

import { useState, useMemo, useEffect } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import {
  getTodayName,
  getNextClass,
  getItemsDueOnDate,
} from "@/lib/schedule-helpers";
import DayView from "@/components/DayView";
import WeekGrid from "@/components/WeekGrid";
import { CalendarDays, Clock, LayoutGrid, List } from "lucide-react";

// Standard timeslots and days for the schedule
const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00"];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState("day"); // "day" | "week"
  const [activeDay, setActiveDay] = useState(getTodayName());
  const [mounted, setMounted] = useState(false);
  const { getColor, getSubject, isLoading: subjectsLoading } = useSubjectColors();

  const [weeklyRoutine, setWeeklyRoutine] = useState({ timeSlots, days, schedule: {} });
  const [assignments, setAssignments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadScheduleData() {
      try {
        const [routRes, teachRes, assignRes, labRes, examsRes, notesRes, filesRes] = await Promise.all([
          supabase.from("routine").select("*"),
          supabase.from("teachers").select("id, name"),
          supabase.from("assignments").select("*"),
          supabase.from("lab_reports").select("*"),
          supabase.from("exams").select("*"),
          supabase.from("notes").select("id, title, url"),
          supabase.from("files").select("id, name, url"),
        ]);

        if (routRes.error) throw routRes.error;
        if (teachRes.error) throw teachRes.error;
        if (assignRes.error) throw assignRes.error;
        if (labRes.error) throw labRes.error;
        if (examsRes.error) throw examsRes.error;

        const dbRoutine = routRes.data || [];
        const dbTeachers = teachRes.data || [];
        const dbAssignments = assignRes.data || [];
        const dbLabReports = labRes.data || [];
        const dbExams = examsRes.data || [];
        const dbNotes = notesRes.data || [];
        const dbFiles = filesRes.data || [];

        // Map Routine Slots to Weekly Routine
        const schedule = {};
        days.forEach((d) => {
          schedule[d] = Array(8).fill(null);
        });

        dbRoutine.forEach((row) => {
          const day = row.day_name;
          const index = row.time_slot_index;
          if (schedule[day] && index >= 0 && index < 8) {
            const teacherObj = dbTeachers.find((t) => t.id === row.teacher_id);
            schedule[day][index] = {
              subjectId: row.subject_id,
              teacher: teacherObj ? teacherObj.name : "",
              room: row.room || "",
              type: row.type || "lecture",
            };
          }
        });

        setWeeklyRoutine({ timeSlots, days, schedule });

        // Map Assignments
        setAssignments(
          (assignRes.data || []).map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            subjectId: a.subject_id,
            dueDate: a.due_date,
            status: a.status,
            file: a.file_url,
          }))
        );

        // Map Lab Reports
        setLabReports(
          dbLabReports.map((l) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            subjectId: l.subject_id,
            labNumber: l.lab_number,
            dueDate: l.due_date,
            status: l.status,
            file: l.file_url,
          }))
        );

        // Map Exams
        const mappedExams = dbExams.map((e) => {
          let fileUrl = "";
          let resourceTitle = "";
          if (e.resource_type === "note") {
            const res = dbNotes.find((n) => n.id === e.resource_id);
            fileUrl = res?.url || "";
            resourceTitle = res?.title || "";
          } else if (e.resource_type === "assignment") {
            const res = dbAssignments.find((a) => a.id === e.resource_id);
            fileUrl = res?.file_url || "";
            resourceTitle = res?.title || "";
          } else if (e.resource_type === "lab_report") {
            const res = dbLabReports.find((l) => l.id === e.resource_id);
            fileUrl = res?.file_url || "";
            resourceTitle = res?.title || "";
          } else if (e.resource_type === "file") {
            const res = dbFiles.find((f) => f.id === e.resource_id);
            fileUrl = res?.url || "";
            resourceTitle = res?.name || "";
          }

          return {
            id: e.id,
            title: e.title,
            description: e.description,
            subjectId: e.subject_id,
            examDate: e.exam_date,
            resourceType: e.resource_type,
            resourceId: e.resource_id,
            fileUrl,
            resourceTitle: resourceTitle || e.title,
          };
        });
        setExams(mappedExams);
      } catch (err) {
        console.error("Error loading schedule data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadScheduleData();
  }, []);

  // "Next Up" card data
  const nextClass = useMemo(() => {
    if (!mounted || loading) return null;
    return getNextClass(weeklyRoutine);
  }, [mounted, loading, weeklyRoutine]);

  // Calculate deadline dots for week grid (count of items due per day)
  const deadlineDots = useMemo(() => {
    const dots = {};
    const today = new Date();
    const jsRoutineDayMap = {
      Saturday: 6, Sunday: 0, Monday: 1, Tuesday: 2,
      Wednesday: 3, Thursday: 4, Friday: 5,
    };

    days.forEach((dayName) => {
      const targetJsDay = jsRoutineDayMap[dayName];
      if (targetJsDay === undefined) return;

      const todayDayIndex = today.getDay();
      let diff = targetJsDay - todayDayIndex;
      if (diff < 0) diff += 7;

      const d = new Date(today);
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);

      const allItems = [
        ...assignments,
        ...labReports,
        ...exams.map(e => ({ ...e, dueDate: e.examDate }))
      ];
      const dueItems = getItemsDueOnDate(allItems, d);
      if (dueItems.length > 0) {
        dots[dayName] = dueItems.length;
      }
    });

    return dots;
  }, [assignments, labReports, exams]);

  if (loading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-5 md:px-6 pb-20 md:pb-10 mt-4 md:mt-6">
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
            routine={weeklyRoutine}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            assignments={assignments}
            labReports={labReports}
            exams={exams}
          />
        ) : (
          <WeekGrid
            routine={weeklyRoutine}
            deadlineDots={deadlineDots}
          />
        )}
      </div>
    </div>
  );
}
