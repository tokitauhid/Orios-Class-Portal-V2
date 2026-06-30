"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FlaskConical } from "lucide-react";
import { uploadFile } from "@/lib/download";

export default function AdminLabReportsPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadLabReports() {
      try {
        const { data: dbLabReports, error } = await supabase
          .from("lab_reports")
          .select("*")
          .order("due_date", { ascending: true });
        if (error) throw error;

        setData(
          (dbLabReports || []).map((l) => ({
            id: l.id,
            title: l.title,
            description: l.description,
            subjectId: l.subject_id,
            labNumber: l.lab_number,
            dueDate: l.due_date ? new Date(l.due_date).toISOString().split("T")[0] : "",
            status: l.status,
            file: l.file_url,
            attachments: l.attachments || [],
          }))
        );
      } catch (err) {
        console.error("Error loading lab reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLabReports();
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
    { key: "labNumber", label: "Lab #" },
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
    {
      key: "attachments",
      label: "Attachments",
      render: (item) => {
        const count = (item.attachments || []).length;
        return (
          <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
            {count} {count === 1 ? "file" : "files"}
          </span>
        );
      },
    },
  ], [getSubject]);

  const fields = useMemo(() => [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "Lab report title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
    { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
    { key: "labNumber", label: "Lab Number", type: "number", required: true, placeholder: "e.g. 4" },
    { key: "dueDate", label: "Due Date", type: "date", required: true },
    { key: "status", label: "Status", type: "select", required: true, options: statusOptions },
    { key: "attachments", label: "Attachments", type: "attachments" },
  ], [subjectOptions]);

  const handleAdd = async (formData) => {
    try {
      const finalAttachments = [];
      for (const att of (formData.attachments || [])) {
        let url = att.url || "";
        if (att.file && typeof att.file !== "string") {
          url = await uploadFile(att.file, supabase);
        }
        if (url) {
          finalAttachments.push({
            name: att.name || "Attachment",
            url,
            type: att.type || (url.includes("/storage/v1/object/public/") ? "upload" : "link"),
          });
        }
      }
      const finalFileUrl = finalAttachments[0]?.url || "";

      const { data: inserted, error } = await supabase
        .from("lab_reports")
        .insert([{
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          lab_number: Number(formData.labNumber),
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          status: formData.status,
          file_url: finalFileUrl,
          attachments: finalAttachments,
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
          labNumber: inserted.lab_number,
          dueDate: inserted.due_date ? new Date(inserted.due_date).toISOString().split("T")[0] : "",
          status: inserted.status,
          file: inserted.file_url,
          attachments: inserted.attachments || [],
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || "Failed to add lab report");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const finalAttachments = [];
      for (const att of (formData.attachments || [])) {
        let url = att.url || "";
        if (att.file && typeof att.file !== "string") {
          url = await uploadFile(att.file, supabase);
        }
        if (url) {
          finalAttachments.push({
            name: att.name || "Attachment",
            url,
            type: att.type || (url.includes("/storage/v1/object/public/") ? "upload" : "link"),
          });
        }
      }
      const finalFileUrl = finalAttachments[0]?.url || "";

      const { data: updated, error } = await supabase
        .from("lab_reports")
        .update({
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          lab_number: Number(formData.labNumber),
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          status: formData.status,
          file_url: finalFileUrl,
          attachments: finalAttachments,
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      setData((prev) =>
        prev.map((l) =>
          l.id === formData.id
            ? {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                subjectId: updated.subject_id,
                labNumber: updated.lab_number,
                dueDate: updated.due_date ? new Date(updated.due_date).toISOString().split("T")[0] : "",
                status: updated.status,
                file: updated.file_url,
                attachments: updated.attachments || [],
              }
            : l
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update lab report");
    }
  };

  const handleDelete = async (item) => {
    try {
      const { error } = await supabase.from("lab_reports").delete().eq("id", item.id);
      if (error) throw error;
      setData((prev) => prev.filter((l) => l.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete lab report");
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
      title="Lab Report"
      icon={FlaskConical}
      iconColor="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
