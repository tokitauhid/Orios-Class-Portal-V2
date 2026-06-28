"use client";

import { useState } from "react";
import { subjects as initialSubjects, availableColors } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { BookOpen } from "lucide-react";

const colorOptions = availableColors.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));

const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "shortName", label: "Short" },
  {
    key: "color",
    label: "Color",
    render: (item) => (
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}-500`} />
        <span className="capitalize">{item.color}</span>
      </div>
    ),
  },
  { key: "creditHours", label: "Credits" },
];

const fields = [
  { key: "id", label: "ID (slug)", type: "text", required: true, placeholder: "eee-1201" },
  { key: "code", label: "Course Code", type: "text", required: true, placeholder: "EEE 1201" },
  { key: "name", label: "Full Name", type: "text", required: true, placeholder: "Electrical Circuits" },
  { key: "shortName", label: "Short Name", type: "text", required: true, placeholder: "EEE" },
  { key: "color", label: "Color", type: "select", required: true, options: colorOptions },
  { key: "creditHours", label: "Credit Hours", type: "number", placeholder: "3" },
];

export default function AdminSubjectsPage() {
  const [data, setData] = useState([...initialSubjects]);

  return (
    <AdminCrudPage
      title="Subject"
      icon={BookOpen}
      iconColor="bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["code", "name", "shortName"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((s) => (s.id === item.id ? item : s)))}
      onDelete={(item) => setData((prev) => prev.filter((s) => s.id !== item.id))}
    />
  );
}
