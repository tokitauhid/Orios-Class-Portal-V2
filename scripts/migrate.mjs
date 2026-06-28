import { createClient } from "@supabase/supabase-js";
import {
  mockNotes,
  mockAssignments,
  mockLabReports,
  mockTeachers,
  mockFiles,
  mockWeeklyRoutine,
} from "../lib/mock-data.js";
import { subjects } from "../lib/subjects.js";
import dotenv from "dotenv";

// Load local environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Note: We MUST use the service role key to bypass RLS policies during seeding/migration
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

const getTeacherIdByName = (name) => {
  if (!name) return null;
  if (name.includes("Rahman")) return 1;
  if (name.includes("Ahmed")) return 2;
  if (name.includes("Fatima")) return 3;
  if (name.includes("Khan")) return 4;
  return null;
};

async function migrate() {
  console.log("🚀 Starting data migration to Supabase...");

  try {
    // 1. Migrate Subjects
    console.log("📚 Migrating subjects...");
    const subjectsToInsert = subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      short_name: s.shortName,
      color: s.color,
      credit_hours: s.creditHours,
    }));
    const { error: subErr } = await supabase
      .from("subjects")
      .upsert(subjectsToInsert, { onConflict: "id" });
    if (subErr) throw subErr;
    console.log("✅ Subjects migrated successfully.");

    // 2. Migrate Teachers
    console.log("👨‍🏫 Migrating teachers...");
    const teachersToInsert = mockTeachers.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      email: t.email,
      phone: t.phone,
      room: t.room,
      office_hours: t.officeHours,
      initials: t.initials,
    }));
    const { error: teachErr } = await supabase
      .from("teachers")
      .upsert(teachersToInsert, { onConflict: "id" });
    if (teachErr) throw teachErr;
    console.log("✅ Teachers migrated successfully.");

    // Reset Sequence for Teachers
    await supabase.rpc("setval", { seq: "public.teachers_id_seq", val: 5 });

    // 3. Migrate Teacher-Subjects Relations
    console.log("🔗 Migrating teacher-subject junctions...");
    const junctionToInsert = [];
    subjects.forEach((s) => {
      if (s.teacherIds) {
        s.teacherIds.forEach((tId) => {
          junctionToInsert.push({ teacher_id: tId, subject_id: s.id });
        });
      }
    });
    const { error: juncErr } = await supabase
      .from("teacher_subjects")
      .upsert(junctionToInsert, { onConflict: "teacher_id,subject_id" });
    if (juncErr) throw juncErr;
    console.log("✅ Junction entries migrated successfully.");

    // 4. Migrate Notes
    console.log("📝 Migrating notes...");
    const notesToInsert = mockNotes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description || "",
      subject_id: n.subjectId,
      type: n.type,
      url: n.url || "https://example.com/mock-file.pdf",
    }));
    const { error: notesErr } = await supabase
      .from("notes")
      .upsert(notesToInsert, { onConflict: "id" });
    if (notesErr) throw notesErr;
    console.log("✅ Notes migrated successfully.");

    // 5. Migrate Assignments
    console.log("📅 Migrating assignments...");
    const assignmentsToInsert = mockAssignments.map((a) => {
      // Map relative dates to ISO string
      let dueDate = a.dueDate;
      if (!dueDate) {
        dueDate = new Date().toISOString();
      }
      return {
        id: a.id,
        title: a.title,
        description: a.description || "",
        subject_id: a.subjectId,
        due_date: dueDate,
        status: a.status,
        file_url: a.file || null,
      };
    });
    const { error: assignErr } = await supabase
      .from("assignments")
      .upsert(assignmentsToInsert, { onConflict: "id" });
    if (assignErr) throw assignErr;
    console.log("✅ Assignments migrated successfully.");

    // 6. Migrate Lab Reports
    console.log("🧪 Migrating lab reports...");
    const labsToInsert = mockLabReports.map((l) => {
      let dueDate = l.dueDate;
      if (!dueDate) {
        dueDate = new Date().toISOString();
      }
      return {
        id: l.id,
        title: l.title,
        description: l.description || "",
        subject_id: l.subjectId,
        lab_number: l.labNumber,
        due_date: dueDate,
        status: l.status,
        file_url: l.file || null,
      };
    });
    const { error: labErr } = await supabase
      .from("lab_reports")
      .upsert(labsToInsert, { onConflict: "id" });
    if (labErr) throw labErr;
    console.log("✅ Lab reports migrated successfully.");

    // 7. Migrate Files
    console.log("📁 Migrating files list...");
    const filesToInsert = mockFiles.map((f) => ({
      id: f.id,
      name: f.name,
      subject_id: f.subjectId,
      type: f.type,
      size: f.size,
      uploaded_by: f.uploadedBy,
      url: f.url || "https://example.com/mock-file.pdf",
    }));
    const { error: filesErr } = await supabase
      .from("files")
      .upsert(filesToInsert, { onConflict: "id" });
    if (filesErr) throw filesErr;
    console.log("✅ Files migrated successfully.");

    // 8. Migrate Routine
    console.log("🗓️ Migrating routine slots...");
    const routineSlots = [];
    const schedule = mockWeeklyRoutine.schedule;

    for (const day of Object.keys(schedule)) {
      const slots = schedule[day];
      slots.forEach((slot, index) => {
        if (slot) {
          routineSlots.push({
            day_name: day,
            time_slot_index: index,
            subject_id: slot.subjectId,
            teacher_id: getTeacherIdByName(slot.teacher),
            room: slot.room,
            type: slot.type || "lecture",
          });
        }
      });
    }

    const { error: routErr } = await supabase
      .from("routine")
      .upsert(routineSlots, { onConflict: "day_name,time_slot_index" });
    if (routErr) throw routErr;
    console.log("✅ Routine slots migrated successfully.");

    console.log("🎉 Seeding and migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    process.exit(1);
  }
}

migrate();
