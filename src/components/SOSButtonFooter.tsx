import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SOSButtonFooterProps {
  onSOSTriggered?: () => void;
}

const SOSButtonFooter = ({ onSOSTriggered }: SOSButtonFooterProps) => {
  const handleQuickSOS = async () => {
    // Navigate to SOS immediately for responsiveness
    onSOSTriggered?.();

    // Fire-and-forget background quick SOS logging
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to use SOS");
        return;
      }

      const location = { lat: 0, lng: 0 };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location.lat = position.coords.latitude;
            location.lng = position.coords.longitude;
            supabase
              .from("sos_alerts")
              .insert({
                user_id: user.id,
                latitude: location.lat,
                longitude: location.lng,
                alert_type: "quick",
                status: "active",
              })
              .then(() => {
                toast.success("🚨 Quick SOS Sent!", {
                  description: "Emergency contacts have been notified",
                });
              });
          },
          () => {
            // Proceed without location
            supabase
              .from("sos_alerts")
              .insert({
                user_id: user.id,
                latitude: 0,
                longitude: 0,
                alert_type: "quick",
                status: "active",
              })
              .then(() => {
                toast.success("🚨 Quick SOS Sent!");
              });
          }
        );
        return;
      }
      // If geolocation not available at all
      await supabase
        .from("sos_alerts")
        .insert({
          user_id: user.id,
          latitude: 0,
          longitude: 0,
          alert_type: "quick",
          status: "active",
        });
    } catch (error) {
      console.error("SOS error:", error);
      toast.error("Failed to send SOS");
    }
  };

  return (
    <button
      onClick={handleQuickSOS}
      className="absolute left-1/2 -translate-x-1/2 -top-8 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(183,148,244,0.6)] hover:shadow-[0_0_40px_rgba(183,148,244,0.8)]"
      style={{
        background: 'var(--gradient-lavender)'
      }}
      aria-label="SOS"
    >
      <span className="text-white font-bold text-xl drop-shadow-lg">SOS</span>
    </button>
  );
};

export default SOSButtonFooter;
