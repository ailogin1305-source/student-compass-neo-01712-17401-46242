import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, GraduationCap, BookOpen, ArrowRight, Brain, Hand, Wifi, Globe, Sparkles, Monitor, Users, Accessibility } from "lucide-react";
import { useState } from "react";
import RescheduleModal from "@/components/RescheduleModal";

const IntroHomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary border-b-4 border-black z-50">
        <div className="container mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">SPARSH MUKTHI</h1>
          </div>
          <Button className="bg-secondary text-foreground border-4 border-black hover:bg-secondary/90 font-bold" asChild>
            <Link to="/login">
              Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-primary/20 to-background">
        <div className="container mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 text-foreground">
            Learning Beyond Touch
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            We integrate Generative AI with touchless controls to make learning immersive, inclusive, and accessible for all
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-foreground border-4 border-black hover:bg-primary/90 font-bold text-lg px-12 py-8 shadow-brutal-lg"
            asChild
          >
            <Link to="/login">
              Get Started
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </Button>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 bg-white border-y-4 border-black">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-5xl font-bold mb-6 text-center text-foreground">Education's Accessibility Gap</h2>
          <div className="text-xl text-muted-foreground space-y-4 text-center max-w-3xl mx-auto">
            <p>
              Despite digitalization, education remains touch-dependent. Traditional tools create barriers for rural and differently-abled students who struggle with conventional interfaces.
            </p>
            <p>
              Current educational technology lacks personalization, hygiene standards, and true immersion—leaving countless learners behind in our increasingly digital world.
            </p>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-4 text-center text-foreground">Meet Sparsh Mukthi: The Future of Interaction</h2>
          <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
            A revolutionary platform that combines AI-powered content generation with natural, touchless interaction
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-4 border-black shadow-brutal-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-brutal-blue border-4 border-black flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Generative Learning Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Converts teacher's text or speech into real-time 3D models and interactive simulations, making abstract concepts tangible and engaging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-black shadow-brutal-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-brutal-purple border-4 border-black flex items-center justify-center mb-4">
                  <Hand className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Gesture & Voice Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Replaces the mouse and touchscreen with natural, motion-based controls for a hygienic, inclusive environment that anyone can use.
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-black shadow-brutal-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary border-4 border-black flex items-center justify-center mb-4">
                  <Wifi className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Edge AI for Rural Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Works offline on low-cost hardware, ensuring access for all students, even with poor connectivity or limited resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Explore Our Programs Section */}
      <section className="py-20 px-6 bg-primary/10">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-12 text-center text-foreground">Explore Our Programs</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-4 border-black shadow-brutal-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-brutal-blue border-4 border-black flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">Teacher Training Programs</CardTitle>
                <CardDescription className="text-lg">
                  Master touchless interaction, AI-powered content generation, and adaptive learning strategies to transform your classroom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-4 border-black hover:bg-brutal-blue hover:text-white font-bold"
                    asChild
                  >
                    <Link to="/training">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-primary border-4 border-black hover:bg-primary/90 font-bold"
                  >
                    Reschedule a Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-black shadow-brutal-lg bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-brutal-purple border-4 border-black flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold">New Educational Practices</CardTitle>
                <CardDescription className="text-lg">
                  Discover immersive AR/VR classrooms, offline-first learning, and inclusive design principles that work for every student.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-4 border-black hover:bg-brutal-purple hover:text-white font-bold"
                    asChild
                  >
                    <Link to="/practices">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-primary border-4 border-black hover:bg-primary/90 font-bold"
                  >
                    Reschedule a Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Inclusive by Design Section */}
      <section className="py-20 px-6 bg-white border-y-4 border-black">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-5xl font-bold mb-6 text-center text-foreground">Education for Everyone</h2>
          <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
            Our accessibility-first approach ensures no student is left behind
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-4 border-black shadow-brutal bg-white">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brutal-purple border-4 border-black flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Multilingual & Inclusive Design</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Support for multiple languages and interfaces designed specifically for differently-abled users, ensuring everyone can participate fully.
                </p>
              </CardContent>
            </Card>

            <Card className="border-4 border-black shadow-brutal bg-white">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brutal-blue border-4 border-black flex items-center justify-center">
                    <Accessibility className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Adaptive Learning Profiles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  Personalized learning paths tailored to each learner's needs, pace, and preferred interaction style for maximum engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-5xl font-bold mb-12 text-center text-foreground">Powered by Cutting-Edge Technology</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-8 border-4 border-black bg-white shadow-brutal">
              <div className="w-16 h-16 bg-primary border-4 border-black flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Generative AI</h3>
              <p className="text-muted-foreground">
                Real-time content generation and intelligent adaptation
              </p>
            </div>

            <div className="text-center p-8 border-4 border-black bg-white shadow-brutal">
              <div className="w-16 h-16 bg-secondary border-4 border-black flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Immersive AR/VR</h3>
              <p className="text-muted-foreground">
                3D visualizations and virtual learning environments
              </p>
            </div>

            <div className="text-center p-8 border-4 border-black bg-white shadow-brutal">
              <div className="w-16 h-16 bg-accent border-4 border-black flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Modular Setup</h3>
              <p className="text-muted-foreground">
                Flexible, low-cost hardware that scales with your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-primary py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-foreground font-bold">© 2025 Sparsh Mukthi. Empowering Education Through Innovation.</p>
        </div>
      </footer>

      <RescheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default IntroHomePage;
