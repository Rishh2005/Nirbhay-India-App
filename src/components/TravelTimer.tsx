import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Clock, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TravelTimerProps {
  onClose: () => void;
}

const TravelTimer = ({ onClose }: TravelTimerProps) => {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [travelLogId, setTravelLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const startTimer = async () => {
    if (!destination) {
      toast.error('Please enter your destination');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('travel_logs')
        .insert({
          user_id: user.id,
          destination,
          expected_duration: duration,
          expected_arrival: new Date(Date.now() + duration * 60000).toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setTravelLogId(data.id);
      setTimeLeft(duration * 60);
      setIsActive(true);
      toast.success('Travel timer started! Stay safe');
    } catch (error) {
      console.error('Error starting travel log:', error);
      toast.error('Failed to start travel timer');
    }
  };

  const handleTimeout = async () => {
    setIsActive(false);
    toast.error('⚠️ Travel timer expired! Emergency contacts will be alerted', {
      duration: 5000
    });

    if (travelLogId) {
      await supabase
        .from('travel_logs')
        .update({ status: 'alerted' })
        .eq('id', travelLogId);
    }
  };

  const markSafe = async () => {
    setIsActive(false);
    toast.success('✅ Marked as safe! Glad you arrived');

    if (travelLogId) {
      await supabase
        .from('travel_logs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', travelLogId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Travel Safety Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isActive ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Destination</label>
                <Input
                  placeholder="Where are you going?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Expected Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="w-full"
                  min="5"
                  max="180"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={startTimer} className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Start Timer
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-primary mb-4">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-muted-foreground">
                  Time remaining to reach {destination}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={markSafe} className="flex-1 bg-success hover:bg-success/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I'm Safe
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsActive(false);
                    toast.info('Timer cancelled');
                  }}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Your guardians will be alerted if you don't check in
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelTimer;
