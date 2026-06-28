"use client";

import { useState } from "react";
import { mockNotes } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FileText } from "lucide-react";

const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.code }));
const typeOptions = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "link", label: "Link" },
  { value: "image", label: "Image" },
];

const columns = [
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
];

const fields = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Note title" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
  { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
  { key: "type", label: "Type", type: "select", required: true, options: typeOptions },
  { key: "date", label: "Date", type: "date" },
  { key: "file", label: "Attachment File (Optional)", type: "file" },
];

export default function AdminNotesPage() {
  const [data, setData] = useState([...mockNotes]);

  return (
    <AdminCrudPage
      title="Note"
      icon={FileText}
      iconColor="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["title", "description"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((n) => (n.id === item.id ? item : n)))}
      onDelete={(item) => setData((prev) => prev.filter((n) => n.id !== item.id))}
    />
  );
}
