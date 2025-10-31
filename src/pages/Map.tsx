import { useEffect, useState, useRef, useCallback } from "react";
// Minimal types for SpeechRecognition
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start: () => void;
}
interface SpeechRecognitionAlternative { transcript: string }
interface SpeechRecognitionResult { 0: SpeechRecognitionAlternative; length: number }
interface SpeechRecognitionEvent { results: { 0: SpeechRecognitionResult } }
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, MapPin, Users, Settings, Home, Navigation, AlertTriangle, Phone, Share2, TrendingUp, Route, Search, PhoneCall, Mic } from "lucide-react";
import { toast } from "sonner";
const logo = "/nirbhay-logo.png";
import FooterNav from "@/components/FooterNav";
import FakeCall from "@/components/FakeCall";
import { GoogleMap, Marker, Circle, useJsApiLoader, Autocomplete, TrafficLayer, TransitLayer, Polyline } from "@react-google-maps/api";
import { isOnline } from "@/utils/offline";
// Removed global footer AI bar; will add per-page AI guide bar below map

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDh85PgN2MrMRAVohVswxAJ3YSy_mwxmEA";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

interface SafetyZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zone_type: string;
  description: string;
}

interface CommunityReport { id: string; report_type: string; description?: string | null; created_at: string }

const Map = () => {
  const [user, setUser] = useState<unknown>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [contactsPositions, setContactsPositions] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [showSafeSpots, setShowSafeSpots] = useState(true);
  const [showCommunityLayer, setShowCommunityLayer] = useState(true);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [searchPlace, setSearchPlace] = useState("");
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [nearbyType, setNearbyType] = useState<string | null>(null);
  const [nearbyResults, setNearbyResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  const [trail, setTrail] = useState<Array<{ lat: number; lng: number }>>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const online = isOnline();

  

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  }, [navigate]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setTrail(prev => [...prev.slice(-199), { lat: position.coords.latitude, lng: position.coords.longitude }]);
        },
        (error) => {
          console.error("Location error:", error);
          // Default to Delhi
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
          toast.error("Unable to access location, showing Delhi");
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
    }
  };

  const loadSafetyZones = async () => {
    const { data } = await supabase
      .from("safety_zones")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data && data.length > 0) {
      setSafetyZones(data);
      return;
    }

    // Generate 90+ synthetic Delhi zones (50 green, 25 yellow, 15 red)
    const zones: SafetyZone[] = [];
    const center = { lat: 28.6139, lng: 77.2090 };
    const randomInDelhi = () => {
      // ~30km box around Delhi center
      const dLat = (Math.random() - 0.5) * 0.6;
      const dLng = (Math.random() - 0.5) * 0.6;
      return { lat: center.lat + dLat, lng: center.lng + dLng };
    };
    const pushZones = (count: number, type: string) => {
      for (let i = 0; i < count; i++) {
        const p = randomInDelhi();
        zones.push({
          id: `${type}-${i}`,
          name: `${type.toUpperCase()} Zone ${i + 1}`,
          latitude: p.lat,
          longitude: p.lng,
          zone_type: type,
          description: type === 'green' ? 'Well-lit & monitored' : type === 'yellow' ? 'Be cautious' : 'Avoid area',
        });
      }
    };
    pushZones(50, 'green');
    pushZones(25, 'yellow');
    pushZones(15, 'red');
    setSafetyZones(zones);
  };

  const loadCommunityReports = async () => {
    const { data } = await supabase
      .from("community_reports")
      .select("*")
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });
    
    if (data) {
      setCommunityReports(data);
    }
  };

  const loadContactsPositions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("emergency_contacts")
      .select("name")
      .eq("user_id", user.id)
      .limit(20);
    if (!currentLocation) return;
    const fallback = (idx: number) => ({
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.04,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.04,
    });
    const markers = ((data as { name: string }[] | null) ?? []).map((c, i) => ({
      name: c.name,
      lat: fallback(i).lat,
      lng: fallback(i).lng,
    }));
    setContactsPositions(markers);
  }, [currentLocation]);

  useEffect(() => {
    checkUser();
    getCurrentLocation();
    loadSafetyZones();
    loadCommunityReports();
    loadContactsPositions();
  }, [checkUser, loadContactsPositions]);

  const shareLocation = async () => {
    if (!currentLocation) {
      toast.error("Location not available");
      return;
    }

    const locationUrl = `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Current Location - Nirbhay',
          text: `I'm sharing my location with you for safety: ${locationUrl}`,
          url: locationUrl
        });
        toast.success("Location shared successfully");
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      navigator.clipboard.writeText(locationUrl);
      toast.success("Location link copied to clipboard");
    }
  };

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCurrentLocation({ lat, lng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
        toast.success(`Navigated to ${place.name}`);
      }
    }
  };

  const getZoneColor = (level: string) => {
    switch (level) {
      case 'green': return { fill: '#22c55e', stroke: '#16a34a' };
      case 'yellow': return { fill: '#eab308', stroke: '#ca8a04' };
      case 'red': return { fill: '#ef4444', stroke: '#dc2626' };
      default: return { fill: '#6b7280', stroke: '#4b5563' };
    }
  };

  const getZoneBorderColor = (level: string) => {
    switch (level) {
      case 'green': return 'border-success';
      case 'yellow': return 'border-warning';
      case 'red': return 'border-danger';
      default: return 'border-muted';
    }
  };

  const safeSpots = [
    { name: "Police Station", lat: currentLocation?.lat ? currentLocation.lat + 0.005 : 28.6139, lng: currentLocation?.lng || 77.2090, type: "police" },
    { name: "Hospital", lat: currentLocation?.lat ? currentLocation.lat - 0.005 : 28.6089, lng: currentLocation?.lng ? currentLocation.lng + 0.005 : 77.2140, type: "hospital" },
    { name: "Safe House", lat: currentLocation?.lat ? currentLocation.lat + 0.008 : 28.6189, lng: currentLocation?.lng ? currentLocation.lng - 0.003 : 77.2060, type: "safe" },
  ];

  const mapContainerStyle = {
    width: "100%",
    height: "60vh",
  };

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: aiQuery }]}] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      setAiAnswer(text);
    } catch (e) {
      toast.error("AI guide failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVoice = () => {
    type SRConstructor = new () => SpeechRecognition;
    const w = window as unknown as { webkitSpeechRecognition?: SRConstructor; SpeechRecognition?: SRConstructor };
    const SR = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) {
      toast.error("Voice not supported in this browser");
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      if (t) {
        setAiQuery(t);
        setTimeout(handleAskAI, 50);
      }
    };
    rec.start();
  };

  const nightMapStyles: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
  ];

  const searchNearby = (type: string) => {
    if (!mapRef.current || !currentLocation) return;
    const service = new google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
        radius: 3000,
        type: type as unknown as string
      },
      (results) => {
        const items = (results || []).slice(0, 20).map(r => ({
          lat: r.geometry?.location?.lat() || currentLocation.lat,
          lng: r.geometry?.location?.lng() || currentLocation.lng,
          name: r.name || type
        }));
        setNearbyResults(items);
      }
    );
  };

  const defaultCenter = currentLocation || { lat: 28.6139, lng: 77.2090 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Nirbhay" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-primary">Safety Map</h1>
              <p className="text-xs text-muted-foreground">Live Location Tracking</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowFakeCall(true)}>
              <Phone className="w-5 h-5" />
            </Button>
            <Button 
              variant={showCommunityLayer ? "default" : "ghost"} 
              size="sm"
              onClick={() => setShowCommunityLayer(!showCommunityLayer)}
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={shareLocation}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <main className="container mx-auto px-4 py-4">
        {/* Search Bar */}
        {online && isLoaded && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <Button size="sm" variant={showTraffic ? "default" : "outline"} onClick={() => setShowTraffic(!showTraffic)}>Traffic</Button>
              <Button size="sm" variant={showTransit ? "default" : "outline"} onClick={() => setShowTransit(!showTransit)}>Transit</Button>
              <Button size="sm" variant={nightMode ? "default" : "outline"} onClick={() => setNightMode(!nightMode)}>Night</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { t: "police", label: "Police" },
                { t: "hospital", label: "Hospital" },
                { t: "pharmacy", label: "Pharmacy" },
                { t: "metro_station", label: "Metro" },
                { t: "bus_station", label: "Bus" },
                { t: "gas_station", label: "Fuel" }
              ].map(item => (
                <Button key={item.t} size="sm" variant={nearbyType === item.t ? "default" : "outline"}
                  onClick={() => { setNearbyType(item.t); searchNearby(item.t); }}>
                  {item.label}
                </Button>
              ))}
            </div>
            <Autocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handlePlaceSelect}
            >
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  className="pl-9"
                  value={searchPlace}
                  onChange={(e) => setSearchPlace(e.target.value)}
                />
              </div>
            </Autocomplete>
            </div>
          )}

        {/* Google Map */}
        {online && isLoaded && currentLocation ? (
          <>
          <div className="relative w-full h-[60vh] rounded-xl overflow-hidden shadow-lg mb-4">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                styles: nightMode ? nightMapStyles : undefined,
              }}
            >
              {showTraffic && <TrafficLayer />}
              {showTransit && <TransitLayer />}
              {/* Current Location Marker */}
              <Marker
                position={currentLocation}
                title="Your Location"
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                }}
              />

              {/* Safety Zones */}
              {safetyZones.map((zone) => {
                const colors = getZoneColor(zone.zone_type);
                return (
                  <Circle
                    key={zone.id}
                    center={{ lat: zone.latitude, lng: zone.longitude }}
                    radius={1500}
                    options={{
                      fillColor: colors.fill,
                      fillOpacity: 0.2,
                      strokeColor: colors.stroke,
                      strokeOpacity: 0.6,
                      strokeWeight: 2,
                    }}
                  />
                );
              })}

              {/* Breadcrumb trail */}
              {trail.length > 1 && (
                <Polyline path={trail} options={{ strokeColor: "#7c3aed", strokeWeight: 3, strokeOpacity: 0.7 }} />
              )}

              {/* Contacts on Map */}
              {contactsPositions.map((c, idx) => (
                <Marker key={`c-${idx}`} position={{ lat: c.lat, lng: c.lng }} title={c.name}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    strokeColor: "#065f46",
                    strokeWeight: 2,
                  }}
            />
          ))}

              {/* Nearby places */}
              {nearbyResults.map((p, idx) => (
                <Marker key={`n-${idx}`} position={{ lat: p.lat, lng: p.lng }} title={p.name}
                  icon={{
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 5,
                    fillColor: "#3b82f6",
                    fillOpacity: 1,
                    strokeColor: "#1e3a8a",
                    strokeWeight: 2,
                  }}
                />
              ))}

          {/* Safe Spots */}
          {showSafeSpots && safeSpots.map((spot, index) => (
                <Marker
              key={index}
                  position={{ lat: spot.lat, lng: spot.lng }}
                  title={spot.name}
                  icon={{
                    url: spot.type === 'police' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMjJjNTUiLz4KPC9zdmc+' :
                    spot.type === 'hospital' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjZWY0NDQ0Ii8+Cjwvc3ZnPg==' :
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMzM4M2Y2Ii8+Cjwvc3ZnPg==',
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                />
              ))}
            </GoogleMap>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button 
              size="icon" 
              className="bg-white hover:bg-white/90 text-primary shadow-lg"
              onClick={() => setShowSafeSpots(!showSafeSpots)}
            >
              <MapPin className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              className="bg-white hover:bg-white/90 text-primary shadow-lg"
              onClick={getCurrentLocation}
            >
              <Navigation className="w-5 h-5" />
            </Button>
          </div>
          </div>

          {/* AI Guide Bar (Gemini) */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask for safe routes, nearby help, or safety tips..."
              />
              <Button variant="outline" onClick={handleVoice} disabled={listening}>
                <Mic className="w-4 h-4 mr-1" /> {listening ? "Listening" : "Voice"}
              </Button>
              <Button
                onClick={handleAskAI}
                disabled={aiLoading}
              >{aiLoading ? "Asking..." : "Ask"}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Powered by Gemini</p>
            {aiAnswer && (
              <Card className="p-3 mt-2 text-sm whitespace-pre-wrap">
                {aiAnswer}
              </Card>
            )}
          </div>
          </>
        ) : (
          <div className="relative w-full h-[60vh] bg-muted rounded-xl overflow-hidden shadow-lg mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{online ? "Loading map..." : "Offline mode: Map unavailable"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Zone Information */}
        {selectedZone && (
          <Card className="p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {selectedZone.name}
                  <span className={`w-3 h-3 rounded-full bg-${getZoneColor(selectedZone.zone_type).fill}`} />
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedZone.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium">
                    Safety Level: {selectedZone.zone_type.toUpperCase()}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>
                Close
              </Button>
            </div>
          </Card>
        )}

        {/* Safety Zones Legend */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Safety Zones</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-success" />
              <span className="text-sm">Safe Zone - Well-lit, monitored areas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-warning" />
              <span className="text-sm">Caution - Exercise vigilance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-danger" />
              <span className="text-sm">Danger - Avoid if possible</span>
            </div>
          </div>
        </Card>

        {/* Community Reports */}
        {showCommunityLayer && communityReports.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Community Reports
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {communityReports.map((report) => (
                <div key={report.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      {report.report_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <FooterNav />
      {showFakeCall && <FakeCall onClose={() => setShowFakeCall(false)} />}
    </div>
  );
};

export default Map;
