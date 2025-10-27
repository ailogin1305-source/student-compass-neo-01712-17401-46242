import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainAppLayout from "@/components/MainAppLayout";
import IntroHomePage from "./pages/IntroHomePage";
import LoginPage from "./pages/LoginPage";
import TrainingPage from "./pages/TrainingPage";
import EducationalPracticesPage from "./pages/EducationalPracticesPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<IntroHomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/training" element={<TrainingPage />} />
                <Route path="/practices" element={<EducationalPracticesPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/app/*" 
                  element={
                    <ProtectedRoute>
                      <MainAppLayout />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
