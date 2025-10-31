import { useState, useEffect } from "react";
import { AlertCircle, X, Shield, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SOSButtonMainProps {
  onSOSTriggered?: () => void;
}

const SOSButtonMain = ({ onSOSTriggered }: SOSButtonMainProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Location error:", error)
      );
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActivating && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isActivating && countdown === 0) {
      triggerSOS();
    }
    return () => clearTimeout(timer);
  }, [isActivating, countdown]);

  const handleSOSPress = () => {
    setIsActivating(true);
    setCountdown(3);
  };

  const cancelSOS = () => {
    setIsActivating(false);
    setCountdown(3);
    toast.info("SOS cancelled");
  };

  const triggerSOS = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to use SOS");
        return;
      }

      const { error } = await supabase
        .from("sos_alerts")
        .insert({
          user_id: user.id,
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          alert_type: "manual",
          status: "active",
        });

      if (error) throw error;

      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: true });

      toast.success("🚨 SOS Alert Sent!", {
        description: `Alert sent to ${contacts?.length || 0} emergency contacts`,
      });

      setIsActivating(false);
      setCountdown(3);
      onSOSTriggered?.();
    } catch (error: any) {
      console.error("SOS error:", error);
      toast.error("Failed to send SOS alert");
      setIsActivating(false);
      setCountdown(3);
    }
  };

  if (isActivating) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
        <div className="text-center space-y-8 px-4">
          <div className="relative">
            <div 
              className="w-64 h-64 rounded-full flex items-center justify-center animate-pulse"
              style={{
                background: 'var(--gradient-danger)',
                boxShadow: 'var(--shadow-danger)'
              }}
            >
              <div className="text-white text-8xl font-bold">{countdown}</div>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          </div>

          <div className="text-white space-y-3">
            <h2 className="text-3xl font-bold">Emergency SOS Activated</h2>
            <p className="text-white/80 text-lg">Your location and alert are being sent to emergency contacts</p>
          </div>

          <Button
            onClick={cancelSOS}
            size="lg"
            className="bg-white hover:bg-white/90 text-danger font-semibold px-8 py-6 text-lg"
          >
            <X className="w-6 h-6 mr-2" />
            Cancel SOS
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleSOSPress}
        data-sos-button
        className="relative w-56 h-56 rounded-full shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:shadow-[0_0_80px_rgba(239,68,68,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'var(--gradient-sos)'
        }}
      >
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
        <div className="absolute inset-4 rounded-full border-2 border-danger/30 animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-2">
          <AlertCircle className="w-24 h-24 mx-auto text-danger drop-shadow-2xl" />
          <span className="text-4xl font-bold text-danger tracking-wider drop-shadow-lg block">
            SOS
          </span>
          <span className="text-sm text-danger/80 font-medium">
            Emergency Alert
          </span>
        </div>
      </button>
      
      {/* Info text */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-max">
        <p className="text-sm text-muted-foreground text-center">
          Tap to send emergency alert
        </p>
      </div>
    </div>
  );
};

export default SOSButtonMain;
