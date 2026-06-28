"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FolderOpen } from "lucide-react";

export default function AdminFilesPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadFiles() {
      try {
        const { data: dbFiles, error } = await supabase
          .from("files")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        setData(
          (dbFiles || []).map((f) => ({
            id: f.id,
            name: f.name,
            subjectId: f.subject_id,
            type: f.type,
            size: f.size,
            uploadedBy: f.uploaded_by,
            url: f.url,
            date: new Date(f.created_at).toISOString().split("T")[0],
          }))
        );
      } catch (err) {
        console.error("Error loading files:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: s.id, label: s.code }));
  }, [subjects]);

  const typeOptions = [
    { value: "pdf", label: "PDF" },
    { value: "doc", label: "Document" },
    { value: "pptx", label: "PowerPoint" },
    { value: "zip", label: "ZIP Archive" },
    { value: "code", label: "Code File" },
    { value: "image", label: "Image" },
  ];

  const columns = useMemo(() => [
    { key: "name", label: "File Name" },
    {
      key: "subjectId",
      label: "Subject",
      render: (item) => {
        const s = getSubject(item.subjectId);
        return s ? s.code : item.subjectId;
      },
    },
    {
      key: "type",
      label: "Type",
      render: (item) => item.type?.toUpperCase(),
    },
    { key: "size", label: "Size" },
    { key: "uploadedBy", label: "Uploaded By" },
  ], [getSubject]);

  const fields = useMemo(() => [
    { key: "name", label: "File Display Name", type: "text", required: true, placeholder: "e.g. Midterm Syllabus" },
    { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
    { key: "type", label: "File Type (Optional)", type: "select", options: typeOptions, placeholder: "Auto-detected if blank" },
    { key: "size", label: "Size (Optional)", type: "text", placeholder: "Auto-calculated if blank" },
    { key: "uploadedBy", label: "Uploaded By", type: "text", required: true, placeholder: "Name or email" },
    { key: "file", label: "File", type: "file" },
  ], [subjectOptions]);

  const handleAdd = async (formData) => {
    try {
      let fileUrl = "";
      let fileSize = formData.size || "—";
      let fileType = formData.type || "pdf";

      if (formData.file && typeof formData.file !== "string") {
        const fileObj = formData.file;
        const fileExt = fileObj.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadErr } = await supabase.storage
          .from("class-materials")
          .upload(fileName, fileObj);
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from("class-materials")
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;

        // Auto calculate file size if blank
        if (!formData.size) {
          const bytes = fileObj.size;
          if (bytes < 1024 * 1024) {
            fileSize = `${(bytes / 1024).toFixed(1)} KB`;
          } else {
            fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          }
        }
        
        // Auto detect file type if blank
        if (!formData.type) {
          const extMap = {
            pdf: "pdf",
            doc: "doc",
            docx: "doc",
            pptx: "pptx",
            ppt: "pptx",
            zip: "zip",
            rar: "zip",
            c: "code",
            js: "code",
            py: "code",
            png: "image",
            jpg: "image",
            jpeg: "image",
          };
          fileType = extMap[fileExt.toLowerCase()] || "pdf";
        }
      } else {
        alert("Please select and upload a file first.");
        return;
      }

      const { data: inserted, error } = await supabase
        .from("files")
        .insert([{
          name: formData.name,
          subject_id: formData.subjectId,
          type: fileType,
          size: fileSize,
          uploaded_by: formData.uploadedBy,
          url: fileUrl,
        }])
        .select()
        .single();

      if (error) throw error;

      setData((prev) => [
        {
          id: inserted.id,
          name: inserted.name,
          subjectId: inserted.subject_id,
          type: inserted.type,
          size: inserted.size,
          uploadedBy: inserted.uploaded_by,
          url: inserted.url,
          date: new Date(inserted.created_at).toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || "Failed to add file");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      let fileUrl = formData.url;
      let fileSize = formData.size;
      let fileType = formData.type;

      if (formData.file && typeof formData.file !== "string") {
        const fileObj = formData.file;
        const fileExt = fileObj.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { error: uploadErr } = await supabase.storage
          .from("class-materials")
          .upload(fileName, fileObj);
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from("class-materials")
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;

        // Auto size
        const bytes = fileObj.size;
        if (bytes < 1024 * 1024) {
          fileSize = `${(bytes / 1024).toFixed(1)} KB`;
        } else {
          fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        
        // Auto type
        const extMap = {
          pdf: "pdf",
          doc: "doc",
          docx: "doc",
          pptx: "pptx",
          ppt: "pptx",
          zip: "zip",
          rar: "zip",
          c: "code",
          js: "code",
          py: "code",
          png: "image",
          jpg: "image",
          jpeg: "image",
        };
        fileType = extMap[fileExt.toLowerCase()] || "pdf";
      }

      const { data: updated, error } = await supabase
        .from("files")
        .update({
          name: formData.name,
          subject_id: formData.subjectId,
          type: fileType,
          size: fileSize,
          uploaded_by: formData.uploadedBy,
          url: fileUrl,
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      setData((prev) =>
        prev.map((f) =>
          f.id === formData.id
            ? {
                id: updated.id,
                name: updated.name,
                subjectId: updated.subject_id,
                type: updated.type,
                size: updated.size,
                uploadedBy: updated.uploaded_by,
                url: updated.url,
                date: new Date(updated.created_at).toISOString().split("T")[0],
              }
            : f
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update file");
    }
  };

  const handleDelete = async (item) => {
    try {
      // Delete record in files table
      const { error } = await supabase.from("files").delete().eq("id", item.id);
      if (error) throw error;

      // Note: Optionally we could delete the object in Supabase storage as well
      // but since storage is public and URLs are simple, keeping them is standard.

      setData((prev) => prev.filter((f) => f.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete file");
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
      title="File"
      icon={FolderOpen}
      iconColor="bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["name", "uploadedBy"]}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
