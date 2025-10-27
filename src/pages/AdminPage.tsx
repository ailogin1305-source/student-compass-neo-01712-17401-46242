import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, TrendingUp, Upload } from "lucide-react";
import type { Student } from "@/types/database";

const AdminPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    gender: "",
    department: "",
    scholarship: false,
    parental_education: "",
    extra_curricular: false,
    age: "",
    cgpa: "",
    attendance_rate: "",
    family_income: "",
    past_failures: "",
    study_hours_per_week: "",
    assignments_submitted: "",
    projects_completed: "",
    total_activities: "",
    sports_participation: false,
  });

  const calculateRiskScore = () => {
    const weights = {
      attendance: 0.25,
      cgpa: 0.25,
      assignments: 0.15,
      study_hours: 0.15,
      past_failures: 0.10,
      activities: 0.10,
    };

    const attendance = parseFloat(formData.attendance_rate) || 0;
    const cgpa = parseFloat(formData.cgpa) || 0;
    const assignments = parseInt(formData.assignments_submitted) || 0;
    const studyHours = parseFloat(formData.study_hours_per_week) || 0;
    const failures = parseInt(formData.past_failures) || 0;
    const activities = parseInt(formData.total_activities) || 0;

    const normalizedScores = {
      attendance: (100 - attendance) / 100,
      cgpa: (4.0 - cgpa) / 4.0,
      assignments: Math.max(0, (30 - assignments) / 30),
      studyHours: Math.max(0, (40 - studyHours) / 40),
      failures: Math.min(failures / 3, 1),
      activities: Math.max(0, (10 - activities) / 10),
    };

    const riskScore = (
      normalizedScores.attendance * weights.attendance +
      normalizedScores.cgpa * weights.cgpa +
      normalizedScores.assignments * weights.assignments +
      normalizedScores.studyHours * weights.study_hours +
      normalizedScores.failures * weights.past_failures +
      normalizedScores.activities * weights.activities
    ) * 100;

    return riskScore;
  };

  const getRiskCategory = (score: number) => {
    if (score >= 75) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 25) return "MEDIUM";
    return "LOW";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const riskScore = calculateRiskScore();
      const riskCategory = getRiskCategory(riskScore);

      const { error } = await supabase.from("students").insert({
        student_id: formData.student_id,
        gender: formData.gender,
        department: formData.department,
        scholarship: formData.scholarship,
        parental_education: formData.parental_education,
        extra_curricular: formData.extra_curricular,
        age: parseInt(formData.age),
        cgpa: parseFloat(formData.cgpa),
        attendance_rate: parseFloat(formData.attendance_rate),
        family_income: parseFloat(formData.family_income),
        past_failures: parseInt(formData.past_failures),
        study_hours_per_week: parseFloat(formData.study_hours_per_week),
        assignments_submitted: parseInt(formData.assignments_submitted),
        projects_completed: parseInt(formData.projects_completed),
        total_activities: parseInt(formData.total_activities),
        sports_participation: formData.sports_participation,
        risk_score: riskScore,
        risk_category: riskCategory,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Student ${formData.student_id} added successfully with ${riskCategory} risk.`,
      });

      // Reset form
      setFormData({
        student_id: "",
        gender: "",
        department: "",
        scholarship: false,
        parental_education: "",
        extra_curricular: false,
        age: "",
        cgpa: "",
        attendance_rate: "",
        family_income: "",
        past_failures: "",
        study_hours_per_week: "",
        assignments_submitted: "",
        projects_completed: "",
        total_activities: "",
        sports_participation: false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-brutal-purple/10 via-background to-primary/10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="card-brutal bg-gradient-to-r from-brutal-purple to-primary text-white p-8">
          <h1 className="text-4xl font-bold uppercase flex items-center gap-4">
            <Database className="h-10 w-10" />
            Admin Control Panel
          </h1>
          <p className="mt-2 text-lg opacity-90">ML Model Integration & Data Management</p>
        </div>

        <Tabs defaultValue="add-student" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 border-4 border-black">
            <TabsTrigger value="add-student" className="uppercase font-bold">
              <Users className="h-4 w-4 mr-2" />
              Add Student
            </TabsTrigger>
            <TabsTrigger value="bulk-upload" className="uppercase font-bold">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="analytics" className="uppercase font-bold">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-student">
            <Card className="card-brutal p-8 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="font-bold uppercase">Student ID *</Label>
                    <Input
                      required
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="border-4 border-black">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Department *</Label>
                    <Select required value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger className="border-4 border-black">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">Computer Science</SelectItem>
                        <SelectItem value="ECE">Electronics</SelectItem>
                        <SelectItem value="ME">Mechanical</SelectItem>
                        <SelectItem value="CE">Civil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Age</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">CGPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Attendance Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.attendance_rate}
                      onChange={(e) => setFormData({ ...formData, attendance_rate: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Study Hours/Week</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.study_hours_per_week}
                      onChange={(e) => setFormData({ ...formData, study_hours_per_week: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Assignments Submitted</Label>
                    <Input
                      type="number"
                      value={formData.assignments_submitted}
                      onChange={(e) => setFormData({ ...formData, assignments_submitted: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Projects Completed</Label>
                    <Input
                      type="number"
                      value={formData.projects_completed}
                      onChange={(e) => setFormData({ ...formData, projects_completed: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Past Failures</Label>
                    <Input
                      type="number"
                      value={formData.past_failures}
                      onChange={(e) => setFormData({ ...formData, past_failures: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Total Activities</Label>
                    <Input
                      type="number"
                      value={formData.total_activities}
                      onChange={(e) => setFormData({ ...formData, total_activities: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Family Income</Label>
                    <Input
                      type="number"
                      value={formData.family_income}
                      onChange={(e) => setFormData({ ...formData, family_income: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div>
                    <Label className="font-bold uppercase">Parental Education</Label>
                    <Input
                      value={formData.parental_education}
                      onChange={(e) => setFormData({ ...formData, parental_education: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="scholarship"
                      checked={formData.scholarship}
                      onChange={(e) => setFormData({ ...formData, scholarship: e.target.checked })}
                      className="w-6 h-6 border-4 border-black"
                    />
                    <Label htmlFor="scholarship" className="font-bold uppercase">Scholarship</Label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="extra_curricular"
                      checked={formData.extra_curricular}
                      onChange={(e) => setFormData({ ...formData, extra_curricular: e.target.checked })}
                      className="w-6 h-6 border-4 border-black"
                    />
                    <Label htmlFor="extra_curricular" className="font-bold uppercase">Extra Curricular</Label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="sports"
                      checked={formData.sports_participation}
                      onChange={(e) => setFormData({ ...formData, sports_participation: e.target.checked })}
                      className="w-6 h-6 border-4 border-black"
                    />
                    <Label htmlFor="sports" className="font-bold uppercase">Sports Participation</Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brutal-purple text-white border-4 border-black hover:bg-brutal-purple/90 shadow-brutal hover:shadow-brutal-lg text-xl py-6 uppercase font-bold"
                >
                  {loading ? "Adding..." : "Add Student to Database"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-upload">
            <Card className="card-brutal p-8 bg-white text-center">
              <Upload className="h-20 w-20 mx-auto mb-4 text-brutal-purple" />
              <h3 className="text-2xl font-bold uppercase mb-4">Bulk CSV Upload</h3>
              <p className="mb-6 text-muted-foreground">Navigate to the Batch Upload page for CSV upload functionality</p>
              <Button className="bg-primary border-4 border-black shadow-brutal">
                Go to Batch Upload
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="card-brutal p-8 bg-white">
              <TrendingUp className="h-16 w-16 mb-4 text-brutal-purple" />
              <h3 className="text-2xl font-bold uppercase mb-4">Real-time Analytics</h3>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;