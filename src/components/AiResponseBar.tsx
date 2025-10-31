import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string;

const AiResponseBar = () => {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // AI Query Function (Groq preferred, Gemini fallback)
  const ask = async () => {
    if (!prompt) return;
    setLoading(true);
    setAnswer(""); // Clear previous answer
    try {
      const groq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: "You are a concise women-safety assistant." },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 256,
        }),
      });
      if (groq.ok) {
        const data = await groq.json();
        const content = data.choices?.[0]?.message?.content || "";
        setAnswer(content);
      } else {
        const gem = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        );
        const j = await gem.json();
        const content = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
        setAnswer(content);
      }
    } catch (e) {
      setAnswer("Unable to fetch AI response.");
    } finally {
      setLoading(false);
    }
  };

  // Text-to-speech for answer
  const speak = () => {
    if (!answer) return;
    if (!("speechSynthesis" in window)) return;
    setSpeaking(true);
    const utterance = new window.SpeechSynthesisUtterance(answer);
    utterance.lang = "en-IN";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 px-3 md:px-0 z-40">
      <div className="container mx-auto bg-white/95 border shadow-lg rounded-xl p-2 flex items-center gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask safety guidance..."
          onKeyDown={(e) => e.key === "Enter" && ask()}
          disabled={loading}
        />
        <Button onClick={ask} disabled={loading || !prompt.trim()}>
          {loading ? "..." : "Ask"}
        </Button>
      </div>
      {answer && (
        <div className="container mx-auto mt-2 text-sm bg-background/80 border rounded-xl p-3 whitespace-pre-wrap flex items-center gap-2">
          <span className="flex-1">{answer}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={speak}
            disabled={speaking}
            className="flex items-center gap-1"
            aria-label="Speak answer"
          >
            <Volume2 className="w-4 h-4" />
            {speaking ? "Speaking..." : "Speak"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AiResponseBar;
