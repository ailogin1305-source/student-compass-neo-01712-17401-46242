import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const success = login(username, password);
    if (success) {
      navigate("/app");
    } else {
      setError("Invalid credentials. Try username: teacher, password: password123");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 flex items-center gap-2 text-foreground hover:text-primary font-bold"
      >
        <Shield className="h-6 w-6" />
        <span>Back to Home</span>
      </Link>

      <Card className="w-full max-w-md border-4 border-black shadow-brutal-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary border-4 border-black flex items-center justify-center">
              <Shield className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to access the Dropout Predictor dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-bold">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-4 border-black"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-4 border-black"
                placeholder="Enter your password"
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border-4 border-destructive text-destructive font-bold text-sm">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary text-foreground border-4 border-black hover:bg-primary/90 font-bold"
              size="lg"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
