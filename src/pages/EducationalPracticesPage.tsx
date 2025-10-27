import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Monitor, Wifi, Heart } from "lucide-react";

const EducationalPracticesPage = () => {
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
            <div className="w-24 h-24 bg-brutal-purple border-4 border-black flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-foreground">New Educational Practices</h1>
            <p className="text-xl text-muted-foreground">
              Revolutionary teaching methodologies that make learning immersive, inclusive, and accessible
            </p>
          </div>

          <div className="grid gap-8 mb-12">
            {/* Practice 1 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brutal-blue border-4 border-black flex items-center justify-center">
                    <Monitor className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Practice 1: Immersive AR/VR Classrooms</CardTitle>
                    <CardDescription className="text-lg">Transform abstract concepts into tangible experiences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  Bring concepts to life through generative 3D models and create virtual learning experiences that students can explore, manipulate, and truly understand. No longer are students passive observers—they become active participants in their own education.
                </p>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Interactive 3D Visualizations</h4>
                  <p className="text-muted-foreground text-lg">
                    From exploring the human circulatory system to walking through ancient civilizations, students can interact with content in ways traditional textbooks never allowed. Complex scientific processes, mathematical concepts, and historical events become explorable 3D environments.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Virtual Field Trips</h4>
                  <p className="text-muted-foreground text-lg">
                    Take students to places they could never visit physically—from the surface of Mars to the depths of the ocean, from microscopic cellular structures to the vastness of space. All without leaving the classroom.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Hands-On Learning Without Limits</h4>
                  <p className="text-muted-foreground text-lg">
                    Conduct chemistry experiments without dangerous materials, build architectural structures without physical constraints, or practice medical procedures without risk. AR/VR creates safe, unlimited environments for experiential learning.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Practice 2 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brutal-purple border-4 border-black flex items-center justify-center">
                    <Wifi className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Practice 2: The Offline-First Classroom</CardTitle>
                    <CardDescription className="text-lg">Education that works everywhere, for everyone</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Edge AI Functionality</h4>
                  <p className="text-muted-foreground text-lg">
                    Our platform works efficiently offline on low-cost hardware, ensuring that rural students and schools with limited resources aren't left behind. The Edge AI processes content locally, eliminating the need for constant internet connectivity while maintaining full functionality.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Bridging the Digital Divide</h4>
                  <p className="text-muted-foreground text-lg">
                    No more "digital divide" where only well-funded urban schools can access cutting-edge educational technology. Dropout Detector runs on affordable hardware and works seamlessly in low-bandwidth or no-bandwidth environments, making world-class education truly accessible.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Local Content Generation</h4>
                  <p className="text-muted-foreground text-lg">
                    Generate 3D models, simulations, and adaptive content directly on local devices. When connectivity is available, sync progress and access cloud resources. When it's not, learning continues uninterrupted.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Practice 3 */}
            <Card className="border-4 border-black shadow-brutal">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-secondary border-4 border-black flex items-center justify-center">
                    <Heart className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Practice 3: Inclusive & Hygienic Learning</CardTitle>
                    <CardDescription className="text-lg">Safe, accessible education for every student</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Multilingual & Inclusive Design</h4>
                  <p className="text-muted-foreground text-lg">
                    Support for multiple languages ensures students can learn in their native tongue. Purpose-built interfaces for differently-abled users mean that visual, auditory, or motor impairments don't create barriers. Voice control, gesture navigation, and adaptive displays ensure everyone can participate fully.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Accessibility First, Not Last</h4>
                  <p className="text-muted-foreground text-lg">
                    Every feature is designed with accessibility in mind from the start. Students with mobility challenges can use voice and gesture controls. Visually impaired students benefit from audio descriptions and haptic feedback. Neurodivergent learners can customize the interface to their specific needs.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Safe & Hygienic Operation</h4>
                  <p className="text-muted-foreground text-lg">
                    Touchless interaction isn't just inclusive—it's hygienic. In shared learning spaces, eliminating the need to touch screens and keyboards reduces the spread of illness. This is crucial in environments where multiple students use the same equipment throughout the day, creating a healthier learning environment for everyone.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Universal Design for Learning (UDL)</h4>
                  <p className="text-muted-foreground text-lg">
                    Following UDL principles, Dropout Detector provides multiple means of representation, action, expression, and engagement. Every student can access content in the way that works best for them, ensuring no one is disadvantaged by rigid, one-size-fits-all approaches.
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

export default EducationalPracticesPage;
