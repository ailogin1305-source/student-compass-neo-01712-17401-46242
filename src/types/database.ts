// Database types for students and related tables
// This provides type safety until Supabase types regenerate

export interface Student {
  id: string;
  student_id: string;
  gender: string | null;
  department: string;
  scholarship: boolean | null;
  parental_education: string | null;
  extra_curricular: boolean | null;
  age: number | null;
  cgpa: number | null;
  attendance_rate: number | null;
  family_income: number | null;
  past_failures: number | null;
  study_hours_per_week: number | null;
  assignments_submitted: number | null;
  projects_completed: number | null;
  total_activities: number | null;
  sports_participation: boolean | null;
  dropout: boolean | null;
  risk_score: number | null;
  risk_category: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Intervention {
  id: string;
  student_id: string | null;
  intervention_type: string;
  scheduled_date: string;
  description: string | null;
  status: string | null;
  counselor: string | null;
  outcome: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface StudentNote {
  id: string;
  student_id: string | null;
  content: string;
  note_type: string | null;
  sentiment: string | null;
  created_at: string | null;
}

export interface AnalyticsEvent {
  id: string;
  student_id: string | null;
  event_type: string;
  metadata: any;
  created_at: string | null;
}
