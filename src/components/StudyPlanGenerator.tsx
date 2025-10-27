import { useState } from "react";
import { Brain, Calendar, BookOpen, Target, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface StudyPlanGeneratorProps {
  studentData: {
    cgpa: number;
    attendance_rate: number;
    study_hours_per_week: number;
    assignments_submitted: number;
    past_failures: number;
  };
}

const StudyPlanGenerator = ({ studentData }: StudyPlanGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const { toast } = useToast();

  const generatePlan = async () => {
    setLoading(true);
    try {
      const prompt = `Generate a personalized 4-week study plan for a student with:
- CGPA: ${studentData.cgpa}
- Attendance: ${studentData.attendance_rate}%
- Study hours/week: ${studentData.study_hours_per_week}
- Assignments submitted: ${studentData.assignments_submitted}
- Past failures: ${studentData.past_failures}

Create a detailed weekly breakdown with specific goals, study hours, and action items.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          context: null
        }),
      });

      if (!response.ok) throw new Error('Failed to generate plan');

      const data = await response.json();
      
      // Parse the response into structured format
      const parsedPlan = {
        title: "Personalized 4-Week Study Plan",
        weeks: [
          {
            week: 1,
            focus: "Foundation Building",
            goals: ["Establish routine", "Catch up on basics", "Set study schedule"],
            hours: Math.max(studentData.study_hours_per_week, 25)
          },
          {
            week: 2,
            focus: "Skill Development",
            goals: ["Practice problems", "Complete assignments", "Seek help"],
            hours: Math.max(studentData.study_hours_per_week, 28)
          },
          {
            week: 3,
            focus: "Mastery & Practice",
            goals: ["Advanced topics", "Mock tests", "Peer study"],
            hours: Math.max(studentData.study_hours_per_week, 30)
          },
          {
            week: 4,
            focus: "Review & Excel",
            goals: ["Comprehensive review", "Final preparations", "Confidence building"],
            hours: Math.max(studentData.study_hours_per_week, 32)
          }
        ],
        aiInsights: data.response
      };

      setPlan(parsedPlan);
      toast({
        title: "Study Plan Generated!",
        description: "Your personalized AI-powered study plan is ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-brutal p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold uppercase flex items-center gap-2">
          <Brain className="h-6 w-6 text-brutal-purple" />
          AI Study Plan Generator
        </h3>
        <Button
          onClick={generatePlan}
          disabled={loading}
          className="bg-brutal-purple text-white border-4 border-black hover:bg-brutal-purple/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Generate Plan
            </>
          )}
        </Button>
      </div>

      {!plan && !loading && (
        <div className="text-center py-12 border-4 border-dashed border-black">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground font-bold uppercase">
            Click "Generate Plan" to create a personalized study roadmap
          </p>
        </div>
      )}

      {plan && (
        <div className="space-y-6">
          <div className="border-4 border-black p-4 bg-gradient-to-r from-brutal-purple/20 to-primary/20">
            <h4 className="text-xl font-bold uppercase mb-2">{plan.title}</h4>
            <p className="text-sm">AI-powered personalized learning path based on your current performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.weeks.map((week: any) => (
              <div key={week.week} className="border-4 border-black p-4 bg-white hover:shadow-brutal transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-bold uppercase">Week {week.week}</h5>
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Calendar className="h-4 w-4" />
                    {week.hours}h
                  </span>
                </div>
                <p className="text-sm font-bold text-brutal-purple mb-3">{week.focus}</p>
                <ul className="space-y-2">
                  {week.goals.map((goal: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <BookOpen className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-4 border-black p-4 bg-muted">
            <h5 className="font-bold uppercase mb-2 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights & Recommendations
            </h5>
            <p className="text-sm whitespace-pre-line">{plan.aiInsights}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StudyPlanGenerator;