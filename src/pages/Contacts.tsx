import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Phone, Shield, Trash2, Star, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import FakeCall from "@/components/FakeCall";
import FooterNav from "@/components/FooterNav";

interface Contact { id: string; name: string; phone_number: string; relationship?: string | null; priority: number; is_guardian: boolean }

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    relationship: "",
    priority: 1,
    is_guardian: false,
  });
  const navigate = useNavigate();

  const loadContacts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("emergency_contacts")
      .select("id,name,phone_number,relationship,priority,is_guardian")
      .eq("user_id", user.id)
      .order("priority", { ascending: true });

    setContacts((data as Contact[]) || []);
  }, [navigate]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAdd = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("emergency_contacts").insert({
      ...formData,
      user_id: user.id,
    });

    if (error) {
      toast.error("Failed to add contact");
      return;
    }

    toast.success("Contact added successfully");
    setShowDialog(false);
    setFormData({
      name: "",
      phone_number: "",
      relationship: "",
      priority: 1,
      is_guardian: false,
    });
    loadContacts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete contact");
      return;
    }

    toast.success("Contact deleted");
    loadContacts();
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-primary">Emergency Contacts</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Safety Network</h2>
            <p className="text-sm text-muted-foreground">Manage trusted contacts who will be alerted in emergencies</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFakeCall(true)}>
              <PhoneCall className="w-4 h-4 mr-2" /> Fake Call
            </Button>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Mother, Friend, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority (1-5)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guardian"
                    checked={formData.is_guardian}
                    onChange={(e) => setFormData({ ...formData, is_guardian: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="guardian" className="cursor-pointer">
                    Mark as Guardian (receives all alerts)
                  </Label>
                </div>
                <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/90">
                  Add Contact
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">
                Add trusted contacts who will be notified during emergencies
              </p>
              <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{contact.name}
                          {contact.relationship && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {contact.relationship}
                            </span>
                          )}
                        </h3>
                        {contact.is_guardian && (
                          <Shield className="w-4 h-4 text-primary" />
                        )}
                        <div className="flex gap-1">
                          {[...Array(contact.priority)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{contact.phone_number}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {/* contact.last_known_lat && contact.last_known_lng && (
                          <span>Last location saved</span>
                        ) */}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCall(contact.phone_number)}
                        className="hover:bg-success hover:text-white"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setShowFakeCall(true)}
                        className="hover:bg-primary hover:text-white"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDelete(contact.id)}
                        className="hover:bg-danger hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <FooterNav />
      {showFakeCall && <FakeCall onClose={() => setShowFakeCall(false)} />}
    </div>
  );
};

export default Contacts;
