import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, MapPin, Users, Settings, ArrowLeft, LogOut, Bell, Lock, Video, Mic, Phone, CheckCircle, Link2 } from "lucide-react";
import { toast } from "sonner";
const logo = "/nirbhay-logo.png";
import FooterNav from "@/components/FooterNav";
import AiResponseBar from "@/components/AiResponseBar";
import { registerProfileOnBlockchain } from "@/integrations/blockchain/notifications";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [useAlgorand, setUseAlgorand] = useState(false);
  const [savingToBlockchain, setSavingToBlockchain] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState<string | null>(null);
  
  // Safety Settings
  const [autoRecording, setAutoRecording] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [silentMode, setSilentMode] = useState(false);
  const [shakeToSOS, setShakeToSOS] = useState(true);
  const [autoCallPolice, setAutoCallPolice] = useState(false);
  const [timedCheckIn, setTimedCheckIn] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);
    loadProfile(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone_number || "");
      setEmergencyMessage(data.emergency_message || "I need help! This is an emergency.");
      setBlockchainTxHash(data.blockchain_tx_hash || null);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phone,
        emergency_message: emergencyMessage,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      return;
    }

    toast.success("Profile updated successfully");
    loadProfile(user.id);
  };

  const handleSaveToBlockchain = async () => {
    if (!user || !fullName || !phone) {
      toast.error("Please fill in your name and phone number first");
      return;
    }

    try {
      setSavingToBlockchain(true);
      
      // Get emergency contacts
      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("phone_number")
        .eq("user_id", user.id);
      
      const emergencyContacts = contacts?.map(c => c.phone_number) || [];

      const txHash = await registerProfileOnBlockchain(
        fullName,
        phone,
        emergencyContacts,
        useAlgorand
      );

      // Update profile with blockchain hash
      await supabase
        .from("profiles")
        .update({ blockchain_tx_hash: txHash })
        .eq("id", user.id);

      setBlockchainTxHash(txHash);
      toast.success(`Profile saved to ${useAlgorand ? "Algorand" : "Ethereum"} blockchain!`, {
        description: `TX: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast.error("Failed to save to blockchain", {
        description: error.message || "Unknown error",
      });
    } finally {
      setSavingToBlockchain(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logo} alt="Nirbhay" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-primary">Profile & Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your safety preferences</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Blockchain Data Transparency */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Blockchain Data Transparency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Save Profile to Blockchain</p>
                <p className="text-xs text-muted-foreground">Immutable, verifiable profile storage</p>
              </div>
              <Switch checked={useAlgorand} onCheckedChange={setUseAlgorand} />
            </div>
            {blockchainTxHash && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Profile Verified on Blockchain</span>
                </div>
                <p className="text-xs text-muted-foreground">TX: {blockchainTxHash.slice(0, 20)}...</p>
              </div>
            )}
            <Button
              onClick={handleSaveToBlockchain}
              disabled={savingToBlockchain}
              className="w-full"
            >
              {savingToBlockchain ? "Saving..." : `Save to ${useAlgorand ? "Algorand" : "Ethereum"} Blockchain`}
            </Button>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Emergency Alert Message</Label>
              <Input 
                id="message" 
                value={emergencyMessage} 
                onChange={(e) => setEmergencyMessage(e.target.value)}
                placeholder="Custom SOS message"
                className="mt-1"
              />
            </div>
            
            <Button onClick={handleUpdateProfile} className="w-full">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Safety Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Auto Video Recording</p>
                  <p className="text-xs text-muted-foreground">Record video when SOS is triggered</p>
                </div>
              </div>
              <Switch checked={autoRecording} onCheckedChange={setAutoRecording} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Live Location Sharing</p>
                  <p className="text-xs text-muted-foreground">Share location with guardians</p>
                </div>
              </div>
              <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Silent Mode SOS</p>
                  <p className="text-xs text-muted-foreground">Trigger alert without sound</p>
                </div>
              </div>
              <Switch checked={silentMode} onCheckedChange={setSilentMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Shake to SOS</p>
                  <p className="text-xs text-muted-foreground">Shake phone to trigger alert</p>
                </div>
              </div>
              <Switch checked={shakeToSOS} onCheckedChange={setShakeToSOS} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Auto Call Police</p>
                  <p className="text-xs text-muted-foreground">Call 100 automatically on SOS</p>
                </div>
              </div>
              <Switch checked={autoCallPolice} onCheckedChange={setAutoCallPolice} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Timed Check-In</p>
                  <p className="text-xs text-muted-foreground">Alert if you don't check in</p>
                </div>
              </div>
              <Switch checked={timedCheckIn} onCheckedChange={setTimedCheckIn} />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Numbers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Helplines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
              <span className="font-medium">Police (India)</span>
              <a href="tel:100" className="text-primary font-bold">100</a>
            </div>
            <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
              <span className="font-medium">Women Helpline</span>
              <a href="tel:1091" className="text-primary font-bold">1091</a>
            </div>
            <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
              <span className="font-medium">Ambulance</span>
              <a href="tel:108" className="text-primary font-bold">108</a>
            </div>
            <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
              <span className="font-medium">National Commission for Women</span>
              <a href="tel:7827170170" className="text-primary font-bold">7827170170</a>
            </div>
          </CardContent>
        </Card>
      </main>

      <FooterNav />
      <AiResponseBar />
    </div>
  );
};

export default Profile;
