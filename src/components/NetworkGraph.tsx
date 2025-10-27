import { Card } from "@/components/ui/card";
import { Users, TrendingDown, TrendingUp } from "lucide-react";

interface NetworkGraphProps {
  studentId: string;
  department: string;
}

const NetworkGraph = ({ studentId, department }: NetworkGraphProps) => {
  const similarStudents = [
    { id: "205632", name: "Similar Student A", risk: 65, connection: "Same department" },
    { id: "205633", name: "Similar Student B", risk: 45, connection: "Similar GPA" },
    { id: "205634", name: "Similar Student C", risk: 82, connection: "Same study pattern" },
    { id: "205635", name: "Similar Student D", risk: 38, connection: "Similar attendance" },
  ];

  return (
    <Card className="card-brutal p-6 bg-white">
      <h3 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2">
        <Users className="h-6 w-6" />
        Peer Comparison Network
      </h3>

      <div className="relative h-[400px] flex items-center justify-center">
        {/* Center node (current student) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-primary border-4 border-black rounded-full flex items-center justify-center shadow-brutal-lg z-10">
            <span className="text-2xl font-bold">YOU</span>
          </div>
        </div>

        {/* Connected nodes */}
        {similarStudents.map((student, index) => {
          const angle = (index * 360) / similarStudents.length;
          const radius = 140;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          const riskColor = 
            student.risk >= 75 ? "bg-risk-critical text-white" :
            student.risk >= 50 ? "bg-risk-high text-white" :
            student.risk >= 25 ? "bg-risk-medium" : "bg-risk-low";

          return (
            <div key={student.id}>
              {/* Connection line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="50%"
                  y1="50%"
                  x2={`calc(50% + ${x}px)`}
                  y2={`calc(50% + ${y}px)`}
                  stroke="black"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Node */}
              <div
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px - 40px)`,
                  top: `calc(50% + ${y}px - 40px)`,
                }}
              >
                <div className={`w-20 h-20 ${riskColor} border-4 border-black flex flex-col items-center justify-center shadow-brutal cursor-pointer hover:scale-110 transition-transform`}>
                  <span className="text-xs font-bold">{student.id}</span>
                  <span className="text-lg font-bold">{student.risk}%</span>
                  {student.risk > 50 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                </div>
                <div className="mt-2 text-xs text-center font-bold bg-white border-2 border-black p-1">
                  {student.connection}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default NetworkGraph;