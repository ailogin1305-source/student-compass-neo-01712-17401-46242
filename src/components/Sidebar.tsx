import { LayoutDashboard, Users, BarChart3, Calendar, Upload, X, LineChart, Brain, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/app/students", icon: Users, label: "Students" },
  { path: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/app/interventions", icon: Calendar, label: "Interventions" },
  { path: "/app/upload", icon: Upload, label: "Batch Upload" },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 bg-white border-r-4 border-black z-40 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 right-4"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <nav className="space-y-2 mt-8 md:mt-0">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all",
                    isActive
                      ? "bg-primary text-foreground shadow-brutal"
                      : "bg-white hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
            
            {/* Data Analysis External Link */}
            <a
              href="https://colab.research.google.com/drive/1XmpwNGZCLSxLI1_6laEU9BpI-IwTSDty#scrollTo=pZsLJXsYPb-M"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all bg-white hover:bg-muted"
            >
              <LineChart className="h-5 w-5" />
              Data Analysis
            </a>
            
            {/* Prediction External Link */}
            <a
              href="http://192.168.65.28:5000"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all bg-white hover:bg-muted"
            >
              <Brain className="h-5 w-5" />
              Prediction
            </a>
            
            {/* PDF Analysis Link */}
            <NavLink
              to="/pdf-analysis"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 border-4 border-black font-bold uppercase text-sm transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "bg-white hover:bg-muted"
                )
              }
            >
              <FileText className="h-5 w-5" />
              PDF Analysis
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
