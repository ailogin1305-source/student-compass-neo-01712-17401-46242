import { TrendingDown, TrendingUp, Calendar, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TimelineEvent {
  date: string;
  type: "prediction" | "intervention" | "milestone";
  title: string;
  description: string;
  risk: "low" | "medium" | "high" | "critical";
}

interface PredictiveTimelineProps {
  studentId: string;
  currentRisk: number;
}

const PredictiveTimeline = ({ studentId, currentRisk }: PredictiveTimelineProps) => {
  const events: TimelineEvent[] = [
    {
      date: "Current",
      type: "prediction",
      title: "Current Status",
      description: `Risk Score: ${currentRisk}%`,
      risk: currentRisk >= 75 ? "critical" : currentRisk >= 50 ? "high" : currentRisk >= 25 ? "medium" : "low"
    },
    {
      date: "2 Weeks",
      type: "intervention",
      title: "Recommended: Peer Tutoring",
      description: "If no action taken, risk may increase to 85%",
      risk: "high"
    },
    {
      date: "1 Month",
      type: "milestone",
      title: "Mid-Semester Review",
      description: "Expected improvement with interventions: 45% risk",
      risk: "medium"
    },
    {
      date: "3 Months",
      type: "prediction",
      title: "End of Semester Projection",
      description: "With sustained support: 20% risk",
      risk: "low"
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-risk-critical text-white";
      case "high": return "bg-risk-high text-white";
      case "medium": return "bg-risk-medium";
      case "low": return "bg-risk-low";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="card-brutal p-6 bg-white">
      <h3 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        Predictive Timeline
      </h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-black"></div>

        <div className="space-y-8">
          {events.map((event, index) => (
            <div key={index} className="relative pl-20">
              {/* Timeline dot */}
              <div className={`absolute left-4 w-8 h-8 border-4 border-black ${getRiskColor(event.risk)} flex items-center justify-center`}>
                {event.type === "prediction" && <TrendingDown className="h-4 w-4" />}
                {event.type === "intervention" && <AlertTriangle className="h-4 w-4" />}
                {event.type === "milestone" && <TrendingUp className="h-4 w-4" />}
              </div>

              <div className={`border-4 border-black p-4 ${getRiskColor(event.risk)}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold uppercase">{event.title}</h4>
                  <span className="text-xs font-bold uppercase bg-black text-white px-2 py-1">
                    {event.date}
                  </span>
                </div>
                <p className="text-sm">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PredictiveTimeline;