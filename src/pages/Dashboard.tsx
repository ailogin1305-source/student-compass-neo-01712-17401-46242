import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, AlertTriangle, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useData } from "@/contexts/DataContext";
import RiskGauge from "@/components/RiskGauge";

const Dashboard = () => {
  const navigate = useNavigate();
  const { dashboardStats, riskDistribution, departmentStats, students } = useData();
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    atRisk: 0,
    avgRisk: 0,
    alerts: 0,
  });

  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      
      setAnimatedStats({
        total: Math.floor(dashboardStats.total_students * progress),
        atRisk: Math.floor(dashboardStats.total_at_risk * progress),
        avgRisk: Math.floor(dashboardStats.average_risk_score * progress),
        alerts: Math.floor(dashboardStats.today_alerts * progress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [dashboardStats]);

  const pieData = [
    { name: "LOW", value: riskDistribution.LOW, color: "hsl(132, 100%, 50%)" },
    { name: "MEDIUM", value: riskDistribution.MEDIUM, color: "hsl(28, 100%, 50%)" },
    { name: "HIGH", value: riskDistribution.HIGH, color: "hsl(347, 100%, 50%)" },
    { name: "CRITICAL", value: riskDistribution.CRITICAL, color: "hsl(0, 100%, 43%)" },
  ];

  const trendData = [
    { month: "Aug", low: 45, medium: 32, high: 18, critical: 5 },
    { month: "Sep", low: 42, medium: 35, high: 19, critical: 4 },
    { month: "Oct", low: 40, medium: 33, high: 21, critical: 6 },
    { month: "Nov", low: 38, medium: 34, high: 22, critical: 6 },
    { month: "Dec", low: 35, medium: 36, high: 23, critical: 6 },
    { month: "Jan", low: 33, medium: 35, high: 24, critical: 8 },
  ];

  const criticalStudents = students
    .filter(s => s.risk_category === "CRITICAL")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-brutal bg-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase mb-1">Total Students</p>
              <p className="text-4xl font-bold animate-count-up">{animatedStats.total}</p>
            </div>
            <Users className="h-12 w-12" />
          </div>
        </div>

        <div className="card-brutal bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase mb-1">Students at Risk</p>
              <p className="text-4xl font-bold animate-count-up">{animatedStats.atRisk}</p>
              <p className="text-xs mt-1">
                {dashboardStats.total_students > 0 
                  ? `${Math.round((dashboardStats.total_at_risk / dashboardStats.total_students) * 100)}%` 
                  : '0%'} of total
              </p>
            </div>
            <TrendingUp className="h-12 w-12" />
          </div>
        </div>

        <div className="card-brutal bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase mb-1">Avg Risk Score</p>
              <p className="text-4xl font-bold animate-count-up">{animatedStats.avgRisk}</p>
            </div>
            <RiskGauge score={dashboardStats.average_risk_score} size="sm" showLabel={false} />
          </div>
        </div>

        <div className="card-brutal bg-risk-critical text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase mb-1">Critical Alerts</p>
              <p className="text-4xl font-bold animate-count-up">{animatedStats.alerts}</p>
              <p className="text-xs mt-1">Requires immediate action</p>
            </div>
            <AlertTriangle className="h-12 w-12 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="card-brutal bg-white">
          <h3 className="text-xl font-bold mb-4 uppercase">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="#000"
                strokeWidth={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: "3px solid black",
                  borderRadius: 0,
                  boxShadow: "4px 4px 0px black",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 p-2 border-2 border-black"
                style={{ backgroundColor: item.color }}
              >
                <div className="w-4 h-4 border-2 border-black bg-white" />
                <span className="font-bold text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Comparison */}
        <div className="card-brutal bg-white">
          <h3 className="text-xl font-bold mb-4 uppercase">Department Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentStats} layout="vertical">
              <XAxis type="number" stroke="#000" strokeWidth={2} />
              <YAxis dataKey="department" type="category" stroke="#000" strokeWidth={2} width={50} />
              <Tooltip
                contentStyle={{
                  border: "3px solid black",
                  borderRadius: 0,
                  boxShadow: "4px 4px 0px black",
                }}
              />
              <Bar dataKey="percentage" fill="hsl(347, 100%, 50%)" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Trend */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold mb-4 uppercase">Risk Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="month" stroke="#000" strokeWidth={2} />
            <YAxis stroke="#000" strokeWidth={2} />
            <Tooltip
              contentStyle={{
                border: "3px solid black",
                borderRadius: 0,
                boxShadow: "4px 4px 0px black",
              }}
            />
            <Line type="monotone" dataKey="critical" stroke="hsl(0, 100%, 43%)" strokeWidth={4} />
            <Line type="monotone" dataKey="high" stroke="hsl(347, 100%, 50%)" strokeWidth={4} />
            <Line type="monotone" dataKey="medium" stroke="hsl(28, 100%, 50%)" strokeWidth={4} />
            <Line type="monotone" dataKey="low" stroke="hsl(132, 100%, 50%)" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Critical Alerts Feed */}
      <div className="card-brutal bg-risk-critical text-white">
        <h3 className="text-xl font-bold mb-4 uppercase flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          Critical Alerts - Immediate Action Required
        </h3>
        <div className="space-y-3">
          {criticalStudents.map((student) => (
            <div
              key={student.student_id}
              className="bg-white text-foreground p-4 border-4 border-black cursor-pointer hover:shadow-brutal-lg transition-all"
              onClick={() => navigate(`/students/${student.student_id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{student.name}</p>
                  <p className="text-sm">ID: {student.student_id} • {student.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Attendance: {student.attendance}% • CGPA: {student.cgpa}
                  </p>
                </div>
                <RiskGauge score={student.risk_score} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
