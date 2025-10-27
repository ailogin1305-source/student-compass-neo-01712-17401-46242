import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  mockStudents as initialStudents, 
  generateMockStudents,
  getRiskFactors,
  getRecommendedInterventions,
  getRiskTrend,
  type Student,
  type RiskFactor,
  type Intervention,
  type RiskTrend
} from "@/data/mockData";

interface DataContextType {
  students: Student[];
  addStudent: (student: Omit<Student, "student_id" | "dropout_probability" | "risk_score" | "risk_category" | "confidence">) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  getStudentById: (studentId: string) => Student | undefined;
  getRiskFactors: (student: Student) => RiskFactor[];
  getRecommendedInterventions: (student: Student) => Intervention[];
  getRiskTrend: (student: Student) => RiskTrend[];
  batchUploadStudents: (count: number) => void;
  dashboardStats: {
    total_students: number;
    total_at_risk: number;
    average_risk_score: number;
    today_alerts: number;
  };
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  departmentStats: Array<{
    department: string;
    total: number;
    at_risk: number;
    percentage: number;
  }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const calculateRiskMetrics = (student: Partial<Student>) => {
    // Calculate risk score based on various factors
    let riskScore = 0;
    
    // Attendance factor (0-30 points)
    if (student.attendance < 50) riskScore += 30;
    else if (student.attendance < 75) riskScore += 20;
    else if (student.attendance < 85) riskScore += 10;
    
    // CGPA factor (0-25 points)
    if (student.cgpa < 5.0) riskScore += 25;
    else if (student.cgpa < 6.5) riskScore += 15;
    else if (student.cgpa < 7.5) riskScore += 5;
    
    // Past failures factor (0-20 points)
    riskScore += Math.min(student.past_failures * 7, 20);
    
    // Study hours factor (0-15 points)
    if (student.study_hours < 10) riskScore += 15;
    else if (student.study_hours < 15) riskScore += 10;
    else if (student.study_hours < 20) riskScore += 5;
    
    // Assignments factor (0-10 points)
    if (student.assignments_submitted < 60) riskScore += 10;
    else if (student.assignments_submitted < 80) riskScore += 5;
    
    riskScore = Math.min(riskScore, 100);
    
    let riskCategory: Student["risk_category"];
    if (riskScore < 30) riskCategory = "LOW";
    else if (riskScore < 60) riskCategory = "MEDIUM";
    else if (riskScore < 80) riskCategory = "HIGH";
    else riskCategory = "CRITICAL";
    
    return {
      risk_score: riskScore,
      dropout_probability: riskScore / 100,
      risk_category: riskCategory,
      confidence: parseFloat((0.75 + Math.random() * 0.24).toFixed(2)),
    };
  };

  const addStudent = (studentData: Omit<Student, "student_id" | "dropout_probability" | "risk_score" | "risk_category" | "confidence">) => {
    const newId = `${Math.floor(Math.random() * 900000) + 100000}`;
    const riskMetrics = calculateRiskMetrics(studentData);
    
    const newStudent: Student = {
      ...studentData,
      student_id: newId,
      ...riskMetrics,
    };
    
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(student => {
      if (student.student_id === studentId) {
        const updated = { ...student, ...updates };
        // Recalculate risk metrics if relevant fields changed
        if ('attendance' in updates || 'cgpa' in updates || 'past_failures' in updates || 
            'study_hours' in updates || 'assignments_submitted' in updates) {
          const riskMetrics = calculateRiskMetrics(updated);
          return { ...updated, ...riskMetrics };
        }
        return updated;
      }
      return student;
    }));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.student_id !== studentId));
  };

  const getStudentById = (studentId: string) => {
    return students.find(student => student.student_id === studentId);
  };

  const batchUploadStudents = (count: number) => {
    const newStudents = generateMockStudents(count);
    setStudents(prev => [...prev, ...newStudents]);
  };

  // Calculate dashboard stats dynamically
  const dashboardStats = {
    total_students: students.length,
    total_at_risk: students.filter(s => s.risk_score > 60).length,
    average_risk_score: Math.round(students.reduce((sum, s) => sum + s.risk_score, 0) / students.length) || 0,
    today_alerts: students.filter(s => s.risk_category === "CRITICAL").length,
  };

  const riskDistribution = {
    LOW: students.filter(s => s.risk_category === "LOW").length,
    MEDIUM: students.filter(s => s.risk_category === "MEDIUM").length,
    HIGH: students.filter(s => s.risk_category === "HIGH").length,
    CRITICAL: students.filter(s => s.risk_category === "CRITICAL").length,
  };

  const departmentStats = ["CSE", "ECE", "ME", "CE", "EEE", "IT"].map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    const atRisk = deptStudents.filter(s => s.risk_score > 60).length;
    return {
      department: dept,
      total: deptStudents.length,
      at_risk: atRisk,
      percentage: deptStudents.length > 0 ? Math.round((atRisk / deptStudents.length) * 100) : 0,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  return (
    <DataContext.Provider 
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudentById,
        getRiskFactors,
        getRecommendedInterventions,
        getRiskTrend,
        batchUploadStudents,
        dashboardStats,
        riskDistribution,
        departmentStats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
