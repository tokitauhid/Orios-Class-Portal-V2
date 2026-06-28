"use client";

import { useState } from "react";
import { mockLabReports } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { FlaskConical } from "lucide-react";

const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.code }));
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
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
];

const fields = [
  { key: "title", label: "Title", type: "text", required: true, placeholder: "Lab report title" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Brief description" },
  { key: "subjectId", label: "Subject", type: "select", required: true, options: subjectOptions },
  { key: "labNumber", label: "Lab Number", type: "number", required: true, placeholder: "e.g. 4" },
  { key: "dueDate", label: "Due Date", type: "date", required: true },
  { key: "status", label: "Status", type: "select", required: true, options: statusOptions },
];

export default function AdminLabReportsPage() {
  const [data, setData] = useState([...mockLabReports]);

  return (
    <AdminCrudPage
      title="Lab Report"
      icon={FlaskConical}
      iconColor="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["title", "description"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((r) => (r.id === item.id ? item : r)))}
      onDelete={(item) => setData((prev) => prev.filter((r) => r.id !== item.id))}
    />
  );
}
