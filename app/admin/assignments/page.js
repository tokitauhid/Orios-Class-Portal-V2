"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { ClipboardList } from "lucide-react";
import { uploadFile } from "@/lib/download";

export default function AdminAssignmentsPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAssignments() {
      try {
        const { data: dbAssignments, error } = await supabase
          .from("assignments")
          .select("*")
          .order("due_date", { ascending: true });
        if (error) throw error;

        setData(
          (dbAssignments || []).map((a) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            subjectId: a.subject_id,
            dueDate: a.due_date ? new Date(a.due_date).toISOString().split("T")[0] : "",
            status: a.status,
            file: a.file_url,
          }))
        );
      } catch (err) {
        console.error("Error loading assignments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAssignments();
  }, []);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: s.id, label: s.code }));
  }, [subjects]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "submitted", label: "Submitted" },
  ];

  const columns = useMemo(() => [
    { key: "title", label: "Title" },
    {
      key: "subjectId",
      label: "Subject",
      render: (item) => {
        const s = getSubject(item.subjectId);
        return s ? s.code : item.subjectId;
      },
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const status = item.status === "pending" && item.dueDate && new Date(item.dueDate) < new Date() ? "overdue" : item.status;
        return (
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
            status === "pending" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
            : status === "submitted" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
            : "bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400"
          }`}>
            {status}
          </span>
        );
      },
    },
  ], [getSubject]);

  const fields = useMemo(() => [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "Assignment title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
    { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
    { key: "dueDate", label: "Due Date", type: "date", required: true },
    { key: "status", label: "Status", type: "select", required: true, options: statusOptions },
    { key: "fileUpload", label: "Upload File Attachment", type: "file" },
    { key: "file", label: "Or Attachment URL", type: "text", placeholder: "https://example.com/sheet.pdf" },
  ], [subjectOptions]);

  const handleAdd = async (formData) => {
    try {
      let finalFileUrl = formData.file || "";
      if (formData.fileUpload && typeof formData.fileUpload !== "string") {
        finalFileUrl = await uploadFile(formData.fileUpload, supabase);
      }

      const { data: inserted, error } = await supabase
        .from("assignments")
        .insert([{
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          status: formData.status,
          file_url: finalFileUrl,
        }])
        .select()
        .single();

      if (error) throw error;

      setData((prev) => [
        {
          id: inserted.id,
          title: inserted.title,
          description: inserted.description,
          subjectId: inserted.subject_id,
          dueDate: inserted.due_date ? new Date(inserted.due_date).toISOString().split("T")[0] : "",
          status: inserted.status,
          file: inserted.file_url,
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || "Failed to add assignment");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      let finalFileUrl = formData.file || "";
      if (formData.fileUpload && typeof formData.fileUpload !== "string") {
        finalFileUrl = await uploadFile(formData.fileUpload, supabase);
      }

      const { data: updated, error } = await supabase
        .from("assignments")
        .update({
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          status: formData.status,
          file_url: finalFileUrl,
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      setData((prev) =>
        prev.map((a) =>
          a.id === formData.id
            ? {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                subjectId: updated.subject_id,
                dueDate: updated.due_date ? new Date(updated.due_date).toISOString().split("T")[0] : "",
                status: updated.status,
                file: updated.file_url,
              }
            : a
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update assignment");
    }
  };

  const handleDelete = async (item) => {
    try {
      const { error } = await supabase.from("assignments").delete().eq("id", item.id);
      if (error) throw error;
      setData((prev) => prev.filter((a) => a.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete assignment");
    }
  };

  if (loading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminCrudPage
      title="Assignment"
      icon={ClipboardList}
      iconColor="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["title", "description"]}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
