"use client";

import { useState, useEffect, useMemo } from "react";
import { useSubjectColors } from "@/lib/SubjectContext";
import { createClient } from "@/lib/supabase/client";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { GraduationCap } from "lucide-react";

export default function AdminTeachersPage() {
  const { subjects, getSubject, isLoading: subjectsLoading } = useSubjectColors();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTeachers() {
      try {
        const { data: dbTeachers, error } = await supabase
          .from("teachers")
          .select("*, teacher_subjects(subject_id)")
          .order("name", { ascending: true });
        if (error) throw error;

        setData(
          (dbTeachers || []).map((t) => ({
            id: t.id,
            name: t.name,
            role: t.role,
            email: t.email,
            phone: t.phone,
            room: t.room,
            officeHours: t.office_hours,
            initials: t.initials,
            subjectIds: (t.teacher_subjects || []).map((ts) => ts.subject_id),
          }))
        );
      } catch (err) {
        console.error("Error loading teachers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeachers();
  }, []);

  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({ value: s.id, label: s.code }));
  }, [subjects]);

  const columns = useMemo(() => [
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
  ], [getSubject]);

  const fields = useMemo(() => [
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
  ], [subjectOptions]);

  const handleAdd = async (formData) => {
    try {
      // 1. Insert teacher
      const { data: inserted, error } = await supabase
        .from("teachers")
        .insert([{
          name: formData.name,
          role: formData.role,
          email: formData.email || "",
          phone: formData.phone || "",
          room: formData.room || "",
          office_hours: formData.officeHours || "",
          initials: formData.initials || "",
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Insert junction table entries
      const subjectIds = formData.subjectIds || [];
      if (subjectIds.length > 0) {
        const junctions = subjectIds.map((sid) => ({
          teacher_id: inserted.id,
          subject_id: sid,
        }));
        const { error: jErr } = await supabase
          .from("teacher_subjects")
          .insert(junctions);
        if (jErr) throw jErr;
      }

      setData((prev) => [
        {
          id: inserted.id,
          name: inserted.name,
          role: inserted.role,
          email: inserted.email,
          phone: inserted.phone,
          room: inserted.room,
          officeHours: inserted.office_hours,
          initials: inserted.initials,
          subjectIds,
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || "Failed to add teacher");
    }
  };

  const handleUpdate = async (formData) => {
    try {
      // 1. Update teacher
      const { data: updated, error } = await supabase
        .from("teachers")
        .update({
          name: formData.name,
          role: formData.role,
          email: formData.email || "",
          phone: formData.phone || "",
          room: formData.room || "",
          office_hours: formData.officeHours || "",
          initials: formData.initials || "",
        })
        .eq("id", formData.id)
        .select()
        .single();

      if (error) throw error;

      // 2. Delete and re-insert junction table entries
      const { error: delErr } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", formData.id);
      if (delErr) throw delErr;

      const subjectIds = formData.subjectIds || [];
      if (subjectIds.length > 0) {
        const junctions = subjectIds.map((sid) => ({
          teacher_id: formData.id,
          subject_id: sid,
        }));
        const { error: jErr } = await supabase
          .from("teacher_subjects")
          .insert(junctions);
        if (jErr) throw jErr;
      }

      setData((prev) =>
        prev.map((t) =>
          t.id === formData.id
            ? {
                id: updated.id,
                name: updated.name,
                role: updated.role,
                email: updated.email,
                phone: updated.phone,
                room: updated.room,
                officeHours: updated.office_hours,
                initials: updated.initials,
                subjectIds,
              }
            : t
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update teacher");
    }
  };

  const handleDelete = async (item) => {
    try {
      // Note: teacher_subjects junction deletes cascade automatically
      const { error } = await supabase.from("teachers").delete().eq("id", item.id);
      if (error) throw error;
      setData((prev) => prev.filter((t) => t.id !== item.id));
    } catch (err) {
      alert(err.message || "Failed to delete teacher");
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
      title="Teacher"
      icon={GraduationCap}
      iconColor="bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["name", "email", "role"]}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
