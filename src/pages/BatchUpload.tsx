import { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BatchUpload = () => {
  const { batchUploadStudents, riskDistribution } = useData();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      const event = { target: { files: [file] } } as any;
      handleUpload(event);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("processing");
    setProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < headers.length) continue;
        
        const student: any = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        
        // Calculate risk score
        const attendance = parseFloat(student.attendance_rate) || 0;
        const cgpa = parseFloat(student.cgpa) || 0;
        const assignments = parseInt(student.assignments_submitted) || 0;
        const studyHours = parseFloat(student.study_hours_per_week) || 0;
        const failures = parseInt(student.past_failures) || 0;
        const activities = parseInt(student.total_activities) || 0;

        const riskScore = (
          ((100 - attendance) / 100) * 0.25 +
          ((4.0 - cgpa) / 4.0) * 0.25 +
          (Math.max(0, (30 - assignments) / 30)) * 0.15 +
          (Math.max(0, (40 - studyHours) / 40)) * 0.15 +
          (Math.min(failures / 3, 1)) * 0.10 +
          (Math.max(0, (10 - activities) / 10)) * 0.10
        ) * 100;

        const riskCategory = 
          riskScore >= 75 ? "CRITICAL" :
          riskScore >= 50 ? "HIGH" :
          riskScore >= 25 ? "MEDIUM" : "LOW";

        students.push({
          student_id: student.student_id,
          gender: student.gender,
          department: student.department,
          scholarship: student.scholarship === 'true' || student.scholarship === '1',
          parental_education: student.parental_education,
          extra_curricular: student.extra_curricular === 'true' || student.extra_curricular === '1',
          age: parseInt(student.age),
          cgpa: parseFloat(student.cgpa),
          attendance_rate: parseFloat(student.attendance_rate),
          family_income: parseFloat(student.family_income),
          past_failures: parseInt(student.past_failures),
          study_hours_per_week: parseFloat(student.study_hours_per_week),
          assignments_submitted: parseInt(student.assignments_submitted),
          projects_completed: parseInt(student.projects_completed),
          total_activities: parseInt(student.total_activities),
          sports_participation: student.sports_participation === 'true' || student.sports_participation === '1',
          dropout: student.dropout === 'true' || student.dropout === '1',
          risk_score: riskScore,
          risk_category: riskCategory,
        });

        setProgress(Math.round((i / lines.length) * 100));
      }

      const { error } = await supabase.from('students').insert(students);
      
      if (error) throw error;

      setProgress(100);
      setUploadedCount(students.length);
      batchUploadStudents(students.length);
      setUploadStatus("success");
      
      toast({
        title: "Upload Successful!",
        description: `${students.length} students have been added to the system.`,
      });
    } catch (error: any) {
      setUploadStatus("idle");
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-brutal bg-primary">
        <h1 className="text-3xl font-bold uppercase mb-2">Batch Upload & Processing</h1>
        <p className="text-sm">Upload CSV files for bulk student risk prediction</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`card-brutal bg-white min-h-[400px] flex items-center justify-center ${
          isDragging ? "border-primary bg-primary/10" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploadStatus === "idle" && (
          <div className="text-center">
            <Upload className="h-24 w-24 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2 uppercase">Drop CSV File Here</h3>
            <p className="text-muted-foreground mb-6">
              Or click to browse files
            </p>
            <label htmlFor="csv-upload">
              <Button onClick={() => document.getElementById('csv-upload')?.click()} className="btn-brutal bg-secondary">
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUpload}
            />
            <div className="mt-8 text-left max-w-md mx-auto">
              <h4 className="font-bold mb-3 uppercase text-sm">Required CSV Format:</h4>
              <div className="border-4 border-black p-4 bg-muted font-mono text-xs">
                student_id,gender,department,scholarship,<br />
                parental_education,extra_curricular,age,<br />
                cgpa,attendance_rate,family_income,<br />
                past_failures,study_hours_per_week,<br />
                assignments_submitted,projects_completed,<br />
                total_activities,sports_participation,dropout
              </div>
            </div>
          </div>
        )}

        {uploadStatus === "processing" && (
          <div className="text-center w-full max-w-md">
            <FileText className="h-24 w-24 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold mb-4 uppercase">Processing...</h3>
            <div className="h-8 border-4 border-black bg-white overflow-hidden mb-4">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-black/10 animate-[pulse_1s_ease-in-out_infinite]" 
                     style={{
                       backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)"
                     }}
                />
              </div>
            </div>
            <p className="font-bold text-xl">{progress}%</p>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="text-center">
            <CheckCircle2 className="h-24 w-24 mx-auto mb-6 text-risk-low" />
            <h3 className="text-2xl font-bold mb-2 uppercase">Upload Successful!</h3>
            <p className="text-muted-foreground mb-6">
              Processed {uploadedCount} student records
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="border-4 border-black p-4 bg-risk-low">
                <p className="text-3xl font-bold">{riskDistribution.LOW}</p>
                <p className="text-xs uppercase">Low Risk</p>
              </div>
              <div className="border-4 border-black p-4 bg-risk-medium">
                <p className="text-3xl font-bold">{riskDistribution.MEDIUM}</p>
                <p className="text-xs uppercase">Medium Risk</p>
              </div>
              <div className="border-4 border-black p-4 bg-risk-high text-white">
                <p className="text-3xl font-bold">{riskDistribution.HIGH}</p>
                <p className="text-xs uppercase">High Risk</p>
              </div>
              <div className="border-4 border-black p-4 bg-risk-critical text-white">
                <p className="text-3xl font-bold">{riskDistribution.CRITICAL}</p>
                <p className="text-xs uppercase">Critical</p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button className="btn-brutal bg-primary">
                View Results
              </Button>
              <Button onClick={() => setUploadStatus("idle")} className="btn-brutal bg-secondary">
                Upload Another
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      <div className="card-brutal bg-white">
        <h3 className="text-xl font-bold uppercase mb-4">Recent Uploads</h3>
        <div className="space-y-3">
          {[
            { date: "2025-10-26", file: "students_jan_2025.csv", count: 247, status: "completed" },
            { date: "2025-10-20", file: "students_dec_2024.csv", count: 231, status: "completed" },
            { date: "2025-10-15", file: "students_nov_2024.csv", count: 256, status: "completed" },
          ].map((upload, idx) => (
            <div key={idx} className="border-4 border-black p-4 bg-muted flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8" />
                <div>
                  <h4 className="font-bold">{upload.file}</h4>
                  <p className="text-sm text-muted-foreground">
                    {upload.date} • {upload.count} records
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-risk-low border-2 border-black text-xs font-bold uppercase">
                  {upload.status}
                </div>
                <Button size="sm" variant="outline" className="border-2 border-black">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="card-brutal bg-secondary">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-8 w-8 flex-shrink-0" />
          <div>
            <h4 className="font-bold mb-2 uppercase">CSV Format Requirements</h4>
            <ul className="text-sm space-y-1">
              <li>• File must be in .csv format</li>
              <li>• Maximum file size: 10MB</li>
              <li>• All required columns must be present</li>
              <li>• Numeric values should not contain special characters</li>
              <li>• CGPA should be between 0-10</li>
              <li>• Attendance should be 0-100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;
