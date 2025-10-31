import { useState } from "react";
import { X, Mic, Send, Phone, MapPin, Shield, AlertCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantModalProps {
  onClose: () => void;
}

const AIAssistantModal = ({ onClose }: AIAssistantModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your safety assistant. I can help you with emergency contacts, safety tips, nearby safe zones, and quick actions. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickActions = [
    { icon: Phone, label: "Call Emergency", action: "call" },
    { icon: MapPin, label: "Safe Zones", action: "zones" },
    { icon: Shield, label: "Safety Tips", action: "tips" },
    { icon: AlertCircle, label: "Report Issue", action: "report" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const response = generateResponse(input);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      speakResponse(response);
    }, 500);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("emergency") || lowerQuery.includes("help")) {
      return "I've located the nearest police station 2.3 km away. Would you like me to share your location with your emergency contacts or call 112?";
    }
    if (lowerQuery.includes("safe") || lowerQuery.includes("zone")) {
      return "There are 3 verified safe zones within 1 km: Metro Station (500m), Police Chowki (800m), and Community Center (950m). Would you like directions?";
    }
    if (lowerQuery.includes("contact")) {
      return "You have 4 emergency contacts configured. Would you like me to send them an alert with your current location?";
    }
    if (lowerQuery.includes("tip")) {
      return "Safety tip: Always trust your instincts. If something feels wrong, move to a well-lit, populated area. Share your live location with trusted contacts when traveling alone.";
    }
    
    return "I can help you with: Finding safe zones nearby, Contacting emergency services, Sharing your location with guardians, Getting safety tips, or Reporting unsafe areas. What would you like to do?";
  };

  const startVoiceInput = () => {
    setIsListening(true);
    toast.info("Listening...", { duration: 2000 });
    
    setTimeout(() => {
      setIsListening(false);
      setInput("Find nearest safe zone");
    }, 2000);
  };

  const speakResponse = (text: string) => {
    setIsSpeaking(true);
    toast.info("🔊 Speaking response");
    
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    let query = "";
    switch (action) {
      case "call":
        query = "I need emergency help";
        break;
      case "zones":
        query = "Show me safe zones nearby";
        break;
      case "tips":
        query = "Give me safety tips";
        break;
      case "report":
        query = "I want to report an unsafe area";
        break;
    }
    setInput(query);
    handleSend();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-gradient-to-br from-background via-secondary/10 to-background border-2 border-primary/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">AI Safety Assistant</h2>
              <p className="text-xs text-muted-foreground">Always here to help you stay safe</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/20">
          {quickActions.map((action) => (
            <button
              key={action.action}
              onClick={() => handleQuickAction(action.action)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              <action.icon className="w-5 h-5 text-primary" />
              <span className="text-xs text-foreground font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                    : "bg-secondary text-secondary-foreground border border-border"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-primary text-sm">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span>Speaking...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-secondary/10">
          <div className="flex gap-2">
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={startVoiceInput}
              className={isListening ? "animate-pulse" : ""}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about safety..."
              className="flex-1"
            />
            <Button onClick={handleSend} className="bg-gradient-to-r from-primary to-accent">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantModal;
