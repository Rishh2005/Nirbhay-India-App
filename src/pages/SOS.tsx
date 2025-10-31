import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, AlertTriangle, Route, Search, Volume2, Clock, Phone, Play } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { reportIncidentWithBlockchain } from "@/integrations/blockchain";
import { notifyContactsViaBlockchain } from "@/integrations/blockchain/notifications";
import { toast } from "sonner";
// Removed global footer AI bar on SOS page
import FakeCall from "@/components/FakeCall";
import { GoogleMap, Marker, Circle, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { isOnline, enqueueSOS } from "@/utils/offline";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDh85PgN2MrMRAVohVswxAJ3YSy_mwxmEA";

const SOS = () => {
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [destination, setDestination] = useState("");
  const [pressing, setPressing] = useState(false);
  const [useAlgorand, setUseAlgorand] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null);
  const [travelTimer, setTravelTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [safetyZones, setSafetyZones] = useState<Array<{ lat: number; lng: number; type: string; radius: number }>>([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    getCurrentLocation();
    loadDelhiSafetyZones();
  }, []);

  useEffect(() => {
    if (timerActive && travelTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTravelTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive, travelTimer]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          // Center map on Delhi if location is not available
          if (!loc.lat || !loc.lng) {
            setLocation({ lat: 28.6139, lng: 77.2090 }); // Delhi coordinates
          }
        },
        () => {
          // Default to Delhi
          setLocation({ lat: 28.6139, lng: 77.2090 });
          toast.error("Location access denied, showing Delhi map");
        }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const loadDelhiSafetyZones = () => {
    const zones: Array<{ lat: number; lng: number; type: string; radius: number }> = [];
    const center = { lat: 28.6139, lng: 77.2090 };
    const randomInDelhi = () => {
      const dLat = (Math.random() - 0.5) * 0.6;
      const dLng = (Math.random() - 0.5) * 0.6;
      return { lat: center.lat + dLat, lng: center.lng + dLng };
    };
    const pushZones = (count: number, type: string, radius: number) => {
      for (let i = 0; i < count; i++) {
        const p = randomInDelhi();
        zones.push({ lat: p.lat, lng: p.lng, type, radius });
      }
    };
    pushZones(50, 'green', 1200);
    pushZones(25, 'yellow', 900);
    pushZones(15, 'red', 700);
    setSafetyZones(zones);
  };

  const handleSOSLongPress = async () => {
    if (!location) {
      toast.error("Location not available");
      return;
    }
    if (!isOnline()) {
      enqueueSOS({ lat: location.lat, lng: location.lng, useAlgorand, createdAt: Date.now() });
      toast.info("You're offline. SOS queued and will send automatically when back online.");
      return;
    }
    try {
      setSending(true);
      
      // Play alarm sound
      playAlarmSound();

      // Submit to blockchain
      const txHash = await reportIncidentWithBlockchain(
        location.lat,
        location.lng,
        undefined,
        useAlgorand
      );

      // Notify contacts via blockchain
      await notifyContactsViaBlockchain(location, useAlgorand);

      toast.success(`🚨 SOS Sent!`, {
        description: `Location sent to blockchain. Contacts notified. TX: ${txHash.slice(0, 10)}...`,
        duration: 5000,
      });

      // Store in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("sos_alerts").insert({
          user_id: user.id,
          latitude: location.lat,
          longitude: location.lng,
          alert_type: "sos",
          status: "active",
          blockchain_tx: txHash,
        });
      }
    } catch (error) {
      toast.error("Failed to send SOS", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setSending(false);
    }
  };

  const playAlarmSound = () => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.value = 0.7;
    oscillator.start();
    setTimeout(() => oscillator.stop(), 2000);
  };

  const handlePressStart = () => {
    setPressing(true);
    // Short tap sound feedback
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = 1200; gain.gain.value = 0.2;
      osc.start(); setTimeout(() => { osc.stop(); ctx.close(); }, 120);
    } catch {}
    pressTimerRef.current = setTimeout(() => {
      handleSOSLongPress();
    }, 1000);
  };

  const handlePressEnd = () => {
    setPressing(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleRouteSearch = async () => {
    if (!destination || !location || !isLoaded || !mapRef.current) return;

    try {
      // Use Google Maps Directions API via fetch
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(mapRef.current);
      
      directionsService.route(
        {
          origin: new google.maps.LatLng(location.lat, location.lng),
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            setRoute(result);
            directionsRendererRef.current = directionsRenderer;
            
            // Calculate travel time and start timer
            const leg = result.routes[0]?.legs[0];
            const durationSeconds = leg?.duration?.value || 0;
            setTravelTimer(Math.floor(durationSeconds / 60)); // Convert to minutes
            setTimerActive(true);
            
            toast.success("Safe route calculated!");
          } else {
            toast.error("Could not calculate route");
          }
        }
      );
    } catch (error) {
      toast.error("Could not calculate route", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleTimerComplete = () => {
    toast.warning("Travel timer completed!", {
      description: "If you haven't arrived, consider checking in or sending your location.",
    });
  };

  const getZoneColor = (type: string) => {
    switch (type) {
      case "green": return "#22c55e";
      case "yellow": return "#eab308";
      case "red": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const mapContainerStyle = {
    width: "100%",
    height: "60vh",
  };

  const defaultCenter = location || { lat: 28.6139, lng: 77.2090 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 pb-24">
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">SOS Center</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFakeCall(true)}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Back</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="blockchain-sos-toggle">Use Algorand (default: Ethereum)</Label>
            <Switch id="blockchain-sos-toggle" checked={useAlgorand} onCheckedChange={setUseAlgorand} />
          </div>
        </Card>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Search destination for safe route"
              className="pl-9"
              onKeyPress={(e) => e.key === "Enter" && handleRouteSearch()}
            />
          </div>
          <Button variant="default" className="gap-2" onClick={handleRouteSearch} disabled={!destination}>
            <Route className="w-4 h-4" /> Route
          </Button>
        </div>

        {timerActive && travelTimer > 0 && (
          <Card className="p-4 bg-warning/10 border-warning">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="font-semibold">Travel Timer: {Math.floor(travelTimer / 60)}:{(travelTimer % 60).toString().padStart(2, "0")}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setTimerActive(false)}>Stop</Button>
            </div>
          </Card>
        )}

        <div className="relative w-full h-[60vh] bg-muted rounded-xl overflow-hidden shadow-lg">
          {isLoaded && location ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
              onLoad={(map) => {
                mapRef.current = map;
                if (route) {
                  const renderer = new google.maps.DirectionsRenderer();
                  renderer.setMap(map);
                  renderer.setDirections(route);
                  directionsRendererRef.current = renderer;
                }
              }}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
              }}
            >
              {/* Current Location Marker */}
              <Marker
                position={location}
                title="Your Location"
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />

              {/* Safety Zones */}
              {safetyZones.map((zone, index) => (
                <Circle
                  key={index}
                  center={{ lat: zone.lat, lng: zone.lng }}
                  radius={zone.radius}
                  options={{
                    fillColor: getZoneColor(zone.type),
                    fillOpacity: 0.2,
                    strokeColor: getZoneColor(zone.type),
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                  }}
                />
              ))}

              {/* Route Directions - will be rendered via directionsRendererRef */}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/10 to-primary/10">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute bottom-20 left-4 flex flex-col gap-2">
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 shadow-lg"
              onClick={getCurrentLocation}
            >
              <Navigation className="w-4 h-4 mr-2" />My Location
            </Button>
            <Button
              size="sm"
              className="bg-white text-warning hover:bg-white/90 shadow-lg"
              onClick={() => toast.info("Report incident feature")}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />Report
            </Button>
          </div>

          {/* SOS Button */}
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            className={`absolute left-1/2 -translate-x-1/2 bottom-6 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-all z-50 ${
              pressing ? "bg-danger scale-110" : "bg-primary"
            } ${sending ? "animate-pulse" : ""}`}
            aria-label="Hold to send SOS"
            disabled={sending}
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            {pressing ? "Hold for 1 second..." : "Long-press the center SOS button to send your location to blockchain and notify contacts."}
          </div>
          {sending && <div className="text-xs text-primary mt-2">Sending to {useAlgorand ? "Algorand" : "Ethereum"} and notifying contacts...</div>}
        </Card>
      </main>

      <FooterNav />
      {/* Per-page AI guide input can be added similarly to Map if desired */}
      {showFakeCall && <FakeCall onClose={() => setShowFakeCall(false)} />}
    </div>
  );
};

export default SOS;
