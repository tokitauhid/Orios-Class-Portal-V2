import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load local environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function clearDatabase() {
  console.log("🧹 Starting database cleanup...");

  try {
    // 1. Delete Exams
    console.log("🗑️ Clearing exams...");
    const { error: examsErr } = await supabase.from("exams").delete().neq("id", 0);
    if (examsErr) throw examsErr;

    // 2. Delete Routine Slots
    console.log("🗑️ Clearing routine slots...");
    const { error: routineErr } = await supabase.from("routine").delete().neq("time_slot_index", -1);
    if (routineErr) throw routineErr;

    // 2.5 Delete Time Slots
    console.log("🗑️ Clearing time slots...");
    const { error: slotsErr } = await supabase.from("time_slots").delete().neq("id", 0);
    if (slotsErr) throw slotsErr;

    // 3. Delete Files
    console.log("🗑️ Clearing files...");
    const { error: filesErr } = await supabase.from("files").delete().neq("id", 0);
    if (filesErr) throw filesErr;

    // 4. Delete Lab Reports
    console.log("🗑️ Clearing lab reports...");
    const { error: labErr } = await supabase.from("lab_reports").delete().neq("id", 0);
    if (labErr) throw labErr;

    // 5. Delete Assignments
    console.log("🗑️ Clearing assignments...");
    const { error: assignErr } = await supabase.from("assignments").delete().neq("id", 0);
    if (assignErr) throw assignErr;

    // 6. Delete Notes
    console.log("🗑️ Clearing notes...");
    const { error: notesErr } = await supabase.from("notes").delete().neq("id", 0);
    if (notesErr) throw notesErr;

    // 7. Delete Teacher-Subject Junctions
    console.log("🗑️ Clearing teacher-subject junctions...");
    const { error: juncErr } = await supabase.from("teacher_subjects").delete().neq("teacher_id", 0);
    if (juncErr) throw juncErr;

    // 8. Delete Teachers
    console.log("🗑️ Clearing teachers...");
    const { error: teachErr } = await supabase.from("teachers").delete().neq("id", 0);
    if (teachErr) throw teachErr;

    // 9. Delete Subjects
    console.log("🗑️ Clearing subjects...");
    const { error: subErr } = await supabase.from("subjects").delete().neq("id", "");
    if (subErr) throw subErr;

    // Reset sequences back to 1 (if we have access to call setval or if auto-incremental)
    console.log("✨ Resetting sequences...");
    try {
      await supabase.rpc("setval", { seq: "public.teachers_id_seq", val: 1, is_called: false });
      await supabase.rpc("setval", { seq: "public.notes_id_seq", val: 1, is_called: false });
      await supabase.rpc("setval", { seq: "public.assignments_id_seq", val: 1, is_called: false });
      await supabase.rpc("setval", { seq: "public.lab_reports_id_seq", val: 1, is_called: false });
      await supabase.rpc("setval", { seq: "public.files_id_seq", val: 1, is_called: false });
      await supabase.rpc("setval", { seq: "public.exams_id_seq", val: 1, is_called: false });
      console.log("✅ Sequences reset successfully.");
    } catch (seqErr) {
      console.log("⚠️ Sequence reset skipped (might not have RPC setval wrapper configured). It will auto-reset next time you insert.");
    }

    console.log("🎉 Database cleared successfully!");
  } catch (error) {
    console.error("❌ Cleanup failed with error:", error);
    process.exit(1);
  }
}

clearDatabase();
