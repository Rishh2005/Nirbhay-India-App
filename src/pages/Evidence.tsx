import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FooterNav from "@/components/FooterNav";
import MediaRecorder from "@/components/MediaRecorder";
import AIAssistantModal from "@/components/AIAssistantModal";
import { submitEvidenceWithBlockchain } from "@/integrations/blockchain";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, ExternalLink, Shield, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Evidence = () => {
  const [showMediaRecorder, setShowMediaRecorder] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [saving, setSaving] = useState(false);
  const [useAlgorand, setUseAlgorand] = useState(false);
  const [saved, setSaved] = useState<Array<{ cid: string; sha256: string; mimeType: string; txHash: string; chain: string; timestamp: number }>>([]);

  useEffect(() => {
    loadSavedEvidence();
  }, []);

  const loadSavedEvidence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("evidence_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSaved(data.map(e => ({
        cid: e.ipfs_cid,
        sha256: e.sha256_hash,
        mimeType: e.mime_type,
        txHash: e.blockchain_tx,
        chain: e.blockchain_type || "ethereum",
        timestamp: new Date(e.created_at).getTime(),
      })));
    }
  };

  const handleUploadEvidence = async (file: File) => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const result = await submitEvidenceWithBlockchain(file, useAlgorand);
      
      // Save to database
      await supabase.from("evidence_records").insert({
        user_id: user.id,
        ipfs_cid: result.cid,
        sha256_hash: result.sha256,
        mime_type: file.type,
        blockchain_tx: result.txHash,
        blockchain_type: result.chain,
        blockchain_verified: true,
      });

      await loadSavedEvidence();
      
      toast.success(`Evidence saved on ${result.chain} blockchain!`, {
        description: `TX: ${result.txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      toast.error("Failed to save evidence", {
        description: error.message || "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-accent/10 pb-24">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Evidence</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="blockchain-toggle">Use Algorand (default: Ethereum)</Label>
            <Switch id="blockchain-toggle" checked={useAlgorand} onCheckedChange={setUseAlgorand} />
          </div>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Record Audio/Video</h3>
            <p className="text-sm text-muted-foreground">Capture and save securely to IPFS + Blockchain.</p>
            <Button onClick={() => setShowMediaRecorder(true)}>Open Recorder</Button>
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-white hover:bg-muted cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5 8h14v11H5z"/><path d="M19 5H5v3h14V5z"/></svg>
                <span className="text-sm">Choose file (audio/video)</span>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => e.target.files && handleUploadEvidence(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
            {saving && <div className="text-xs text-muted-foreground">Uploading to IPFS + {useAlgorand ? "Algorand" : "Ethereum"}...</div>}
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">Get guidance during evidence capture.</p>
            <Button variant="secondary" onClick={() => setShowAIAssistant(true)}>Open Assistant</Button>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Blockchain-Verified Evidence</h3>
            </div>
            <span className="text-xs text-muted-foreground">{saved.length} items</span>
          </div>
          <div className="space-y-3">
            {saved.map((ev, i) => (
              <Card key={i} className="p-3 border-2 border-primary/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-semibold uppercase">{ev.chain} Verified</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(ev.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div><span className="font-medium">IPFS CID:</span> <code className="bg-muted px-1 rounded">{ev.cid}</code></div>
                  <div><span className="font-medium">SHA-256:</span> <code className="bg-muted px-1 rounded">{ev.sha256.slice(0, 32)}...</code></div>
                  <div><span className="font-medium">Type:</span> {ev.mimeType}</div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="font-medium">TX Hash:</span>
                    <code className="bg-muted px-1 rounded flex-1 truncate">{ev.txHash}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const explorerUrl = ev.chain === "algorand" 
                          ? `https://testnet.algoexplorer.io/tx/${ev.txHash}`
                          : `https://sepolia.etherscan.io/tx/${ev.txHash}`;
                        window.open(explorerUrl, "_blank");
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="pt-1">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${ev.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-xs hover:underline flex items-center gap-1"
                    >
                      View on IPFS <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
            {saved.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No evidence yet. Upload files to store tamper-proof hashes on blockchain.</p>
              </div>
            )}
          </div>
        </Card>
      </main>

      <FooterNav />

      {showMediaRecorder && <MediaRecorder onClose={() => setShowMediaRecorder(false)} />}
      {showAIAssistant && <AIAssistantModal onClose={() => setShowAIAssistant(false)} />}
    </div>
  );
};

export default Evidence;


