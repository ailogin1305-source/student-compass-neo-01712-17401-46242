import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";

const Analytics = () => {
  const { departmentStats } = useData();
  
  const interventionData = [
    { type: "Peer Tutoring", success: 78, cost: 2500, roi: 3.2 },
    { type: "Weekly Check-ins", success: 65, cost: 1000, roi: 6.5 },
    { type: "Study Groups", success: 61, cost: 500, roi: 12.2 },
    { type: "Mental Health Support", success: 55, cost: 3000, roi: 1.8 },
    { type: "Academic Counseling", success: 72, cost: 2000, roi: 3.6 },
  ];

  const cohortData = [
    { month: "Aug", cohort_2023: 95, cohort_2022: 92, cohort_2021: 88 },
    { month: "Sep", cohort_2023: 93, cohort_2022: 90, cohort_2021: 85 },
    { month: "Oct", cohort_2023: 91, cohort_2022: 88, cohort_2021: 82 },
    { month: "Nov", cohort_2023: 89, cohort_2022: 85, cohort_2021: 79 },
    { month: "Dec", cohort_2023: 87, cohort_2022: 83, cohort_2021: 76 },
  ];

  const radarData = [
    { factor: "Attendance", value: 85 },
    { factor: "CGPA", value: 72 },
    { factor: "Study Time", value: 65 },
    { factor: "Assignments", value: 78 },
    { factor: "Failures", value: 40 },
    { factor: "Engagement", value: 82 },
  ];

  return (
    <div className="space-y-6">
      <div className="card-brutal bg-primary">
        <h1 className="text-3xl font-bold uppercase mb-2">Analytics Hub</h1>
        <p className="text-sm">Deep dive into patterns, trends, and intervention effectiveness</p>
      </div>

      {/* Department Deep Dive */}
      <div className="card-brutal bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase">Department Deep Dive</h3>
          <Select defaultValue="CSE">
            <SelectTrigger className="w-[180px] border-4 border-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-4 border-black">
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
              <SelectItem value="ME">ME</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border-4 border-black p-4 bg-primary">
            <p className="text-sm font-bold uppercase mb-1">Total Students</p>
            <p className="text-4xl font-bold">156</p>
          </div>
          <div className="border-4 border-black p-4 bg-risk-medium">
            <p className="text-sm font-bold uppercase mb-1">At-Risk Rate</p>
            <p className="text-4xl font-bold">14%</p>
          </div>
          <div className="border-4 border-black p-4 bg-secondary">
            <p className="text-sm font-bold uppercase mb-1">Avg CGPA</p>
            <p className="text-4xl font-bold">7.2</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={departmentStats}>
            <XAxis dataKey="department" stroke="#000" strokeWidth={2} />
            <YAxis stroke="#000" strokeWidth={2} />
            <Tooltip
              contentStyle={{
                border: "3px solid black",
                borderRadius: 0,
              }}
            />
            <Bar dataKey="at_risk" fill="hsl(347, 100%, 50%)" stroke="#000" strokeWidth={2} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cohort Analysis */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Cohort Survival Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cohortData}>
            <XAxis dataKey="month" stroke="#000" strokeWidth={2} />
            <YAxis stroke="#000" strokeWidth={2} />
            <Tooltip
              contentStyle={{
                border: "3px solid black",
                borderRadius: 0,
              }}
            />
            <Line type="monotone" dataKey="cohort_2023" stroke="hsl(191, 100%, 50%)" strokeWidth={4} />
            <Line type="monotone" dataKey="cohort_2022" stroke="hsl(28, 100%, 50%)" strokeWidth={4} />
            <Line type="monotone" dataKey="cohort_2021" stroke="hsl(347, 100%, 50%)" strokeWidth={4} />
          </LineChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex items-center gap-2 border-2 border-black p-2 bg-primary">
            <div className="w-4 h-4 bg-primary border-2 border-black" />
            <span className="text-xs font-bold">2023 Cohort</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black p-2 bg-risk-medium">
            <div className="w-4 h-4 bg-risk-medium border-2 border-black" />
            <span className="text-xs font-bold">2022 Cohort</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black p-2 bg-risk-high">
            <div className="w-4 h-4 bg-risk-high border-2 border-black" />
            <span className="text-xs font-bold">2021 Cohort</span>
          </div>
        </div>
      </div>

      {/* Intervention Effectiveness */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
          <Award className="h-6 w-6" />
          Intervention Effectiveness & ROI
        </h3>
        <div className="space-y-4">
          {interventionData.map((intervention, idx) => (
            <div key={idx} className="border-4 border-black p-4 bg-muted">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg">{intervention.type}</h4>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{intervention.success}%</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cost</p>
                  <p className="font-bold">₹{intervention.cost}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className="font-bold">{intervention.roi}x</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cases</p>
                  <p className="font-bold">{Math.floor(Math.random() * 100 + 50)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factor Correlation */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          Risk Factor Impact Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#000" strokeWidth={2} />
            <PolarAngleAxis dataKey="factor" stroke="#000" strokeWidth={2} />
            <PolarRadiusAxis stroke="#000" strokeWidth={2} />
            <Radar name="Impact" dataKey="value" stroke="hsl(347, 100%, 50%)" fill="hsl(347, 100%, 50%)" fillOpacity={0.6} strokeWidth={3} />
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Higher values indicate stronger correlation with dropout risk
        </p>
      </div>
    </div>
  );
};

export default Analytics;
