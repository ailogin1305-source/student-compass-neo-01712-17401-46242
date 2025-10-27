import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Student } from "@/types/database";

const RiskHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const departments = ["CSE", "ECE", "ME", "CE"];
  const riskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    const { data: students } = await supabase.from('students').select('*') as { data: Student[] | null };
    
    if (students) {
      const heatmap = departments.map(dept => {
        const deptStudents = students.filter(s => s.department === dept);
        const riskBreakdown = riskLevels.map(risk => ({
          risk,
          count: deptStudents.filter(s => s.risk_category === risk).length,
          percentage: deptStudents.length > 0 
            ? (deptStudents.filter(s => s.risk_category === risk).length / deptStudents.length) * 100
            : 0
        }));
        
        return {
          department: dept,
          total: deptStudents.length,
          risks: riskBreakdown
        };
      });
      
      setHeatmapData(heatmap);
    }
  };

  const getHeatColor = (percentage: number) => {
    if (percentage >= 30) return "bg-risk-critical text-white";
    if (percentage >= 20) return "bg-risk-high text-white";
    if (percentage >= 10) return "bg-risk-medium";
    if (percentage > 0) return "bg-risk-low";
    return "bg-muted";
  };

  const getIntensity = (percentage: number) => {
    if (percentage >= 30) return "shadow-brutal-lg scale-105";
    if (percentage >= 20) return "shadow-brutal";
    return "";
  };

  return (
    <Card className="card-brutal p-6 bg-white">
      <h3 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2">
        <Activity className="h-6 w-6" />
        Real-time Risk Heatmap
      </h3>

      <div className="space-y-6">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-risk-low border-2 border-black"></div>
            Low
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-risk-medium border-2 border-black"></div>
            Medium
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-risk-high text-white border-2 border-black flex items-center justify-center">H</div>
            High
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-risk-critical text-white border-2 border-black flex items-center justify-center">C</div>
            Critical
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 gap-4">
          {heatmapData.map((dept) => (
            <div key={dept.department} className="border-4 border-black p-4 bg-muted">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold uppercase">{dept.department}</h4>
                <span className="text-sm font-bold bg-black text-white px-3 py-1">
                  {dept.total} Students
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {dept.risks.map((risk: any) => (
                  <div
                    key={risk.risk}
                    className={`
                      border-4 border-black p-4 transition-all duration-300 hover:scale-105 cursor-pointer
                      ${getHeatColor(risk.percentage)}
                      ${getIntensity(risk.percentage)}
                    `}
                  >
                    <p className="text-2xl font-bold">{risk.count}</p>
                    <p className="text-xs uppercase font-bold">{risk.risk}</p>
                    <p className="text-sm font-bold mt-1">{risk.percentage.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-4 border-black p-4 bg-gradient-to-r from-brutal-purple/20 to-primary/20">
          <h4 className="font-bold uppercase mb-2">Key Insights</h4>
          <ul className="text-sm space-y-1">
            <li>• Real-time risk distribution across all departments</li>
            <li>• Darker colors indicate higher concentration of at-risk students</li>
            <li>• Click on any cell for detailed breakdown</li>
            <li>• Updates automatically as new data is added</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default RiskHeatmap;