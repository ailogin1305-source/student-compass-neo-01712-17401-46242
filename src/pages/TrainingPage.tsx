import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, Hand, Sparkles, Target } from "lucide-react";

const TrainingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary border-b-4 border-black z-50">
        <div className="container mx-auto h-full px-6 flex items-center">
          <Button variant="ghost" className="gap-2 font-bold" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-brutal-blue border-4 border-black flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-foreground">Teacher Training Programs</h1>
            <p className="text-xl text-muted-foreground">
              Transform your teaching with cutting-edge touchless technology and AI-powered tools
            </p>
          </div>

          <div className="grid gap-8 mb-12">
            {/* Module 1 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brutal-purple border-4 border-black flex items-center justify-center">
                    <Hand className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Module 1: Mastering Touchless Interaction</CardTitle>
                    <CardDescription className="text-lg">Learn to navigate and control without touching a screen</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Gesture-Based Control</h4>
                  <p className="text-muted-foreground text-lg">
                    Master intuitive hand gestures to navigate content, control presentations, and interact with 3D models. Learn how to create a hygienic, touch-free learning environment that's accessible to all students.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Voice-Driven Navigation</h4>
                  <p className="text-muted-foreground text-lg">
                    Harness the power of voice commands to manage classroom activities, switch between lessons, and provide real-time feedback. Perfect for differently-abled teachers and students who benefit from hands-free interaction.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Module 2 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brutal-blue border-4 border-black flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Module 2: The Generative Learning Engine</CardTitle>
                    <CardDescription className="text-lg">Turn your ideas into interactive 3D learning experiences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  Discover how to convert your text or speech into dynamic 3D visuals, simulations, and adaptive lessons. This revolutionary AI-powered engine transforms abstract concepts into tangible, explorable objects that students can manipulate and understand deeply.
                </p>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Real-Time Content Generation</h4>
                  <p className="text-muted-foreground text-lg">
                    Simply describe what you want to teach—from molecular structures to historical events—and watch as the system generates interactive 3D models instantly. No design skills required.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Adaptive Visual Learning</h4>
                  <p className="text-muted-foreground text-lg">
                    The engine automatically adjusts the complexity and style of visualizations based on student age, comprehension level, and learning preferences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Module 3 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary border-4 border-black flex items-center justify-center">
                    <Target className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Module 3: Adaptive Learning & Assessment</CardTitle>
                    <CardDescription className="text-lg">Personalize education for every student</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Adaptive Learning Profiles</h4>
                  <p className="text-muted-foreground text-lg">
                    Create and manage personalized learning paths that adapt to each student's pace, interests, and abilities. Track progress in real-time and identify students who need additional support before they fall behind.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">AI Feedback & Assessment</h4>
                  <p className="text-muted-foreground text-lg">
                    Generate personalized quizzes, track student engagement through interaction patterns, and receive AI-powered insights about class performance. The system provides actionable recommendations to improve learning outcomes for individual students and the entire class.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Data-Driven Insights</h4>
                  <p className="text-muted-foreground text-lg">
                    Access comprehensive analytics that show which concepts students grasp quickly and which require additional reinforcement. Make informed decisions about pacing and content based on real classroom data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-primary border-4 border-black hover:bg-primary/90 font-bold" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
