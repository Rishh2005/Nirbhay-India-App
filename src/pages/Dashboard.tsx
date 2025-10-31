import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Users, LogOut, Phone, Video, Zap, Clock, FileText, User } from "lucide-react";
import { toast } from "sonner";
import FakeCall from "@/components/FakeCall";
import AIAssistantModal from "@/components/AIAssistantModal";
import FooterNav from "@/components/FooterNav";
const logo = "/nirbhay-logo.png";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [alertsByDay, setAlertsByDay] = useState<Array<{ day: string; count: number }>>([]);
  
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
    loadContacts(user.id);
    loadAlerts(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(data);
  };

  const loadContacts = async (userId: string) => {
    const { data } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId);
    
    setContacts(data || []);
  };

  const loadAlerts = async (userId: string) => {
    const { data } = await supabase
      .from("sos_alerts")
      .select("created_at,status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    const list = data || [];
    setAlerts(list);
    // Aggregate last 7 days
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      return { key, date: new Date(d.getFullYear(), d.getMonth(), d.getDate()) };
    });
    const counts = days.map(({ key, date }) => ({
      day: key,
      count: list.filter(a => new Date(a.created_at).toDateString() === date.toDateString()).length,
    }));
    setAlertsByDay(counts);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const activeAlerts = alerts.filter(a => a.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-accent/10 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Nirbhay India" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-primary">Nirbhay India</h1>
              <p className="text-xs text-muted-foreground">Your Safety Guardian</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/profile")}
              className="rounded-full"
            >
              <User className="w-5 h-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top duration-500">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || "User"}!
          </h2>
          <p className="text-muted-foreground text-lg">Your safety is our priority</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-500">
          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Emergency Contacts
              </CardTitle>
              <Users className="w-5 h-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{contacts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {contacts.filter(c => c.is_guardian).length} guardians
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Alerts
              </CardTitle>
              <Shield className={activeAlerts > 0 ? "w-5 h-5 text-danger" : "w-5 h-5 text-success"} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{activeAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeAlerts === 0 ? "All clear" : "Needs attention"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Alerts
              </CardTitle>
              <MapPin className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{alerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime history</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin-style widgets: charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Alerts - Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertsByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Contacts Breakdown</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Guardians", value: contacts.filter(c => c.is_guardian).length },
                      { name: "Others", value: Math.max(contacts.length - contacts.filter(c => c.is_guardian).length, 0) }
                    ]}
                    cx="50%" cy="50%" outerRadius={70} dataKey="value"
                    label
                  >
                    {[
                      contacts.filter(c => c.is_guardian).length,
                      Math.max(contacts.length - contacts.filter(c => c.is_guardian).length, 0)
                    ].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#60a5fa"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Home info: Blockchain + Jewelry connectivity */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Secure Safety, Powered by Blockchain</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Jewelry Connectivity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Your wearable connects securely to the app to trigger SOS and share trusted signals when you need it most.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Tamper-proof Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Evidence hashes are stored on-chain and files on IPFS, verifying authenticity with SHA-256.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Verified Guardians</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Link trusted guardians and authorities via verified wallets to receive alerts promptly.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <FooterNav />

      {/* Modals */}
      {showFakeCall && <FakeCall onClose={() => setShowFakeCall(false)} />}
      {showAIAssistant && <AIAssistantModal onClose={() => setShowAIAssistant(false)} />}
    </div>
  );
};

export default Dashboard;
