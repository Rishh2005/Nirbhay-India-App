import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Mic, Send, X, Volume2 } from "lucide-react";
import { toast } from "sonner";

// Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  onClose: () => void;
}

// Setup your Groq API details
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const AIAssistant = ({ onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm Nirbhay AI, your safety companion. I can help you with emergency guidance, safety tips, nearby safe locations, and answer your questions. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Send and get AI response from Groq
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3-8b-8192", // You can change the model name if needed
          messages: [
            ...messages.map((m) => ({
              role: m.role === "user" ? "user" : "system",
              content: m.content,
            })),
            { role: "user", content: input },
          ],
        }),
      });

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Network error. Please try again." },
        ]);
        return;
      }

      const data = await response.json();
      const aiReply =
        data.choices?.[0]?.message?.content || "No response from AI.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again later." },
      ]);
    }
  };

  // Voice input using browser Web Speech API
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported");
      return;
    }
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      toast.success("Voice input captured");
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input error");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    toast.info("Voice input activated");
  };

  // Text-to-speech using browser SpeechSynthesis API
  const speakResponse = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech not supported");
      return;
    }
    setIsSpeaking(true);
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.onend = () => {
      setIsSpeaking(false);
      toast.success("Finished speaking");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speaking error");
    };
    window.speechSynthesis.speak(utterance);
    toast.info("Speaking response");
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-1 sm:p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[90vh] sm:h-[600px] flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Nirbhay AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        {/* Chat Content */}
        <CardContent className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-xs sm:text-sm ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-6 px-2"
                    onClick={() => speakResponse(message.content)}
                  >
                    <Volume2 className="w-3 h-3 mr-1" />
                    Speak
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>

        {/* Input Area */}
        <div className="p-2 sm:p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about your safety..."
              className="flex-1"
              disabled={isListening}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={startVoiceInput}
              className={isListening ? "bg-danger text-white animate-pulse" : ""}
              disabled={isListening}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button onClick={handleSend} disabled={!input.trim() || isListening}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI-powered safety assistant • Voice enabled
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
