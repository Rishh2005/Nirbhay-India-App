import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { AlertTriangle, Shield, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CommunityReportProps {
  onClose: () => void;
}

const reportTypes = [
  { value: 'harassment', label: 'Harassment', icon: AlertTriangle, color: 'text-danger' },
  { value: 'unsafe_area', label: 'Unsafe Area', icon: AlertTriangle, color: 'text-warning' },
  { value: 'suspicious_activity', label: 'Suspicious Activity', icon: Eye, color: 'text-warning' },
  { value: 'safe_spot', label: 'Safe Spot', icon: Shield, color: 'text-success' },
  { value: 'well_lit', label: 'Well Lit Area', icon: Shield, color: 'text-success' },
  { value: 'police_presence', label: 'Police Nearby', icon: Users, color: 'text-success' },
];

const CommunityReport = ({ onClose }: CommunityReportProps) => {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) {
      toast.error('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current location
      if (!navigator.geolocation) {
        toast.error('Geolocation not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { error } = await supabase
          .from('community_reports')
          .insert({
            reporter_id: user?.id,
            report_type: selectedType,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            description,
            severity: selectedType.includes('safe') || selectedType.includes('well_lit') ? 8 : 5,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });

        if (error) throw error;

        toast.success('Report submitted! Thank you for keeping the community safe');
        onClose();
      }, (error) => {
        toast.error('Could not get your location');
        console.error(error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Report to Community</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help keep others safe by reporting incidents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block">Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${type.color} mx-auto mb-1`} />
                    <div className="text-xs font-medium text-center">
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Details (Optional)
            </label>
            <Textarea
              placeholder="Describe what happened or what you observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your location will be used to mark this report on the safety map
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityReport;
