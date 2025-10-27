import { Shield, Menu, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-primary border-b-4 border-black z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onToggleSidebar}
            className="bg-secondary text-foreground border-4 border-black hover:bg-secondary/90"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-foreground" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">DROPOUT PREDICTOR</h1>
              <p className="text-xs text-foreground/80 uppercase tracking-wider">AI-Powered Student Success Platform</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 mr-4">
          <Link to="/app" className="text-foreground hover:text-foreground/80 transition-colors font-bold uppercase text-sm">
            Dashboard
          </Link>
          <Link to="/app/students" className="text-foreground hover:text-foreground/80 transition-colors font-bold uppercase text-sm">
            Students
          </Link>
          <Link to="/admin" className="text-foreground hover:text-foreground/80 transition-colors font-bold uppercase text-sm flex items-center gap-1">
            <User className="h-4 w-4" />
            Admin
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground border-4 border-black hover:bg-destructive/90 font-bold"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-foreground">Dr. Sarah Johnson</p>
            <p className="text-xs text-foreground/80">Academic Counselor</p>
          </div>
          <div className="w-12 h-12 bg-secondary border-4 border-black flex items-center justify-center">
            <span className="text-xl font-bold">SJ</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
