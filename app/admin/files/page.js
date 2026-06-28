"use client";

import { useState } from "react";
import { mockFiles } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FolderOpen } from "lucide-react";

const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.code }));
const typeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "pptx", label: "PowerPoint" },
  { value: "zip", label: "ZIP Archive" },
  { value: "code", label: "Code File" },
  { value: "image", label: "Image" },
];

const columns = [
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
];

const fields = [
  { key: "name", label: "File Name", type: "text", required: true, placeholder: "Document_Name.pdf" },
  { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
  { key: "type", label: "File Type", type: "select", required: true, options: typeOptions },
  { key: "size", label: "Size", type: "text", placeholder: "e.g. 2.5 MB" },
  { key: "uploadedBy", label: "Uploaded By", type: "text", placeholder: "Name or email" },
  { key: "date", label: "Upload Date", type: "date" },
  { key: "file", label: "File", type: "file" },
];

export default function AdminFilesPage() {
  const [data, setData] = useState([...mockFiles]);

  return (
    <AdminCrudPage
      title="File"
      icon={FolderOpen}
      iconColor="bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["name", "uploadedBy"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((f) => (f.id === item.id ? item : f)))}
      onDelete={(item) => setData((prev) => prev.filter((f) => f.id !== item.id))}
    />
  );
}
