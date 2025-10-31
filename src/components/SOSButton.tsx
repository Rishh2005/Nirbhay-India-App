import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SOSButtonProps {
  onSOSTriggered?: () => void;
}

const SOSButton = ({ onSOSTriggered }: SOSButtonProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
        }
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

      // Create SOS alert
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

      // Get emergency contacts
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
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-danger to-warning flex items-center justify-center animate-pulse shadow-[0_0_100px_rgba(239,83,80,0.8)]">
              <div className="text-white text-7xl font-bold">{countdown}</div>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
          </div>

          <div className="text-white space-y-2">
            <p className="text-2xl font-bold">Sending SOS Alert...</p>
            <p className="text-white/70">Emergency contacts will be notified</p>
          </div>

          <Button
            onClick={cancelSOS}
            variant="outline"
            size="lg"
            className="bg-white hover:bg-white/90 text-primary"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOSPress}
      data-sos-button
      className="w-48 h-48 rounded-full bg-gradient-to-br from-danger to-warning shadow-[0_0_60px_rgba(239,83,80,0.6)] hover:shadow-[0_0_80px_rgba(239,83,80,0.8)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center group relative overflow-hidden"
    >
      {/* Animated ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <AlertCircle className="w-20 h-20 mx-auto text-white mb-2 drop-shadow-lg" />
        <span className="text-3xl font-bold text-white tracking-wider drop-shadow-lg">
          SOS
        </span>
      </div>
    </button>
  );
};

export default SOSButton;
