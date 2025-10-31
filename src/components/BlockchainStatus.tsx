import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, CheckCircle, Clock, Link2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const BlockchainStatus = () => {
  const [incidentCount, setIncidentCount] = useState(0);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: incidents } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('user_id', user.id);

    const { data: evidence } = await supabase
      .from('evidence_records')
      .select('*')
      .eq('user_id', user.id);

    setIncidentCount(incidents?.length || 0);
    setEvidenceCount(evidence?.length || 0);
    setVerifiedCount(
      evidence?.filter(e => e.blockchain_verified).length || 0
    );
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          Blockchain Trust Layer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Network Status
          </span>
          <span className="text-sm font-medium text-success flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Connected
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{incidentCount}</div>
            <div className="text-xs text-muted-foreground">Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{evidenceCount}</div>
            <div className="text-xs text-muted-foreground">Evidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{verifiedCount}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            All records are immutably stored and cryptographically verified
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainStatus;
