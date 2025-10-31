import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Settings, Video } from "lucide-react";
import SOSButtonFooter from "@/components/SOSButtonFooter";

const FooterNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t-2 shadow-[0_-4px_20px_rgba(183,148,244,0.3)] z-50">
      <div className="relative">
        {/* SOS with animated pulse on hover/focus */}
        <div
          className="transition-all"
        >
          <SOSButtonFooter
            onSOSTriggered={() => navigate("/sos")}
          />
        </div>
        {/* Animated navigation bar */}
        <div className="grid grid-cols-5 gap-1 px-2 py-3">
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            className={`h-16 flex flex-col gap-1
              transition-all duration-200
              ${isActive("/dashboard")
                ? "transform -translate-y-1 bg-primary/20 shadow-lg"
                : "hover:scale-110 hover:bg-primary/10"
              }`}
            onClick={() => navigate("/dashboard")}
          >
            <Shield className="w-5 h-5 transition-transform duration-200 group-hover:scale-125" />
            <span className="text-xs font-medium">Home</span>
          </Button>
          <Button
            variant={isActive("/contacts") ? "default" : "ghost"}
            className={`h-16 flex flex-col gap-1
              transition-all duration-200
              ${isActive("/contacts")
                ? "transform -translate-y-1 bg-primary/20 shadow-lg"
                : "hover:scale-110 hover:bg-primary/10"
              }`}
            onClick={() => navigate("/contacts")}
          >
            <Users className="w-5 h-5 transition-transform duration-200 group-hover:scale-125" />
            <span className="text-xs">Contacts</span>
          </Button>
          <div className="w-16 flex items-center justify-center">
            {/* Spacer for SOS */}
            {/* Optionally, add some pulse indicator if needed */}
          </div>
          <Button
            variant={isActive("/evidence") ? "default" : "ghost"}
            className={`h-16 flex flex-col gap-1
              transition-all duration-200
              ${isActive("/evidence")
                ? "transform -translate-y-1 bg-primary/20 shadow-lg"
                : "hover:scale-110 hover:bg-primary/10"
              }`}
            onClick={() => navigate("/evidence")}
          >
            <Video className="w-5 h-5 transition-transform duration-200 group-hover:scale-125" />
            <span className="text-xs">Evidence</span>
          </Button>
          <Button
            variant={isActive("/settings") ? "default" : "ghost"}
            className={`h-16 flex flex-col gap-1
              transition-all duration-200
              ${isActive("/settings")
                ? "transform -translate-y-1 bg-primary/20 shadow-lg"
                : "hover:scale-110 hover:bg-primary/10"
              }`}
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-5 h-5 transition-transform duration-200 group-hover:scale-125" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
      {/* Pulse animation for SOS button */}
      <style>{`
        .absolute button:hover .drop-shadow-lg,
        .absolute button:focus .drop-shadow-lg {
          animation: sos-pulse 1.2s infinite;
        }
        @keyframes sos-pulse {
          0% { text-shadow: 0 0 8px #fff, 0 0 32px #b794f4; }
          50% { text-shadow: 0 0 24px #fff, 0 0 60px #b794f4; }
          100% { text-shadow: 0 0 8px #fff, 0 0 32px #b794f4; }
        }
      `}</style>
    </nav>
  );
};

export default FooterNav;
