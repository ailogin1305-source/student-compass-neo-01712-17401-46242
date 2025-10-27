import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  const [showForm, setShowForm] = useState(true);
  const { toast } = useToast();

  // Form state for all parameters
  const [formData, setFormData] = useState({
    cgpa: studentData?.cgpa || 7.0,
    attendance_rate: studentData?.attendance_rate || 85,
    past_failures: studentData?.past_failures || 0,
    assignments_submitted: studentData?.assignments_submitted || 90,
    sports_participation: studentData?.sports_participation || false,
    extra_curricular: studentData?.extra_curricular || false,
    scholarship: studentData?.scholarship || false,
    total_activities: studentData?.total_activities || 3,
    study_hours_per_week: studentData?.study_hours_per_week || 20,
    projects_completed: studentData?.projects_completed || 5,
  });

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
      console.log('Running prediction with data:', formData);
      
      const { data, error } = await supabase.functions.invoke('predict-dropout', {
        body: { student_data: formData }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Prediction result:', data);
      setPrediction(data);
      setShowForm(false);
      
      toast({
        title: "AI Analysis Complete",
        description: `Risk Category: ${data.risk_category} | Risk Score: ${data.risk_score}/100`,
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Unable to generate AI prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForm && !prediction) {
    return (
      <Card className="card-brutal bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-none border-4 border-black">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase">AI Dropout Prediction</h3>
              <p className="text-sm text-muted-foreground">AutoGluon WeightedEnsemble_L2 | 98.99% AUC | 95.6% Accuracy</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cgpa" className="font-bold uppercase text-xs">CGPA (0-10)</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance" className="font-bold uppercase text-xs">Attendance Rate (%)</Label>
              <Input
                id="attendance"
                type="number"
                min="0"
                max="100"
                value={formData.attendance_rate}
                onChange={(e) => setFormData({ ...formData, attendance_rate: parseFloat(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="failures" className="font-bold uppercase text-xs">Past Failures</Label>
              <Input
                id="failures"
                type="number"
                min="0"
                value={formData.past_failures}
                onChange={(e) => setFormData({ ...formData, past_failures: parseInt(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignments" className="font-bold uppercase text-xs">Assignments Submitted (%)</Label>
              <Input
                id="assignments"
                type="number"
                min="0"
                max="100"
                value={formData.assignments_submitted}
                onChange={(e) => setFormData({ ...formData, assignments_submitted: parseInt(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="study_hours" className="font-bold uppercase text-xs">Study Hours/Week</Label>
              <Input
                id="study_hours"
                type="number"
                min="0"
                value={formData.study_hours_per_week}
                onChange={(e) => setFormData({ ...formData, study_hours_per_week: parseFloat(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities" className="font-bold uppercase text-xs">Total Activities</Label>
              <Input
                id="activities"
                type="number"
                min="0"
                value={formData.total_activities}
                onChange={(e) => setFormData({ ...formData, total_activities: parseInt(e.target.value) })}
                className="border-2 border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projects" className="font-bold uppercase text-xs">Projects Completed</Label>
              <Input
                id="projects"
                type="number"
                min="0"
                value={formData.projects_completed}
                onChange={(e) => setFormData({ ...formData, projects_completed: parseInt(e.target.value) })}
                className="border-2 border-black"
              />
            </div>
          </div>

          <div className="border-3 border-black p-4 bg-muted space-y-3">
            <p className="font-bold uppercase text-xs mb-3">Engagement Factors</p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sports" className="font-bold text-sm">Sports Participation</Label>
              <Switch
                id="sports"
                checked={formData.sports_participation}
                onCheckedChange={(checked) => setFormData({ ...formData, sports_participation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="extra" className="font-bold text-sm">Extra Curricular</Label>
              <Switch
                id="extra"
                checked={formData.extra_curricular}
                onCheckedChange={(checked) => setFormData({ ...formData, extra_curricular: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="scholarship" className="font-bold text-sm">Scholarship</Label>
              <Switch
                id="scholarship"
                checked={formData.scholarship}
                onCheckedChange={(checked) => setFormData({ ...formData, scholarship: checked })}
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={runPrediction} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Analyzing with AI Model..." : "Get Prediction"}
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

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={runPrediction} 
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Refresh Analysis
          </Button>
          <Button 
            onClick={() => {
              setShowForm(true);
              setPrediction(null);
            }}
            variant="outline"
            className="flex-1"
          >
            New Prediction
          </Button>
        </div>
      </Card>

      {/* Feature Impacts - XAI Explainability */}
      <Card className="card-brutal bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-6 w-6" />
          <h3 className="text-xl font-bold uppercase">XAI Feature Impact Analysis</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Explainable AI showing which features contribute most to the dropout risk prediction
        </p>

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

      {/* Model Info - Transparency */}
      <Card className="card-brutal bg-primary p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div>
            <span className="font-bold uppercase text-xs">Model</span>
            <p className="font-bold">{prediction.model_info.name}</p>
          </div>
          <div>
            <span className="font-bold uppercase text-xs">Training Data</span>
            <p className="font-bold">{prediction.model_info.training_data}</p>
          </div>
          <div>
            <span className="font-bold uppercase text-xs">Performance</span>
            <p className="font-bold">AUC: {prediction.model_info.performance.auc} | Acc: {(prediction.model_info.performance.accuracy * 100).toFixed(1)}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIPredictionCard;
