"use client";

import { useState } from "react";
import { mockAssignments } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { ClipboardList } from "lucide-react";

const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.code }));
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
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
  {
    key: "dueDate",
    label: "Due Date",
    render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
        item.status === "pending" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
        : item.status === "submitted" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400"
      }`}>
        {item.status}
      </span>
    ),
  },
];

const fields = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Assignment title" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
  { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
  { key: "dueDate", label: "Due Date", type: "date", required: true },
  { key: "status", label: "Status", type: "select", required: true, options: statusOptions },
  { key: "grade", label: "Grade (if graded)", type: "text", placeholder: "e.g. A-, B+" },
];

export default function AdminAssignmentsPage() {
  const [data, setData] = useState([...mockAssignments]);

  return (
    <AdminCrudPage
      title="Assignment"
      icon={ClipboardList}
      iconColor="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["title", "description"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((a) => (a.id === item.id ? item : a)))}
      onDelete={(item) => setData((prev) => prev.filter((a) => a.id !== item.id))}
    />
  );
}
