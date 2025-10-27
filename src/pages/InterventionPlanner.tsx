import { useState } from "react";
import { Calendar, Clock, User, CheckCircle2, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const InterventionPlanner = () => {
  const { students } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIntervention, setNewIntervention] = useState({
    student_id: "",
    type: "",
    date: "",
    time: "",
    counselor: "",
    priority: "medium",
  });
  
  const [scheduledInterventions, setScheduledInterventions] = useState([
    {
      id: 1,
      student: "Aarav Kumar",
      student_id: "205631",
      type: "Peer Tutoring",
      date: "2025-11-01",
      time: "10:00 AM",
      counselor: "Dr. Sarah Johnson",
      status: "scheduled",
      priority: "high",
    },
    {
      id: 2,
      student: "Vivaan Sharma",
      student_id: "205645",
      type: "Academic Counseling",
      date: "2025-11-02",
      time: "2:00 PM",
      counselor: "Dr. Michael Chen",
      status: "scheduled",
      priority: "critical",
    },
    {
      id: 3,
      student: "Aditya Patel",
      student_id: "205652",
      type: "Weekly Check-in",
      date: "2025-11-03",
      time: "11:30 AM",
      counselor: "Dr. Sarah Johnson",
      status: "completed",
      priority: "medium",
    },
    {
      id: 4,
      student: "Vihaan Singh",
      student_id: "205678",
      type: "Study Group Session",
      date: "2025-11-04",
      time: "3:00 PM",
      counselor: "Prof. Emily Davis",
      status: "scheduled",
      priority: "high",
    },
  ]);

  const handleScheduleNew = () => {
    if (!newIntervention.student_id || !newIntervention.type || !newIntervention.date || !newIntervention.time || !newIntervention.counselor) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to schedule an intervention.",
        variant: "destructive",
      });
      return;
    }

    const selectedStudent = students.find(s => s.student_id === newIntervention.student_id);
    if (!selectedStudent) return;

    const intervention = {
      id: Date.now(),
      student: selectedStudent.name,
      student_id: newIntervention.student_id,
      type: newIntervention.type,
      date: newIntervention.date,
      time: newIntervention.time,
      counselor: newIntervention.counselor,
      status: "scheduled" as const,
      priority: newIntervention.priority,
    };

    setScheduledInterventions([intervention, ...scheduledInterventions]);
    setIsDialogOpen(false);
    setNewIntervention({
      student_id: "",
      type: "",
      date: "",
      time: "",
      counselor: "",
      priority: "medium",
    });
    
    toast({
      title: "Intervention Scheduled",
      description: `Successfully scheduled ${newIntervention.type} for ${selectedStudent.name}.`,
    });
  };

  const handleMarkComplete = (id: number) => {
    setScheduledInterventions(scheduledInterventions.map(int => 
      int.id === id ? { ...int, status: "completed" as const } : int
    ));
    toast({
      title: "Intervention Completed",
      description: "Intervention has been marked as completed.",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-risk-critical text-white";
      case "high": return "bg-risk-high text-white";
      case "medium": return "bg-risk-medium";
      default: return "bg-risk-low";
    }
  };

  // Calculate real-time counselor workload
  const counselors = [
    { name: "Dr. Sarah Johnson", capacity: 20 },
    { name: "Dr. Michael Chen", capacity: 15 },
    { name: "Prof. Emily Davis", capacity: 10 },
  ];

  const counselorWorkload = counselors.map(counselor => {
    const scheduled = scheduledInterventions.filter(
      int => int.counselor === counselor.name && int.status === "scheduled"
    ).length;
    return {
      ...counselor,
      scheduled,
    };
  });

  // Calculate real-time stats
  const totalScheduled = scheduledInterventions.filter(int => int.status === "scheduled").length;
  const totalCompleted = scheduledInterventions.filter(int => int.status === "completed").length;
  
  // Get interventions for this week (simplified - any scheduled intervention)
  const thisWeekCount = scheduledInterventions.filter(int => {
    const intDate = new Date(int.date);
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    return int.status === "scheduled" && intDate >= today && intDate <= weekFromNow;
  }).length;

  return (
    <div className="space-y-6">
      <div className="card-brutal bg-secondary">
        <h1 className="text-3xl font-bold uppercase mb-2">Intervention Planner</h1>
        <p className="text-sm">Schedule, track, and manage student interventions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-brutal bg-primary">
          <p className="text-sm font-bold uppercase mb-1">Total Scheduled</p>
          <p className="text-4xl font-bold">{totalScheduled}</p>
        </div>
        <div className="card-brutal bg-risk-critical text-white">
          <p className="text-sm font-bold uppercase mb-1">This Week</p>
          <p className="text-4xl font-bold">{thisWeekCount}</p>
        </div>
        <div className="card-brutal bg-risk-low">
          <p className="text-sm font-bold uppercase mb-1">Completed</p>
          <p className="text-4xl font-bold">{totalCompleted}</p>
        </div>
        <div className="card-brutal bg-white">
          <p className="text-sm font-bold uppercase mb-1">Success Rate</p>
          <p className="text-4xl font-bold">
            {totalCompleted + totalScheduled > 0 
              ? Math.round((totalCompleted / (totalCompleted + totalScheduled)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="card-brutal bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Upcoming Interventions
          </h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-brutal bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Schedule New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-4 border-black">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold uppercase">Schedule New Intervention</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Student</Label>
                  <Select value={newIntervention.student_id} onValueChange={(value) => setNewIntervention({ ...newIntervention, student_id: value })}>
                    <SelectTrigger className="border-4 border-black">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      {students.filter(s => s.risk_score > 40).map(student => (
                        <SelectItem key={student.student_id} value={student.student_id}>
                          {student.name} - {student.student_id} (Risk: {student.risk_score})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Intervention Type</Label>
                  <Select value={newIntervention.type} onValueChange={(value) => setNewIntervention({ ...newIntervention, type: value })}>
                    <SelectTrigger className="border-4 border-black">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="Peer Tutoring">Peer Tutoring</SelectItem>
                      <SelectItem value="Academic Counseling">Academic Counseling</SelectItem>
                      <SelectItem value="Weekly Check-in">Weekly Check-in</SelectItem>
                      <SelectItem value="Study Group Session">Study Group Session</SelectItem>
                      <SelectItem value="Mental Health Support">Mental Health Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newIntervention.date}
                      onChange={(e) => setNewIntervention({ ...newIntervention, date: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newIntervention.time}
                      onChange={(e) => setNewIntervention({ ...newIntervention, time: e.target.value })}
                      className="border-4 border-black"
                    />
                  </div>
                </div>

                <div>
                  <Label>Counselor</Label>
                  <Select value={newIntervention.counselor} onValueChange={(value) => setNewIntervention({ ...newIntervention, counselor: value })}>
                    <SelectTrigger className="border-4 border-black">
                      <SelectValue placeholder="Select counselor" />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                      <SelectItem value="Prof. Emily Davis">Prof. Emily Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={newIntervention.priority} onValueChange={(value) => setNewIntervention({ ...newIntervention, priority: value })}>
                    <SelectTrigger className="border-4 border-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-4 border-black">
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleScheduleNew} className="flex-1 btn-brutal bg-primary">
                    Schedule Intervention
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="btn-brutal">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {scheduledInterventions.map((intervention) => (
            <div
              key={intervention.id}
              className="border-4 border-black p-4 bg-muted hover:shadow-brutal transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg">{intervention.student}</h4>
                    <div className={cn(
                      "px-2 py-1 border-2 border-black text-xs font-bold uppercase",
                      getPriorityColor(intervention.priority)
                    )}>
                      {intervention.priority}
                    </div>
                    {intervention.status === "completed" && (
                      <div className="px-2 py-1 bg-risk-low border-2 border-black text-xs font-bold uppercase">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />
                        Completed
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">ID: {intervention.student_id}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date
                      </p>
                      <p className="font-bold">{intervention.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Time
                      </p>
                      <p className="font-bold">{intervention.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Counselor
                      </p>
                      <p className="font-bold">{intervention.counselor}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-bold">{intervention.type}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  className="btn-brutal bg-primary text-xs"
                  asChild
                >
                  <Link to={`/app/students/${intervention.student_id}`}>
                    View Student
                  </Link>
                </Button>
                {intervention.status === "scheduled" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-2 border-black text-xs"
                    onClick={() => handleMarkComplete(intervention.id)}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Allocation */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold uppercase mb-4">Counselor Workload</h3>
        <div className="space-y-4">
          {counselorWorkload.map((counselor, idx) => (
            <div key={idx} className="border-4 border-black p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{counselor.name}</h4>
                <span className="text-sm font-bold">
                  {counselor.scheduled}/{counselor.capacity} sessions
                </span>
              </div>
              <div className="h-6 border-2 border-black bg-white overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    counselor.scheduled / counselor.capacity > 0.8 ? "bg-risk-high" : 
                    counselor.scheduled / counselor.capacity > 0.6 ? "bg-risk-medium" : "bg-primary"
                  )}
                  style={{ width: `${Math.min(100, (counselor.scheduled / counselor.capacity) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterventionPlanner;
