import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import FooterNav from "@/components/FooterNav";

const Settings = () => {
  const [jewelryConnected, setJewelryConnected] = useState(false);
  const [locationPermission, setLocationPermission] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(true);
  const [micPermission, setMicPermission] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-accent/10 pb-24">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Jewelry Connection</div>
              <div className="text-sm text-muted-foreground">Status: {jewelryConnected ? "Connected" : "Disconnected"}</div>
            </div>
            <Switch checked={jewelryConnected} onCheckedChange={setJewelryConnected} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Location Permission</div>
              <div className="text-sm text-muted-foreground">Required for SOS and maps</div>
            </div>
            <Switch checked={locationPermission} onCheckedChange={setLocationPermission} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Camera Permission</div>
              <div className="text-sm text-muted-foreground">For video evidence</div>
            </div>
            <Switch checked={cameraPermission} onCheckedChange={setCameraPermission} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Microphone Permission</div>
              <div className="text-sm text-muted-foreground">For audio evidence</div>
            </div>
            <Switch checked={micPermission} onCheckedChange={setMicPermission} />
          </div>
        </Card>
      </main>

      <FooterNav />
    </div>
  );
};

export default Settings;


