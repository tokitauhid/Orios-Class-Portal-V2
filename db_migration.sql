-- 1. Create time_slots table
CREATE TABLE IF NOT EXISTS public.time_slots (
  id SERIAL PRIMARY KEY,
  time_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS and setup policies for time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for time_slots" ON public.time_slots;
CREATE POLICY "Allow public read access for time_slots" 
  ON public.time_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access for time_slots" ON public.time_slots;
CREATE POLICY "Allow admin write access for time_slots" 
  ON public.time_slots FOR ALL TO authenticated USING (public.is_admin());

-- 3. Modify check constraint on routine index to support dynamic slots
ALTER TABLE public.routine DROP CONSTRAINT IF EXISTS routine_time_slot_index_check;
ALTER TABLE public.routine ADD CONSTRAINT routine_time_slot_index_check CHECK (time_slot_index >= 0);

-- 4. Add attachments JSONB column to assignments and lab_reports
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.lab_reports ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 5. Seed default 8 time slots
INSERT INTO public.time_slots (time_label, sort_order) VALUES
('8:00', 0),
('9:00', 1),
('10:00', 2),
('11:00', 3),
('12:00', 4),
('1:00', 5),
('2:00', 6),
('3:00', 7)
ON CONFLICT (sort_order) DO UPDATE SET time_label = EXCLUDED.time_label;

-- 6. Migrate existing file_url links into attachments array
UPDATE public.assignments
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'name', COALESCE(substring(file_url from '[^/]+$'), 'Attachment'),
    'url', file_url,
    'type', CASE WHEN file_url LIKE '%/storage/v1/object/public/%' THEN 'upload' ELSE 'link' END
  )
)
WHERE file_url IS NOT NULL AND file_url <> '' AND (attachments IS NULL OR jsonb_array_length(attachments) = 0);

UPDATE public.lab_reports
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'name', COALESCE(substring(file_url from '[^/]+$'), 'Attachment'),
    'url', file_url,
    'type', CASE WHEN file_url LIKE '%/storage/v1/object/public/%' THEN 'upload' ELSE 'link' END
  )
)
WHERE file_url IS NOT NULL AND file_url <> '' AND (attachments IS NULL OR jsonb_array_length(attachments) = 0);

-- 7. Add attachments JSONB column to notes and files
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 8. Migrate existing notes/files url links into attachments array
UPDATE public.notes
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'name', title,
    'url', url,
    'type', type
  )
)
WHERE url IS NOT NULL AND url <> '' AND (attachments IS NULL OR jsonb_array_length(attachments) = 0);

UPDATE public.files
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'name', name,
    'url', url,
    'type', type
  )
)
WHERE url IS NOT NULL AND url <> '' AND (attachments IS NULL OR jsonb_array_length(attachments) = 0);
