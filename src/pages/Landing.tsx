import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
const logo = "/nirbhay-logo.png";

const Landing = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-6 animate-scale-in">
            <img src={logo} alt="Nirbhay" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-wide">
            निर्भय
          </h1>
          <p className="text-xl text-white/90 font-light">
            Empowering Safety Through Technology
          </p>
          <div className="mt-8 flex gap-2 justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="animate-fade-in">
          <div className="w-40 h-40 mx-auto mb-8 animate-scale-in">
            <img src={logo} alt="Nirbhay India" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            NIRBHAY INDIA
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-white/90" />
            <p className="text-2xl md:text-3xl text-white/90 font-light">
              Your Digital Shield
            </p>
          </div>

          <p className="text-lg text-white/80 max-w-md mx-auto mb-12">
            Stay protected with real-time location tracking, instant SOS alerts, 
            and AI-powered safety assistance
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-2xl hover:scale-105 transition-all"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6 rounded-full"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/80 text-sm">24/7 Protection</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-white/80 text-sm">Live Tracking</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="text-white/80 text-sm">AI Assistant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
