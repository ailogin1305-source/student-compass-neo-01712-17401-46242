import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Send, Loader2 } from "lucide-react";

const PDFAnalysis = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pdfReportPath: "",
    alertEmailAddress: "",
    reportDate: new Date().toISOString().split('T')[0],
    crewId: "",
    apiToken: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pdfReportPath || !formData.alertEmailAddress || !formData.crewId || !formData.apiToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const webhookUrl = `https://api.crewai.com/v1/crews/${formData.crewId}/kickoff`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formData.apiToken}`
        },
        body: JSON.stringify({
          inputs: {
            pdf_report_path: formData.pdfReportPath,
            alert_email_address: formData.alertEmailAddress,
            report_date: formData.reportDate
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success!",
          description: "PDF analysis workflow has been triggered successfully.",
        });
        console.log("Webhook response:", result);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the PDF analysis workflow. Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">PDF Analysis Automation</h1>
          <p className="text-muted-foreground text-lg">
            Trigger automated analysis of student data reports with email notifications
          </p>
        </div>

        <Card className="border-4 border-black shadow-brutal-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6" />
              Configure Analysis Workflow
            </CardTitle>
            <CardDescription className="text-base">
              Enter your PDF report details and webhook credentials to process student data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={triggerWebhook} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pdfReportPath" className="font-bold">
                  PDF Report Path *
                </Label>
                <Input
                  id="pdfReportPath"
                  name="pdfReportPath"
                  type="text"
                  placeholder="/path/to/student-report.pdf"
                  value={formData.pdfReportPath}
                  onChange={handleInputChange}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertEmailAddress" className="font-bold">
                  Alert Email Address *
                </Label>
                <Input
                  id="alertEmailAddress"
                  name="alertEmailAddress"
                  type="email"
                  placeholder="admin@school.com"
                  value={formData.alertEmailAddress}
                  onChange={handleInputChange}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDate" className="font-bold">
                  Report Date *
                </Label>
                <Input
                  id="reportDate"
                  name="reportDate"
                  type="date"
                  value={formData.reportDate}
                  onChange={handleInputChange}
                  className="border-2 border-black"
                  required
                />
              </div>

              <div className="border-t-2 border-black pt-6 mt-6">
                <h3 className="font-bold text-lg mb-4">CrewAI Webhook Credentials</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crewId" className="font-bold">
                      Crew ID *
                    </Label>
                    <Input
                      id="crewId"
                      name="crewId"
                      type="text"
                      placeholder="Your crew_id from CrewAI"
                      value={formData.crewId}
                      onChange={handleInputChange}
                      className="border-2 border-black"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiToken" className="font-bold">
                      API Token *
                    </Label>
                    <Input
                      id="apiToken"
                      name="apiToken"
                      type="password"
                      placeholder="Your API token"
                      value={formData.apiToken}
                      onChange={handleInputChange}
                      className="border-2 border-black"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-secondary text-foreground border-4 border-black hover:bg-secondary/90 font-bold text-lg py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Trigger Analysis Workflow
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted border-2 border-black">
              <h4 className="font-bold mb-2">How it works:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Upload your student data PDF report</li>
                <li>The Student Data Analyst agent processes the PDF</li>
                <li>Automated alerts are sent to the specified email</li>
                <li>Reports are generated and delivered automatically</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFAnalysis;
