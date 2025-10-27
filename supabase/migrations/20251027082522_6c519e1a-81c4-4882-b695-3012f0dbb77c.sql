-- Create students table with ML model columns
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  gender TEXT,
  department TEXT NOT NULL,
  scholarship BOOLEAN DEFAULT false,
  parental_education TEXT,
  extra_curricular BOOLEAN DEFAULT false,
  age INTEGER,
  cgpa DECIMAL(3,2),
  attendance_rate DECIMAL(5,2),
  family_income DECIMAL(12,2),
  past_failures INTEGER DEFAULT 0,
  study_hours_per_week DECIMAL(5,2),
  assignments_submitted INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  sports_participation BOOLEAN DEFAULT false,
  dropout BOOLEAN DEFAULT false,
  risk_score DECIMAL(5,2),
  risk_category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled',
  counselor TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create student notes table for voice/text notes
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'text',
  content TEXT NOT NULL,
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create analytics tracking table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public access for now since using mock auth)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on interventions" ON public.interventions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on student_notes" ON public.student_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on analytics_events" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_students_department ON public.students(department);
CREATE INDEX idx_students_risk_category ON public.students(risk_category);
CREATE INDEX idx_students_student_id ON public.students(student_id);
CREATE INDEX idx_interventions_student_id ON public.interventions(student_id);
CREATE INDEX idx_interventions_status ON public.interventions(status);
CREATE INDEX idx_student_notes_student_id ON public.student_notes(student_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON public.interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for students and interventions
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interventions;