import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AIPredictionCardProps {
  studentId: string;
  studentData?: any;
}

interface PredictionResult {
  risk_score: number;
  dropout_probability: number;
  risk_category: string;
  confidence: number;
  feature_impacts: Array<{
    feature: string;
    impact: number;
    value: string | number;
    status: 'warning' | 'good' | 'neutral';
  }>;
  interventions: Array<{
    type: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    timeline: string;
    description: string;
  }>;
  model_info: {
    name: string;
    training_data: string;
    performance: { auc: number; accuracy: number };
  };
}

const AIPredictionCard = ({ studentId, studentData }: AIPredictionCardProps) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'CRITICAL': return 'bg-risk-critical';
      case 'HIGH': return 'bg-risk-high';
      case 'MEDIUM': return 'bg-risk-medium';
      case 'LOW': return 'bg-risk-low';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-risk-high';
      case 'MEDIUM': return 'bg-risk-medium';
      case 'LOW': return 'bg-risk-low';
      default: return 'bg-muted';
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-dropout', {
        body: { student_id: studentId, student_data: studentData }
      });

      if (error) throw error;

      setPrediction(data);
      toast({
        title: "AI Analysis Complete",
        description: `Risk Category: ${data.risk_category}`,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: "Unable to generate AI prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!prediction) {
    return (
      <Card className="card-brutal bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-none border-4 border-black">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase">AI Dropout Prediction</h3>
              <p className="text-sm text-muted-foreground">98.99% Accuracy Pattern Recognition</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={runPrediction} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Analyzing..." : "Run AI Analysis"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Score Card */}
      <Card className={`card-brutal ${getRiskColor(prediction.risk_category)} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold uppercase">AI Risk Assessment</h3>
            <p className="text-sm opacity-90">
              Confidence: {(prediction.confidence * 100).toFixed(1)}% | Model: {(prediction.model_info.performance.accuracy * 100).toFixed(1)}% Accurate
            </p>
          </div>
          <AlertTriangle className="h-12 w-12" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border-4 border-black bg-white p-4">
            <p className="text-sm font-bold uppercase mb-1">Risk Score</p>
            <p className="text-4xl font-bold">{prediction.risk_score}/100</p>
          </div>
          <div className="border-4 border-black bg-white p-4">
            <p className="text-sm font-bold uppercase mb-1">Category</p>
            <p className="text-4xl font-bold">{prediction.risk_category}</p>
          </div>
        </div>

        <div className="border-4 border-black bg-white p-4">
          <p className="text-sm font-bold uppercase mb-2">Dropout Probability</p>
          <Progress value={prediction.dropout_probability * 100} className="h-4" />
          <p className="text-right text-sm font-bold mt-1">
            {(prediction.dropout_probability * 100).toFixed(1)}%
          </p>
        </div>

        <Button 
          onClick={runPrediction} 
          disabled={loading}
          variant="outline"
          className="w-full mt-4"
        >
          Refresh Analysis
        </Button>
      </Card>

      {/* Feature Impacts */}
      <Card className="card-brutal bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6" />
          <h3 className="text-xl font-bold uppercase">Feature Impact Analysis</h3>
        </div>
        
        <div className="space-y-3">
          {prediction.feature_impacts.map((impact, idx) => (
            <div key={idx} className="border-3 border-black p-3 bg-muted">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {impact.status === 'warning' && <AlertTriangle className="h-4 w-4 text-risk-high" />}
                  {impact.status === 'good' && <CheckCircle className="h-4 w-4 text-risk-low" />}
                  <span className="font-bold text-sm uppercase">{impact.feature}</span>
                </div>
                <span className="text-sm font-bold">{impact.impact.toFixed(1)}% Impact</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Value: <strong>{impact.value}</strong></span>
                <Progress value={impact.impact} className="w-32 h-2" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interventions */}
      {prediction.interventions.length > 0 && (
        <Card className="card-brutal bg-secondary p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6" />
            <h3 className="text-xl font-bold uppercase">Recommended Interventions</h3>
          </div>
          
          <div className="space-y-4">
            {prediction.interventions.map((intervention, idx) => (
              <div key={idx} className="border-4 border-black bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${getPriorityColor(intervention.priority)}`}>
                        {intervention.priority}
                      </span>
                      <span className="font-bold text-sm uppercase">{intervention.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      {intervention.timeline}
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-2">{intervention.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Model Info */}
      <Card className="card-brutal bg-primary p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold">Model: {prediction.model_info.name}</span>
          <span>Training Data: {prediction.model_info.training_data}</span>
          <span>AUC: {prediction.model_info.performance.auc}</span>
        </div>
      </Card>
    </div>
  );
};

export default AIPredictionCard;
