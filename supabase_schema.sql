-- SQL Schema Setup for Orios-V2 Database on Supabase

-- Enable Row Level Security (RLS) on all tables

-- ─── 1. PROFILES TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ─── 2. SUBJECTS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY, -- e.g., 'eee-1201'
  code TEXT NOT NULL UNIQUE, -- e.g., 'EEE 1201'
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color TEXT NOT NULL, -- palette key e.g., 'indigo'
  credit_hours NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- ─── 3. TEACHERS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  room TEXT,
  office_hours TEXT,
  initials TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- ─── 4. TEACHER_SUBJECTS JUNCTION TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  teacher_id INTEGER REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (teacher_id, subject_id)
);

ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

-- ─── 5. NOTES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'pdf', 'doc', 'pptx', 'zip', 'code', 'image', 'link'
  url TEXT NOT NULL, -- Storage URL or external resource link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- ─── 6. ASSIGNMENTS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'submitted')) DEFAULT 'pending',
  file_url TEXT, -- Link to attached document (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ─── 7. LAB_REPORTS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  lab_number INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'submitted')) DEFAULT 'pending',
  file_url TEXT, -- Link to attached document (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- ─── 8. FILES TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL, -- e.g. '2.4 MB'
  uploaded_by TEXT NOT NULL,
  url TEXT NOT NULL, -- Supabase Storage URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- ─── 9. ROUTINE TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.routine (
  day_name TEXT NOT NULL CHECK (day_name IN ('Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  time_slot_index INTEGER NOT NULL CHECK (time_slot_index >= 0 AND time_slot_index < 8),
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id INTEGER REFERENCES public.teachers(id) ON DELETE SET NULL,
  room TEXT,
  type TEXT CHECK (type IN ('lecture', 'lab')),
  PRIMARY KEY (day_name, time_slot_index)
);

ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;

-- ─── ROW LEVEL SECURITY POLICIES ─────────────────────────────────────────────

-- Helper function to check if the current request is from an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" 
  ON public.profiles FOR SELECT USING (true);

-- 2. Subjects Policies
CREATE POLICY "Allow public read access for subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_admin());

-- 3. Teachers Policies
CREATE POLICY "Allow public read access for teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for teachers" ON public.teachers FOR ALL TO authenticated USING (public.is_admin());

-- 4. Teacher Subjects Junction Policies
CREATE POLICY "Allow public read access for teacher_subjects" ON public.teacher_subjects FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for teacher_subjects" ON public.teacher_subjects FOR ALL TO authenticated USING (public.is_admin());

-- 5. Notes Policies
CREATE POLICY "Allow public read access for notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for notes" ON public.notes FOR ALL TO authenticated USING (public.is_admin());

-- 6. Assignments Policies
CREATE POLICY "Allow public read access for assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for assignments" ON public.assignments FOR ALL TO authenticated USING (public.is_admin());

-- 7. Lab Reports Policies
CREATE POLICY "Allow public read access for lab_reports" ON public.lab_reports FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for lab_reports" ON public.lab_reports FOR ALL TO authenticated USING (public.is_admin());

-- 8. Files Policies
CREATE POLICY "Allow public read access for files" ON public.files FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for files" ON public.files FOR ALL TO authenticated USING (public.is_admin());

-- 9. Routine Policies
CREATE POLICY "Allow public read access for routine" ON public.routine FOR SELECT USING (true);
CREATE POLICY "Allow admin write access for routine" ON public.routine FOR ALL TO authenticated USING (public.is_admin());


-- ─── AUTHENTICATION SIGNUP TRIGGER ──────────────────────────────────────────
-- Automatically create a profile when a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'admin') -- default to admin
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── INITIAL SEED DATA ───────────────────────────────────────────────────────

-- 1. Subjects
INSERT INTO public.subjects (id, code, name, short_name, color, credit_hours) VALUES
('eee-1201', 'EEE 1201', 'Electrical Circuits', 'EEE', 'indigo', 3),
('phy-1201', 'PHY 1201', 'Physics', 'PHY', 'emerald', 3),
('cse-1201', 'CSE 1201', 'Computer Science', 'CSE', 'violet', 3),
('math-1201', 'MATH 1201', 'Mathematics', 'MATH', 'amber', 3)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, short_name = EXCLUDED.short_name,
  color = EXCLUDED.color, credit_hours = EXCLUDED.credit_hours;

-- 2. Teachers
INSERT INTO public.teachers (id, name, role, email, phone, room, office_hours, initials) VALUES
(1, 'Dr. Abdur Rahman', 'Professor', 'a.rahman@univ.edu', '+880-1711-XXXXXX', 'Room 301, EEE Building', 'Sun & Tue 10:00 – 12:00', 'AR'),
(2, 'Prof. Kamal Ahmed', 'Associate Professor', 'k.ahmed@univ.edu', '+880-1812-XXXXXX', 'Room 205, Science Building', 'Mon & Wed 11:00 – 1:00', 'KA'),
(3, 'Ms. Fatima Akter', 'Lecturer', 'f.akter@univ.edu', '+880-1913-XXXXXX', 'Lab 4, CSE Building', 'Tue & Thu 2:00 – 4:00', 'FA'),
(4, 'Dr. Imran Khan', 'Professor', 'i.khan@univ.edu', '+880-1614-XXXXXX', 'Room 102, Math Building', 'Sun & Wed 9:00 – 11:00', 'IK')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email,
  phone = EXCLUDED.phone, room = EXCLUDED.room, office_hours = EXCLUDED.office_hours, initials = EXCLUDED.initials;

-- Reset serial sequence for teachers
SELECT setval('public.teachers_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.teachers), 1), false);

-- 3. Teacher Subjects Junction
INSERT INTO public.teacher_subjects (teacher_id, subject_id) VALUES
(1, 'eee-1201'),
(2, 'phy-1201'),
(3, 'cse-1201'),
(4, 'math-1201')
ON CONFLICT DO NOTHING;

-- 4. Notes
INSERT INTO public.notes (id, title, description, subject_id, type, url) VALUES
(1, 'Circuit Analysis Basics', 'Introduction to Kirchhoff''s laws and Ohm''s law with examples.', 'eee-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(2, 'AC vs DC Circuits', 'Comparison of AC and DC circuit behavior and applications.', 'eee-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(3, 'Thevenin''s Theorem Notes', 'Step-by-step guide to solving circuits using Thevenin''s theorem.', 'eee-1201', 'doc', 'https://example.com/mock-file.docx'),
(4, 'Newton''s Laws of Motion', 'Detailed notes on all three laws with real-world examples.', 'phy-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(5, 'Wave Optics Reference', 'External resource covering diffraction and interference.', 'phy-1201', 'link', 'https://example.com/wave-optics'),
(6, 'Rotational Mechanics Diagrams', 'Free body diagrams for torque and angular momentum problems.', 'phy-1201', 'image', 'https://example.com/mock-file.png'),
(7, 'Integration Techniques', 'Covers substitution, by-parts, and partial fractions.', 'math-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(8, 'Differential Equations Cheat Sheet', 'Quick reference for solving first and second order ODEs.', 'math-1201', 'doc', 'https://example.com/mock-file.docx'),
(9, 'Matrix Operations', 'Determinants, inverses, eigenvalues, and eigenvectors.', 'math-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(10, 'Intro to C Programming', 'Variables, data types, control structures, and functions in C.', 'cse-1201', 'pdf', 'https://example.com/mock-file.pdf'),
(11, 'Data Structures Overview', 'Arrays, linked lists, stacks, and queues explained.', 'cse-1201', 'link', 'https://example.com/dsa'),
(12, 'Pointer Arithmetic Notes', 'Understanding pointers, memory allocation, and arrays in C.', 'cse-1201', 'doc', 'https://example.com/mock-file.docx')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, subject_id = EXCLUDED.subject_id,
  type = EXCLUDED.type, url = EXCLUDED.url;

SELECT setval('public.notes_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.notes), 1), false);

-- 5. Assignments (with relative due dates)
INSERT INTO public.assignments (id, title, description, subject_id, due_date, status, file_url) VALUES
(1, 'Circuit Analysis Problem Set', 'Solve problems 3.1–3.15 from the textbook. Show all working.', 'eee-1201', NOW() - INTERVAL '3 days', 'pending', 'https://example.com/mock-file.pdf'),
(2, 'MATH Assignment 3', 'Integration and differential equations worksheet.', 'math-1201', NOW() + INTERVAL '8 days', 'pending', 'https://example.com/mock-file.pdf'),
(3, 'C Programming: Linked Lists', 'Implement singly linked list with insert, delete, and search.', 'cse-1201', NOW() + INTERVAL '5 days', 'pending', 'https://example.com/mock-file.pdf'),
(4, 'Physics Problem Set 2', 'Rotational mechanics and angular momentum problems.', 'phy-1201', NOW() - INTERVAL '2 days', 'submitted', 'https://example.com/mock-file.pdf'),
(5, 'MATH Assignment 2', 'Matrix operations and determinants.', 'math-1201', NOW() - INTERVAL '5 days', 'submitted', 'https://example.com/mock-file.pdf'),
(6, 'Digital Logic Design HW 1', 'Boolean algebra and Karnaugh maps.', 'eee-1201', NOW() - INTERVAL '10 days', 'submitted', 'https://example.com/mock-file.pdf')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, subject_id = EXCLUDED.subject_id,
  due_date = EXCLUDED.due_date, status = EXCLUDED.status, file_url = EXCLUDED.file_url;

SELECT setval('public.assignments_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.assignments), 1), false);

-- 6. Lab Reports (with relative due dates)
INSERT INTO public.lab_reports (id, title, description, subject_id, lab_number, due_date, status, file_url) VALUES
(1, 'Ohm''s Law Verification', 'Verify Ohm''s law using resistors and measure V-I characteristics.', 'eee-1201', 1, NOW() - INTERVAL '14 days', 'submitted', 'https://example.com/mock-file.pdf'),
(2, 'KVL & KCL Experiment', 'Verify Kirchhoff''s voltage and current laws in a circuit.', 'eee-1201', 2, NOW() - INTERVAL '7 days', 'submitted', 'https://example.com/mock-file.pdf'),
(3, 'Thevenin''s Theorem', 'Find Thevenin equivalent circuit for a given network.', 'eee-1201', 3, NOW() - INTERVAL '1 day', 'pending', 'https://example.com/mock-file.pdf'),
(4, 'PHY Lab Report 4', 'Simple pendulum experiment — measure g and analyze errors.', 'phy-1201', 4, NOW() + INTERVAL '2 days', 'pending', 'https://example.com/mock-file.pdf'),
(5, 'Newton''s 2nd Law', 'Verify F=ma using an Atwood machine setup.', 'phy-1201', 3, NOW() - INTERVAL '3 days', 'submitted', 'https://example.com/mock-file.pdf'),
(6, 'Array Sorting Algorithms', 'Implement bubble sort, selection sort, and measure time complexity.', 'cse-1201', 5, NOW() + INTERVAL '6 days', 'pending', 'https://example.com/mock-file.pdf')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, subject_id = EXCLUDED.subject_id,
  lab_number = EXCLUDED.lab_number, due_date = EXCLUDED.due_date, status = EXCLUDED.status, file_url = EXCLUDED.file_url;

SELECT setval('public.lab_reports_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.lab_reports), 1), false);

-- 7. Files
INSERT INTO public.files (id, name, subject_id, type, size, uploaded_by, url) VALUES
(1, 'EEE_1201_Midterm_Syllabus.pdf', 'eee-1201', 'pdf', '245 KB', 'Dr. Rahman', 'https://example.com/mock-file.pdf'),
(2, 'Circuit_Diagrams_Pack.zip', 'eee-1201', 'zip', '12.4 MB', 'Rahat', 'https://example.com/mock-file.zip'),
(3, 'PHY_Formula_Sheet.pdf', 'phy-1201', 'pdf', '180 KB', 'Prof. Ahmed', 'https://example.com/mock-file.pdf'),
(4, 'Lecture_5_Slides.pptx', 'math-1201', 'pptx', '3.2 MB', 'Dr. Khan', 'https://example.com/mock-file.pptx'),
(5, 'Lab5_Starter_Code.c', 'cse-1201', 'code', '4 KB', 'Ms. Fatima', 'https://example.com/mock-file.c'),
(6, 'Assignment_3_Solutions.pdf', 'math-1201', 'pdf', '520 KB', 'Tasnim', 'https://example.com/mock-file.pdf'),
(7, 'CSE_Midterm_Past_Papers.zip', 'cse-1201', 'zip', '8.1 MB', 'Sakib', 'https://example.com/mock-file.zip'),
(8, 'PHY_Lab_Manual.pdf', 'phy-1201', 'pdf', '1.8 MB', 'Prof. Ahmed', 'https://example.com/mock-file.pdf')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, subject_id = EXCLUDED.subject_id, type = EXCLUDED.type,
  size = EXCLUDED.size, uploaded_by = EXCLUDED.uploaded_by, url = EXCLUDED.url;

SELECT setval('public.files_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.files), 1), false);

-- 8. Routine / Weekly Schedule
INSERT INTO public.routine (day_name, time_slot_index, subject_id, teacher_id, room, type) VALUES
-- Saturday
('Saturday', 1, 'eee-1201', 1, 'Room 301', 'lecture'),
('Saturday', 2, 'phy-1201', 2, 'Room 205', 'lecture'),
('Saturday', 5, 'math-1201', 4, 'Room 102', 'lecture'),
-- Sunday
('Sunday', 0, 'math-1201', 4, 'Room 102', 'lecture'),
('Sunday', 1, 'eee-1201', 1, 'Room 301', 'lecture'),
('Sunday', 3, 'cse-1201', 3, 'Lab 4', 'lab'),
('Sunday', 5, 'phy-1201', 2, 'Room 205', 'lecture'),
-- Monday
('Monday', 1, 'phy-1201', 2, 'Room 205', 'lecture'),
('Monday', 2, 'eee-1201', 1, 'Lab 3', 'lab'),
('Monday', 3, 'eee-1201', 1, 'Lab 3', 'lab'),
('Monday', 5, 'math-1201', 4, 'Room 102', 'lecture'),
-- Tuesday
('Tuesday', 0, 'cse-1201', 3, 'Room 401', 'lecture'),
('Tuesday', 1, 'math-1201', 4, 'Room 102', 'lecture'),
('Tuesday', 2, 'phy-1201', 2, 'Room 205', 'lecture'),
('Tuesday', 6, 'eee-1201', 1, 'Room 301', 'lecture'),
-- Wednesday
('Wednesday', 1, 'eee-1201', 1, 'Room 301', 'lecture'),
('Wednesday', 2, 'cse-1201', 3, 'Lab 4', 'lab'),
('Wednesday', 3, 'cse-1201', 3, 'Lab 4', 'lab'),
('Wednesday', 5, 'phy-1201', 2, 'Lab 2', 'lab'),
('Wednesday', 6, 'phy-1201', 2, 'Lab 2', 'lab'),
-- Thursday
('Thursday', 0, 'math-1201', 4, 'Room 102', 'lecture'),
('Thursday', 1, 'phy-1201', 2, 'Room 205', 'lecture'),
('Thursday', 3, 'eee-1201', 1, 'Room 301', 'lecture'),
('Thursday', 5, 'cse-1201', 3, 'Room 401', 'lecture')
ON CONFLICT (day_name, time_slot_index) DO UPDATE SET
  subject_id = EXCLUDED.subject_id, teacher_id = EXCLUDED.teacher_id,
  room = EXCLUDED.room, type = EXCLUDED.type;
