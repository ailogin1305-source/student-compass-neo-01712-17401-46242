import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, AlertTriangle, TrendingUp, Target, Users, Network, Edit2, Save, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useData } from "@/contexts/DataContext";
import { type Student } from "@/data/mockData";
import RiskGauge from "@/components/RiskGauge";
import AIPredictionCard from "@/components/AIPredictionCard";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentById, updateStudent, getRiskFactors, getRecommendedInterventions, getRiskTrend, students } = useData();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    cgpa: 0,
    attendance: 0,
    study_hours: 0,
    assignments_submitted: 0,
    past_failures: 0,
  });
  
  // What-If Simulator State
  const [simulatedAttendance, setSimulatedAttendance] = useState(0);
  const [simulatedCGPA, setSimulatedCGPA] = useState(0);
  const [simulatedStudyHours, setSimulatedStudyHours] = useState(0);
  const [simulatedAssignments, setSimulatedAssignments] = useState(0);
  const [simulatedRisk, setSimulatedRisk] = useState(0);

  useEffect(() => {
    const foundStudent = getStudentById(id || "");
    if (foundStudent) {
      setStudent(foundStudent);
      setSimulatedAttendance(foundStudent.attendance);
      setSimulatedCGPA(foundStudent.cgpa);
      setSimulatedStudyHours(foundStudent.study_hours);
      setSimulatedAssignments(foundStudent.assignments_submitted);
      setSimulatedRisk(foundStudent.risk_score);
    }
  }, [id, getStudentById]);

  useEffect(() => {
    if (!student) return;
    
    // Simple risk calculation based on simulated values
    let newRisk = student.risk_score;
    
    if (simulatedAttendance > student.attendance) {
      newRisk -= (simulatedAttendance - student.attendance) * 0.5;
    } else if (simulatedAttendance < student.attendance) {
      newRisk += (student.attendance - simulatedAttendance) * 0.5;
    }
    
    if (simulatedCGPA > student.cgpa) {
      newRisk -= (simulatedCGPA - student.cgpa) * 8;
    } else if (simulatedCGPA < student.cgpa) {
      newRisk += (student.cgpa - simulatedCGPA) * 8;
    }
    
    if (simulatedStudyHours > student.study_hours) {
      newRisk -= (simulatedStudyHours - student.study_hours) * 0.3;
    }
    
    if (simulatedAssignments > student.assignments_submitted) {
      newRisk -= (simulatedAssignments - student.assignments_submitted) * 0.2;
    }
    
    setSimulatedRisk(Math.max(0, Math.min(100, Math.round(newRisk))));
  }, [simulatedAttendance, simulatedCGPA, simulatedStudyHours, simulatedAssignments, student]);

  const startEditing = () => {
    if (!student) return;
    setEditForm({
      name: student.name,
      cgpa: student.cgpa,
      attendance: student.attendance,
      study_hours: student.study_hours,
      assignments_submitted: student.assignments_submitted,
      past_failures: student.past_failures,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveChanges = () => {
    if (!student) return;
    updateStudent(student.student_id, editForm);
    const updatedStudent = getStudentById(student.student_id);
    if (updatedStudent) setStudent(updatedStudent);
    setIsEditing(false);
    toast({
      title: "Student Updated",
      description: "Student information has been successfully updated.",
    });
  };

  if (!student) {
    return (
      <div className="card-brutal bg-white text-center py-12">
        <p className="text-xl font-bold">Student not found</p>
        <Button onClick={() => navigate("/students")} className="mt-4 btn-brutal bg-primary">
          Back to Students
        </Button>
      </div>
    );
  }

  const riskFactors = getRiskFactors(student);
  const interventions = getRecommendedInterventions(student);
  const trendData = getRiskTrend(student);
  
  const shapData = riskFactors.map(factor => ({
    name: factor.feature_name,
    value: factor.impact_score,
    positive: factor.status === "NORMAL",
  }));

  // Similar students
  const similarStudents = students
    .filter(s => s.student_id !== student.student_id && s.department === student.department)
    .map(s => ({
      ...s,
      similarity: 100 - Math.abs(s.risk_score - student.risk_score)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Back Button and Edit */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate("/students")}
          variant="outline"
          className="border-4 border-black hover:shadow-brutal"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        {!isEditing ? (
          <Button onClick={startEditing} className="btn-brutal bg-secondary">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={saveChanges} className="btn-brutal bg-primary">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button onClick={cancelEditing} variant="outline" className="btn-brutal">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Student Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-brutal bg-white">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary border-4 border-black mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {student.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="border-4 border-black text-center font-bold"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                </>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <RiskGauge score={student.risk_score} size="lg" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="font-bold">Department</span>
                <span>{student.department}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="font-bold">Gender</span>
                <span>{student.gender}</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="font-bold">Age</span>
                <span>{student.age} years</span>
              </div>
              <div className="flex justify-between border-b-2 border-black pb-2">
                <span className="font-bold">Scholarship</span>
                <span>{student.scholarship}</span>
              </div>
              
              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs">CGPA</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={editForm.cgpa}
                      onChange={(e) => setEditForm({ ...editForm, cgpa: parseFloat(e.target.value) })}
                      className="border-4 border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Attendance (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.attendance}
                      onChange={(e) => setEditForm({ ...editForm, attendance: parseInt(e.target.value) })}
                      className="border-4 border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Study Hours/Week</Label>
                    <Input
                      type="number"
                      min="0"
                      max="168"
                      value={editForm.study_hours}
                      onChange={(e) => setEditForm({ ...editForm, study_hours: parseInt(e.target.value) })}
                      className="border-4 border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Assignments (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.assignments_submitted}
                      onChange={(e) => setEditForm({ ...editForm, assignments_submitted: parseInt(e.target.value) })}
                      className="border-4 border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Past Failures</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.past_failures}
                      onChange={(e) => setEditForm({ ...editForm, past_failures: parseInt(e.target.value) })}
                      className="border-4 border-black"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between border-b-2 border-black pb-2">
                    <span className="font-bold">CGPA</span>
                    <span className="text-lg font-bold">{student.cgpa}</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-black pb-2">
                    <span className="font-bold">Attendance</span>
                    <span className="text-lg font-bold">{student.attendance}%</span>
                  </div>
                  <div className="flex justify-between border-b-2 border-black pb-2">
                    <span className="font-bold">Study Hours/Week</span>
                    <span>{student.study_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Confidence</span>
                    <span>{(student.confidence * 100).toFixed(0)}%</span>
                  </div>
                </>
              )}
            </div>

            <Button className="w-full mt-6 btn-brutal bg-primary">
              <Mail className="mr-2 h-4 w-4" />
              Contact Counselor
            </Button>
          </div>
        </div>

        {/* Right Panel: Analysis Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-6 border-4 border-black bg-muted p-0 gap-0">
              <TabsTrigger value="ai" className="border-r-4 border-black data-[state=active]:bg-brutal-purple data-[state=active]:text-white">
                <Brain className="mr-1 h-4 w-4" />
                AI
              </TabsTrigger>
              <TabsTrigger value="risk" className="border-r-4 border-black data-[state=active]:bg-primary">
                Risk
              </TabsTrigger>
              <TabsTrigger value="interventions" className="border-r-4 border-black data-[state=active]:bg-primary">
                Actions
              </TabsTrigger>
              <TabsTrigger value="simulator" className="border-r-4 border-black data-[state=active]:bg-secondary">
                What-If
              </TabsTrigger>
              <TabsTrigger value="similar" className="border-r-4 border-black data-[state=active]:bg-primary">
                Similar
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-brutal-purple data-[state=active]:text-white">
                Network
              </TabsTrigger>
            </TabsList>

            {/* AI Prediction Tab */}
            <TabsContent value="ai" className="space-y-6 mt-6">
              <AIPredictionCard studentId={student.student_id} />
            </TabsContent>

            {/* Risk Analysis Tab */}
            <TabsContent value="risk" className="space-y-6 mt-6">
              <div className="card-brutal bg-white">
                <h3 className="text-xl font-bold mb-4 uppercase">SHAP Force Plot</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={shapData} layout="vertical">
                    <XAxis type="number" stroke="#000" strokeWidth={2} />
                    <YAxis dataKey="name" type="category" stroke="#000" strokeWidth={2} width={150} />
                    <Tooltip
                      contentStyle={{
                        border: "3px solid black",
                        borderRadius: 0,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={2}
                      fill="hsl(347, 100%, 50%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card-brutal bg-white">
                <h3 className="text-xl font-bold mb-4 uppercase">Risk Factors Breakdown</h3>
                <div className="space-y-4">
                  {riskFactors.map((factor, idx) => (
                    <div key={idx} className="border-4 border-black p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold">{factor.feature_name}</h4>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                        <div className={cn(
                          "px-3 py-1 border-2 border-black text-xs font-bold",
                          factor.status === "NORMAL" ? "bg-risk-low" : "bg-risk-high text-white"
                        )}>
                          {factor.status === "NORMAL" ? "✓ OK" : "✗ ALERT"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Value</p>
                          <p className="font-bold text-lg">{factor.feature_value}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Threshold</p>
                          <p className="font-bold text-lg">{factor.threshold}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Impact Score</span>
                          <span className="font-bold">{factor.impact_score}/100</span>
                        </div>
                        <Progress value={factor.impact_score} className="h-4 border-2 border-black" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-brutal bg-white">
                <h3 className="text-xl font-bold mb-4 uppercase">Risk Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" stroke="#000" strokeWidth={2} />
                    <YAxis stroke="#000" strokeWidth={2} />
                    <Tooltip
                      contentStyle={{
                        border: "3px solid black",
                        borderRadius: 0,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk_score"
                      stroke="hsl(347, 100%, 50%)"
                      strokeWidth={4}
                      dot={{ fill: "hsl(347, 100%, 50%)", strokeWidth: 3, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Interventions Tab */}
            <TabsContent value="interventions" className="space-y-6 mt-6">
              <div className="card-brutal bg-white">
                <h3 className="text-xl font-bold mb-4 uppercase">Recommended Interventions</h3>
                <div className="space-y-4">
                  {interventions.map((intervention, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "border-4 border-black p-4",
                        intervention.priority === "IMMEDIATE" && "bg-risk-critical text-white",
                        intervention.priority === "SHORT_TERM" && "bg-risk-medium",
                        intervention.priority === "LONG_TERM" && "bg-secondary"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "px-3 py-1 border-2 border-black font-bold text-xs uppercase",
                          intervention.priority === "IMMEDIATE" && "bg-white text-black"
                        )}>
                          {intervention.priority}
                        </div>
                        <div className="text-right">
                          <p className="text-xs">Expected Impact</p>
                          <p className="text-2xl font-bold">-{intervention.expected_impact}%</p>
                        </div>
                      </div>
                      <h4 className="font-bold mb-1">{intervention.category}</h4>
                      <p className="text-sm mb-3">{intervention.action}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span>Duration: <strong>{intervention.duration}</strong></span>
                        <span>Difficulty: <strong>{intervention.difficulty}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* What-If Simulator Tab */}
            <TabsContent value="simulator" className="space-y-6 mt-6">
              <div className="card-brutal bg-secondary">
                <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Interactive What-If Simulator
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border-4 border-black p-4 bg-white">
                    <p className="text-sm font-bold mb-2">CURRENT RISK</p>
                    <RiskGauge score={student.risk_score} size="md" />
                  </div>
                  <div className="border-4 border-black p-4 bg-white">
                    <p className="text-sm font-bold mb-2">SIMULATED RISK</p>
                    <RiskGauge score={simulatedRisk} size="md" />
                    <p className={cn(
                      "text-center mt-2 font-bold",
                      simulatedRisk < student.risk_score ? "text-risk-low" : "text-risk-high"
                    )}>
                      {simulatedRisk < student.risk_score ? "↓" : "↑"} 
                      {Math.abs(simulatedRisk - student.risk_score)} points
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-4 border-black p-4 bg-white">
                    <label className="font-bold mb-2 block">Attendance Rate: {simulatedAttendance}%</label>
                    <Slider
                      value={[simulatedAttendance]}
                      onValueChange={(val) => setSimulatedAttendance(val[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="my-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {student.attendance}% | Target: 85%+
                    </p>
                  </div>

                  <div className="border-4 border-black p-4 bg-white">
                    <label className="font-bold mb-2 block">CGPA: {simulatedCGPA.toFixed(2)}</label>
                    <Slider
                      value={[simulatedCGPA * 10]}
                      onValueChange={(val) => setSimulatedCGPA(val[0] / 10)}
                      min={0}
                      max={100}
                      step={1}
                      className="my-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {student.cgpa} | Target: 7.0+
                    </p>
                  </div>

                  <div className="border-4 border-black p-4 bg-white">
                    <label className="font-bold mb-2 block">Study Hours/Week: {simulatedStudyHours}h</label>
                    <Slider
                      value={[simulatedStudyHours]}
                      onValueChange={(val) => setSimulatedStudyHours(val[0])}
                      min={0}
                      max={40}
                      step={1}
                      className="my-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {student.study_hours}h | Target: 20h+
                    </p>
                  </div>

                  <div className="border-4 border-black p-4 bg-white">
                    <label className="font-bold mb-2 block">Assignments Submitted: {simulatedAssignments}%</label>
                    <Slider
                      value={[simulatedAssignments]}
                      onValueChange={(val) => setSimulatedAssignments(val[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="my-4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {student.assignments_submitted}% | Target: 90%+
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Similar Students Tab */}
            <TabsContent value="similar" className="space-y-6 mt-6">
              <div className="card-brutal bg-white">
                <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Similar Students in {student.department}
                </h3>
                <div className="space-y-3">
                  {similarStudents.map((similar) => (
                    <div
                      key={similar.student_id}
                      className="border-4 border-black p-4 bg-muted cursor-pointer hover:shadow-brutal transition-all"
                      onClick={() => navigate(`/students/${similar.student_id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold">{similar.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {similar.student_id}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span>CGPA: <strong>{similar.cgpa}</strong></span>
                            <span>Attendance: <strong>{similar.attendance}%</strong></span>
                            <span>Similarity: <strong>{similar.similarity.toFixed(0)}%</strong></span>
                          </div>
                        </div>
                        <RiskGauge score={similar.risk_score} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network" className="space-y-6 mt-6">
              <div className="card-brutal bg-brutal-purple text-white">
                <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
                  <Network className="h-6 w-6" />
                  Student Support Network
                </h3>
                <p className="text-sm mb-4">Connections and support resources for this student</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-4 border-black p-4 bg-white text-foreground">
                    <p className="text-sm font-bold mb-1">Academic Advisor</p>
                    <p className="text-xs">Dr. Sarah Johnson</p>
                  </div>
                  <div className="border-4 border-black p-4 bg-white text-foreground">
                    <p className="text-sm font-bold mb-1">Peer Mentor</p>
                    <p className="text-xs">Not Assigned</p>
                  </div>
                  <div className="border-4 border-black p-4 bg-white text-foreground">
                    <p className="text-sm font-bold mb-1">Study Group</p>
                    <p className="text-xs">{student.department} Group A</p>
                  </div>
                  <div className="border-4 border-black p-4 bg-white text-foreground">
                    <p className="text-sm font-bold mb-1">Counselor</p>
                    <p className="text-xs">Dr. Michael Chen</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
