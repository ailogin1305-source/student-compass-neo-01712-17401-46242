import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const RiskGauge = ({ score, size = "md", showLabel = true }: RiskGaugeProps) => {
  const getColor = (score: number) => {
    if (score < 30) return "bg-risk-low";
    if (score < 60) return "bg-risk-medium";
    if (score < 80) return "bg-risk-high";
    return "bg-risk-critical";
  };

  const getCategory = (score: number) => {
    if (score < 30) return "LOW";
    if (score < 60) return "MEDIUM";
    if (score < 80) return "HIGH";
    return "CRITICAL";
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-4xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "border-4 border-black flex items-center justify-center font-bold relative overflow-hidden",
          getColor(score),
          sizeClasses[size]
        )}
      >
        <span className="relative z-10">{score}</span>
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/20"
          style={{ height: `${score}%` }}
        />
      </div>
      {showLabel && (
        <div
          className={cn(
            "px-3 py-1 border-2 border-black font-bold text-xs uppercase",
            getColor(score)
          )}
        >
          {getCategory(score)}
        </div>
      )}
    </div>
  );
};

export default RiskGauge;
