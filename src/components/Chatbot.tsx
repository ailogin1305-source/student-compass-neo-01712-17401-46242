import { useState } from "react";
import { Bot, User, Send, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Student, Intervention } from "@/types/database";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const Chatbot = ({ isOpen, onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Hi! I'm your AI assistant. Ask me anything about student analytics, interventions, or specific students. Try: 'Show me all critical risk students in ECE'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    // Get AI response
    const response = await generateResponse(userInput);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  const generateResponse = async (query: string) => {
    try {
      // Fetch context from database
      const { data: students } = await supabase.from('students').select('*').limit(100) as { data: Student[] | null };
      const { data: interventions } = await supabase.from('interventions').select('*').limit(50) as { data: Intervention[] | null };
      
      const context = {
        totalStudents: students?.length || 0,
        criticalRiskCount: students?.filter(s => s.risk_category === 'CRITICAL').length || 0,
        highRiskCount: students?.filter(s => s.risk_category === 'HIGH').length || 0,
        departments: [...new Set(students?.map(s => s.department))],
        averageRisk: students?.reduce((sum, s) => sum + (s.risk_score || 0), 0) / (students?.length || 1),
        recentInterventions: interventions?.slice(0, 5),
        students: students?.slice(0, 20), // Top 20 for context
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.slice(-5), // Last 5 messages for context
          context
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-16 bottom-0 bg-white border-l-4 border-black z-40 flex flex-col shadow-brutal-lg transition-all duration-300",
        isExpanded ? "w-full md:w-2/3" : "w-full md:w-96"
      )}
    >
      {/* Header */}
      <div className="bg-brutal-purple border-b-4 border-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-bold text-white uppercase">AI Assistant</h3>
            <p className="text-xs text-white/90">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-brutal-purple border-2 border-black flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] p-4 border-4 border-black whitespace-pre-line",
                message.role === "user"
                  ? "bg-primary shadow-brutal-sm"
                  : "bg-white shadow-brutal-sm"
              )}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 bg-secondary border-2 border-black flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t-4 border-black p-4 bg-muted">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 border-4 border-black focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            onClick={handleSend}
            className="bg-primary text-foreground border-4 border-black hover:bg-primary/90 shadow-brutal-sm hover:shadow-brutal"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Try: "Show critical students" or "Best interventions"
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
