"use client";

import { useState } from "react";
import { mockTeachers } from "@/lib/mock-data";
import { subjects, getSubject } from "@/lib/subjects";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { GraduationCap } from "lucide-react";

const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.code }));

const columns = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  {
    key: "subjectIds",
    label: "Subjects",
    render: (item) => {
      if (!item.subjectIds || item.subjectIds.length === 0) return "—";
      return item.subjectIds.map((id) => {
        const s = getSubject(id);
        return s ? s.code : id;
      }).join(", ");
    },
  },
  { key: "email", label: "Email" },
];

const fields = [
  { key: "name", label: "Full Name", type: "text", required: true, placeholder: "Dr. John Doe" },
  { key: "role", label: "Role", type: "select", required: true, options: [
    { value: "Professor", label: "Professor" },
    { value: "Associate Professor", label: "Associate Professor" },
    { value: "Lecturer", label: "Lecturer" },
    { value: "Teaching Assistant", label: "Teaching Assistant" },
  ]},
  { key: "email", label: "Email", type: "text", placeholder: "email@univ.edu" },
  { key: "phone", label: "Phone", type: "text", placeholder: "+880-XXXX-XXXXXX" },
  { key: "room", label: "Office Room", type: "text", placeholder: "Room 301, EEE Building" },
  { key: "officeHours", label: "Office Hours", type: "text", placeholder: "Sun & Tue 10:00 – 12:00" },
  { key: "subjectIds", label: "Subjects", type: "multi-select", options: subjectOptions },
  { key: "initials", label: "Initials", type: "text", placeholder: "JD" },
];

export default function AdminTeachersPage() {
  const [data, setData] = useState([...mockTeachers]);

  return (
    <AdminCrudPage
      title="Teacher"
      icon={GraduationCap}
      iconColor="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["name", "email", "role"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((t) => (t.id === item.id ? item : t)))}
      onDelete={(item) => setData((prev) => prev.filter((t) => t.id !== item.id))}
    />
  );
}
