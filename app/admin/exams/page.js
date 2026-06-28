"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { BookOpen, Calendar, X, Plus } from "lucide-react";

export default function AdminExamsPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form options data
  const [notes, setNotes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [files, setFiles] = useState([]);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [resourceType, setResourceType] = useState("none");
  const [resourceId, setResourceId] = useState("");

  const supabase = createClient();

  // Load all required data
  async function loadData() {
    try {
      setLoading(true);
      const [examsRes, notesRes, assignRes, labsRes, filesRes] = await Promise.all([
        supabase.from("exams").select("*").order("exam_date", { ascending: true }),
        supabase.from("notes").select("id, title, subject_id, url"),
        supabase.from("assignments").select("id, title, subject_id, file_url"),
        supabase.from("lab_reports").select("id, title, lab_number, subject_id, file_url"),
        supabase.from("files").select("id, name, subject_id, url"),
      ]);

      if (examsRes.error) throw examsRes.error;

      setNotes(notesRes.data || []);
      setAssignments(assignRes.data || []);
      setLabReports(labsRes.data || []);
      setFiles(filesRes.data || []);

      setData(examsRes.data || []);
    } catch (err) {
      console.error("Error loading exams data:", err);
      alert("Failed to load exams data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered resource options based on selected subjectId and resourceType
  const resourceOptions = useMemo(() => {
    if (resourceType === "none") return [];

    let rawList = [];
    if (resourceType === "note") {
      rawList = notes.map(n => ({ id: n.id, title: n.title, subject_id: n.subject_id }));
    } else if (resourceType === "assignment") {
      rawList = assignments.map(a => ({ id: a.id, title: a.title, subject_id: a.subject_id }));
    } else if (resourceType === "lab_report") {
      rawList = labReports.map(l => ({ id: l.id, title: `Lab ${l.lab_number}: ${l.title}`, subject_id: l.subject_id }));
    } else if (resourceType === "file") {
      rawList = files.map(f => ({ id: f.id, title: f.name, subject_id: f.subject_id }));
    }

    // Filter by subject if chosen
    if (subjectId) {
      rawList = rawList.filter(item => item.subject_id === subjectId);
    }

    return rawList.map(item => {
      const subjectObj = getSubject(item.subject_id);
      const subjectCode = subjectObj ? subjectObj.code : item.subject_id;
      return {
        value: item.id,
        label: `[${subjectCode}] ${item.title}`,
      };
    });
  }, [resourceType, subjectId, notes, assignments, labReports, files, getSubject]);

  // Open drawer for Add Mode
  function handleOpenAdd() {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setSubjectId(subjects[0]?.id || "");
    // Default to today at current hour
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);
    setExamDate(localISOTime);
    setResourceType("none");
    setResourceId("");
    setIsDrawerOpen(true);
  }

  // Open drawer for Edit Mode
  function handleOpenEdit(item) {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setSubjectId(item.subject_id);
    
    // Format exam_date for datetime-local (YYYY-MM-DDTHH:MM)
    const dateObj = new Date(item.exam_date);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateObj - tzOffset).toISOString().slice(0, 16);
    setExamDate(localISOTime);
    
    setResourceType(item.resource_type || "none");
    setResourceId(item.resource_id ? String(item.resource_id) : "");
    setIsDrawerOpen(true);
  }

  // Handle Form Submit
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !subjectId || !examDate) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      title,
      description: description || null,
      subject_id: subjectId,
      exam_date: new Date(examDate).toISOString(),
      resource_type: resourceType,
      resource_id: resourceType !== "none" && resourceId ? parseInt(resourceId) : null,
    };

    try {
      if (editingItem) {
        // Update
        const { data: updated, error } = await supabase
          .from("exams")
          .update(payload)
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;
        setData(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      } else {
        // Create
        const { data: inserted, error } = await supabase
          .from("exams")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        setData(prev => [...prev, inserted]);
      }
      setIsDrawerOpen(false);
    } catch (err) {
      alert("Error saving exam: " + err.message);
    }
  }

  // Delete Item
  async function handleDelete(item) {
    try {
      const { error } = await supabase.from("exams").delete().eq("id", item.id);
      if (error) throw error;
      setData(prev => prev.filter(e => e.id !== item.id));
    } catch (err) {
      alert("Error deleting exam: " + err.message);
    }
  }

  // Table Columns config
  const columns = useMemo(() => [
    { key: "title", label: "Title" },
    {
      key: "subject_id",
      label: "Subject",
      render: (item) => {
        const s = getSubject(item.subject_id);
        return s ? s.code : item.subject_id;
      },
    },
    {
      key: "exam_date",
      label: "Exam Date",
      render: (item) => {
        return new Date(item.exam_date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      },
    },
    {
      key: "resource_type",
      label: "Linked Resource",
      render: (item) => {
        if (!item.resource_type || item.resource_type === "none") return "None";
        return `${item.resource_type.toUpperCase().replace("_", " ")}`;
      },
    },
  ], [getSubject]);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: s.id, label: s.code }));
  }, [subjects]);

  if (loading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Exam Schedule
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              Manage student exam dates and link study materials
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Exam
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm">
        <AdminDataTable
          columns={columns}
          data={data}
          searchKeys={["title", "description"]}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[75] w-full max-w-md flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800/60 shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-200 dark:border-zinc-800/60 shrink-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {editingItem ? "Edit Exam" : "Add Exam"}
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Midterm Examination"
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief exam syllabus or instructions"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150 resize-none"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150"
            >
              {subjectOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150"
            />
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Link Study Resource (Optional)
            </label>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setResourceId("");
              }}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150"
            >
              <option value="none">No Resource Linked</option>
              <option value="note">Notes</option>
              <option value="assignment">Assignments</option>
              <option value="lab_report">Lab Reports</option>
              <option value="file">Files Page Uploads</option>
            </select>
          </div>

          {/* Resource Dropdown (Dynamic) */}
          {resourceType !== "none" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Select {resourceType.replace("_", " ")} Resource <span className="text-red-500">*</span>
              </label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-150"
              >
                <option value="">Select resource...</option>
                {resourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {resourceOptions.length === 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">
                  No records of this type match the selected subject.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800/60 shrink-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {editingItem ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
