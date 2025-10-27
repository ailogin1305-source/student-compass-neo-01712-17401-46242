-- Trigger types regeneration
-- This migration ensures the TypeScript types are properly generated for existing tables

-- Verify tables exist
DO $$
BEGIN
  -- Add a comment to students table to trigger types regeneration
  COMMENT ON TABLE public.students IS 'Student risk assessment data with demographic and academic information';
  COMMENT ON TABLE public.interventions IS 'Scheduled interventions and counseling sessions for at-risk students';
  COMMENT ON TABLE public.student_notes IS 'Notes and observations about student behavior and progress';
  COMMENT ON TABLE public.analytics_events IS 'Analytics tracking for system usage and student interactions';
END $$;