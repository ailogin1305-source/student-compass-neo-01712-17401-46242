import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, AlertTriangle, TrendingUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { type Student } from "@/data/mockData";
import RiskGauge from "@/components/RiskGauge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const StudentsList = () => {
  const navigate = useNavigate();
  const { students, deleteStudent } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("risk_score");

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.includes(searchTerm);
      const matchesDepartment = departmentFilter === "ALL" || student.department === departmentFilter;
      const matchesRisk = riskFilter === "ALL" || student.risk_category === riskFilter;
      return matchesSearch && matchesDepartment && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === "risk_score") return b.risk_score - a.risk_score;
      if (sortBy === "cgpa") return a.cgpa - b.cgpa;
      if (sortBy === "attendance") return a.attendance - b.attendance;
      return 0;
    });

  const handleDelete = (e: React.MouseEvent, studentId: string, studentName: string) => {
    e.stopPropagation();
    deleteStudent(studentId);
    toast({
      title: "Student Deleted",
      description: `${studentName} has been removed from the system.`,
    });
  };

  const handleExportResults = () => {
    // Create CSV content
    const headers = ["Student ID", "Name", "Department", "Gender", "Age", "CGPA", "Attendance", "Risk Score", "Risk Category"];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map(student => 
        [
          student.student_id,
          `"${student.name}"`,
          student.department,
          student.gender,
          student.age,
          student.cgpa,
          student.attendance,
          student.risk_score,
          student.risk_category
        ].join(",")
      )
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredStudents.length} student records to CSV.`,
    });
  };

  const getRiskBorderColor = (category: Student["risk_category"]) => {
    switch (category) {
      case "LOW": return "border-risk-low";
      case "MEDIUM": return "border-risk-medium";
      case "HIGH": return "border-risk-high";
      case "CRITICAL": return "border-risk-critical";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="card-brutal bg-white">
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-4 border-black"
                />
              </div>
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] border-4 border-black">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                <SelectItem value="ALL">All Departments</SelectItem>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="CE">CE</SelectItem>
                <SelectItem value="EEE">EEE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px] border-4 border-black">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                <SelectItem value="ALL">All Risk Levels</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] border-4 border-black">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                <SelectItem value="risk_score">Risk Score</SelectItem>
                <SelectItem value="cgpa">CGPA</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">
              Showing {filteredStudents.length} of {students.length} students
            </p>
            <Button onClick={handleExportResults} className="btn-brutal bg-primary">
              <Filter className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.student_id}
            className={cn(
              "card-brutal bg-white cursor-pointer border-l-8",
              getRiskBorderColor(student.risk_category)
            )}
            onClick={() => navigate(`/students/${student.student_id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                <p className="text-sm font-bold mt-1">{student.department}</p>
              </div>
              <RiskGauge score={student.risk_score} size="sm" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>CGPA: <strong>{student.cgpa}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Attendance: <strong>{student.attendance}%</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-black">
              <p className="text-xs font-bold uppercase mb-2">Top Risk Factors</p>
              <div className="space-y-1">
                {student.attendance < 75 && (
                  <div className="text-xs px-2 py-1 bg-risk-high text-white border-2 border-black">
                    Low Attendance
                  </div>
                )}
                {student.cgpa < 6.5 && (
                  <div className="text-xs px-2 py-1 bg-risk-medium border-2 border-black">
                    Low CGPA
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1 btn-brutal bg-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/app/students/${student.student_id}`);
                }}
              >
                View Details
              </Button>
              <Button 
                variant="destructive"
                size="icon"
                className="btn-brutal"
                onClick={(e) => handleDelete(e, student.student_id, student.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="card-brutal bg-white text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Students Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
