import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";
import Dashboard from "@/pages/Dashboard";
import StudentsList from "@/pages/StudentsList";
import StudentDetail from "@/pages/StudentDetail";
import Analytics from "@/pages/Analytics";
import InterventionPlanner from "@/pages/InterventionPlanner";
import BatchUpload from "@/pages/BatchUpload";
import NotFound from "@/pages/NotFound";

const MainAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background w-full">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="pt-16 md:pl-64 transition-all duration-300">
        <div className={`p-6 ${chatbotOpen ? "mr-0 md:mr-96" : ""} transition-all duration-300`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/interventions" element={<InterventionPlanner />} />
            <Route path="/upload" element={<BatchUpload />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />

      {/* Chatbot Toggle Button */}
      {!chatbotOpen && (
        <Button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full btn-brutal bg-brutal-purple text-white z-50 shadow-brutal-lg"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default MainAppLayout;
