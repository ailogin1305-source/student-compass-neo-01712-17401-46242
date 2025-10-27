// Mock data for the student dropout prediction dashboard

export interface Student {
  student_id: string;
  name: string;
  department: string;
  gender: string;
  age: number;
  scholarship: string;
  cgpa: number;
  attendance: number;
  study_hours: number;
  assignments_submitted: number;
  past_failures: number;
  dropout_probability: number;
  risk_score: number;
  risk_category: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
}

export interface RiskFactor {
  feature_name: string;
  feature_value: number | string;
  impact_score: number;
  threshold: number;
  status: "BELOW_THRESHOLD" | "ABOVE_THRESHOLD" | "NORMAL";
  description: string;
}

export interface Intervention {
  priority: "IMMEDIATE" | "SHORT_TERM" | "LONG_TERM";
  category: string;
  action: string;
  expected_impact: number;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Hard";
}

export interface RiskTrend {
  month: string;
  risk_score: number;
}

// Generate mock students
export const generateMockStudents = (count: number): Student[] => {
  const departments = ["CSE", "ECE", "ME", "CE", "EEE", "IT"];
  const names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Dhruv", "Krishna", "Shaurya"];
  const surnames = ["Kumar", "Sharma", "Patel", "Singh", "Reddy", "Rao", "Gupta", "Verma", "Mehta", "Jain"];
  
  return Array.from({ length: count }, (_, i) => {
    const riskScore = Math.floor(Math.random() * 100);
    let riskCategory: Student["risk_category"];
    
    if (riskScore < 30) riskCategory = "LOW";
    else if (riskScore < 60) riskCategory = "MEDIUM";
    else if (riskScore < 80) riskCategory = "HIGH";
    else riskCategory = "CRITICAL";
    
    return {
      student_id: `2056${30 + i}`,
      name: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      gender: Math.random() > 0.5 ? "Male" : "Female",
      age: 18 + Math.floor(Math.random() * 4),
      scholarship: Math.random() > 0.7 ? "Yes" : "No",
      cgpa: parseFloat((5 + Math.random() * 4.5).toFixed(2)),
      attendance: Math.floor(40 + Math.random() * 60),
      study_hours: Math.floor(5 + Math.random() * 35),
      assignments_submitted: Math.floor(50 + Math.random() * 50),
      past_failures: Math.floor(Math.random() * 5),
      dropout_probability: riskScore / 100,
      risk_score: riskScore,
      risk_category: riskCategory,
      confidence: parseFloat((0.75 + Math.random() * 0.24).toFixed(2)),
    };
  });
};

export const mockStudents = generateMockStudents(50);

export const getRiskFactors = (student: Student): RiskFactor[] => {
  return [
    {
      feature_name: "Attendance Rate",
      feature_value: student.attendance,
      impact_score: student.attendance < 75 ? 85 : 20,
      threshold: 75,
      status: (student.attendance < 75 ? "BELOW_THRESHOLD" : "NORMAL") as RiskFactor["status"],
      description: "Low attendance is strongly correlated with dropout risk",
    },
    {
      feature_name: "CGPA",
      feature_value: student.cgpa,
      impact_score: student.cgpa < 6.5 ? 78 : 15,
      threshold: 6.5,
      status: (student.cgpa < 6.5 ? "BELOW_THRESHOLD" : "NORMAL") as RiskFactor["status"],
      description: "Academic performance below threshold increases risk",
    },
    {
      feature_name: "Past Failures",
      feature_value: student.past_failures,
      impact_score: student.past_failures > 1 ? 92 : 10,
      threshold: 1,
      status: (student.past_failures > 1 ? "ABOVE_THRESHOLD" : "NORMAL") as RiskFactor["status"],
      description: "Multiple course failures indicate struggling student",
    },
    {
      feature_name: "Study Hours per Week",
      feature_value: student.study_hours,
      impact_score: student.study_hours < 15 ? 70 : 12,
      threshold: 15,
      status: (student.study_hours < 15 ? "BELOW_THRESHOLD" : "NORMAL") as RiskFactor["status"],
      description: "Insufficient study time correlates with poor outcomes",
    },
    {
      feature_name: "Assignments Submitted",
      feature_value: student.assignments_submitted,
      impact_score: student.assignments_submitted < 80 ? 65 : 8,
      threshold: 80,
      status: (student.assignments_submitted < 80 ? "BELOW_THRESHOLD" : "NORMAL") as RiskFactor["status"],
      description: "Assignment completion is key engagement indicator",
    },
  ].sort((a, b) => b.impact_score - a.impact_score);
};

export const getRecommendedInterventions = (student: Student): Intervention[] => {
  const interventions: Intervention[] = [];
  
  if (student.attendance < 75) {
    interventions.push({
      priority: "IMMEDIATE",
      category: "Attendance",
      action: "Schedule weekly check-ins with faculty advisor to improve attendance habits",
      expected_impact: 25,
      duration: "4 weeks",
      difficulty: "Moderate",
    });
  }
  
  if (student.cgpa < 6.5) {
    interventions.push({
      priority: "IMMEDIATE",
      category: "Academic Support",
      action: "Enroll in peer tutoring program for struggling courses",
      expected_impact: 30,
      duration: "8 weeks",
      difficulty: "Easy",
    });
  }
  
  if (student.past_failures > 1) {
    interventions.push({
      priority: "SHORT_TERM",
      category: "Academic Counseling",
      action: "Work with academic counselor to develop personalized study plan",
      expected_impact: 35,
      duration: "12 weeks",
      difficulty: "Moderate",
    });
  }
  
  if (student.study_hours < 15) {
    interventions.push({
      priority: "SHORT_TERM",
      category: "Time Management",
      action: "Attend time management workshop and create structured study schedule",
      expected_impact: 20,
      duration: "6 weeks",
      difficulty: "Easy",
    });
  }
  
  interventions.push({
    priority: "LONG_TERM",
    category: "Mental Health",
    action: "Connect with campus counseling services for stress management",
    expected_impact: 15,
    duration: "Ongoing",
    difficulty: "Easy",
  });
  
  return interventions;
};

export const getRiskTrend = (student: Student): RiskTrend[] => {
  const currentRisk = student.risk_score;
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  
  return months.map((month, idx) => ({
    month,
    risk_score: Math.max(10, Math.min(100, currentRisk + (Math.random() - 0.5) * 20 - idx * 5)),
  }));
};

export const dashboardStats = {
  total_students: mockStudents.length,
  total_at_risk: mockStudents.filter(s => s.risk_score > 60).length,
  average_risk_score: Math.round(mockStudents.reduce((sum, s) => sum + s.risk_score, 0) / mockStudents.length),
  today_alerts: mockStudents.filter(s => s.risk_category === "CRITICAL").length,
};

export const riskDistribution = {
  LOW: mockStudents.filter(s => s.risk_category === "LOW").length,
  MEDIUM: mockStudents.filter(s => s.risk_category === "MEDIUM").length,
  HIGH: mockStudents.filter(s => s.risk_category === "HIGH").length,
  CRITICAL: mockStudents.filter(s => s.risk_category === "CRITICAL").length,
};

export const departmentStats = ["CSE", "ECE", "ME", "CE", "EEE", "IT"].map(dept => {
  const deptStudents = mockStudents.filter(s => s.department === dept);
  const atRisk = deptStudents.filter(s => s.risk_score > 60).length;
  return {
    department: dept,
    total: deptStudents.length,
    at_risk: atRisk,
    percentage: deptStudents.length > 0 ? Math.round((atRisk / deptStudents.length) * 100) : 0,
  };
}).sort((a, b) => b.percentage - a.percentage);
