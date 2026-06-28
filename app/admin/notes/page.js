"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FileText } from "lucide-react";
import { uploadFile } from "@/lib/download";

const extMap = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  xls: "doc",
  xlsx: "doc",
  txt: "doc",
  pptx: "pptx",
  ppt: "pptx",
  zip: "zip",
  rar: "zip",
  tar: "zip",
  "7z": "zip",
  c: "code",
  cpp: "code",
  java: "code",
  js: "code",
  ts: "code",
  py: "code",
  png: "image",
  jpg: "image",
  jpeg: "image",
  webp: "image",
};

function getFileType(fileObj, urlStr, isNote = false) {
  let ext = "";
  if (fileObj && typeof fileObj !== "string") {
    ext = fileObj.name.split(".").pop();
  } else if (urlStr) {
    try {
      const urlPath = new URL(urlStr).pathname;
      ext = urlPath.split(".").pop();
    } catch {
      const cleanPath = urlStr.split("?")[0];
      ext = cleanPath.split(".").pop();
    }
  }
  
  if (!ext) return isNote ? "link" : "pdf";
  
  const mapped = extMap[ext.toLowerCase()];
  if (mapped) return mapped;
  
  return isNote ? "link" : "pdf";
}

export default function AdminNotesPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadNotes() {
      try {
        const { data: dbNotes, error } = await supabase
          .from("notes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        setData(
          (dbNotes || []).map((n) => ({
            id: n.id,
            title: n.title,
            description: n.description,
            subjectId: n.subject_id,
            type: n.type,
            url: n.url,
            date: new Date(n.created_at).toISOString().split("T")[0],
          }))
        );
      } catch (err) {
        console.error("Error loading notes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: s.id, label: s.code }));
  }, [subjects]);

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
    { key: "type", label: "Type", render: (item) => item.type?.toUpperCase() },
    { key: "date", label: "Date" },
  ], [getSubject]);

  const fields = useMemo(() => [
    { key: "title", label: "Title", type: "text", required: true, placeholder: "Note title" },
    { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
    { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
    { key: "fileUpload", label: "Upload File Attachment", type: "file" },
    { key: "url", label: "Or URL / Resource Link", type: "text", placeholder: "https://example.com/file.pdf" },
  ], [subjectOptions]);

  const handleAdd = async (formData) => {
    try {
      let finalUrl = formData.url || "";

      if (formData.fileUpload && typeof formData.fileUpload !== "string") {
        finalUrl = await uploadFile(formData.fileUpload, supabase);
      }

      if (!finalUrl) {
        alert("Please upload a file or enter an external URL.");
        return;
      }

      const noteType = getFileType(formData.fileUpload, finalUrl, true);

      const { data: inserted, error } = await supabase
        .from("notes")
        .insert([{
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          type: noteType,
          url: finalUrl,
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
          type: inserted.type,
          url: inserted.url,
          date: new Date(inserted.created_at).toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || "Failed to add note");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      let finalUrl = formData.url || "";

      if (formData.fileUpload && typeof formData.fileUpload !== "string") {
        finalUrl = await uploadFile(formData.fileUpload, supabase);
      }

      if (!finalUrl) {
        alert("Please upload a file or enter an external URL.");
        return;
      }

      const noteType = getFileType(formData.fileUpload, finalUrl, true);

      const { data: updated, error } = await supabase
        .from("notes")
        .update({
          title: formData.title,
          description: formData.description || "",
          subject_id: formData.subjectId,
          type: noteType,
          url: finalUrl,
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      setData((prev) =>
        prev.map((n) =>
          n.id === formData.id
            ? {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                subjectId: updated.subject_id,
                type: updated.type,
                url: updated.url,
                date: new Date(updated.created_at).toISOString().split("T")[0],
              }
            : n
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update note");
    }
  };

  const handleDelete = async (item) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", item.id);
      if (error) throw error;
      setData((prev) => prev.filter((n) => n.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete note");
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
      title="Note"
      icon={FileText}
      iconColor="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
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
