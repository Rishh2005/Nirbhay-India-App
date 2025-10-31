import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FakeCallProps {
  onClose: () => void;
}

const FakeCall = ({ onClose }: FakeCallProps) => {
  const [isRinging, setIsRinging] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState("Mom");
  const [callerNumber, setCallerNumber] = useState("+91 98XXX XXXXX");
  const [showPicker, setShowPicker] = useState(true);

  const scenarios = [
    { name: "Mom", number: "+91 98XXX XXXXX" },
    { name: "Boss", number: "+91 97XXX XXXXX" },
    { name: "Police Control Room", number: "100" },
    { name: "Cab Driver", number: "+91 96XXX XXXXX" },
    { name: "Neighbor", number: "+91 95XXX XXXXX" },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isRinging) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRinging]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setIsRinging(false);
  };

  const handleEnd = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary z-50 flex flex-col items-center justify-between p-8 animate-fade-in">
      {/* Scenario Picker */}
      {showPicker && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-white shadow-lg">
          <div className="text-xs opacity-90 mb-2">Choose caller</div>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((s) => (
              <button
                key={s.name}
                className={`px-2 py-1 rounded-lg text-xs border ${callerName === s.name ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20`}
                onClick={() => { setCallerName(s.name); setCallerNumber(s.number); setShowPicker(false); }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Caller Info */}
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-6 animate-pulse">
          <div className="w-28 h-28 rounded-full bg-white/30 flex items-center justify-center">
            <Phone className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold mb-2">{callerName}</h2>
        <p className="text-xl text-white/80 mb-4">{callerNumber}</p>
        
        {isRinging ? (
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <p className="text-lg">Incoming call...</p>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="text-2xl font-mono">{formatDuration(callDuration)}</p>
            <p className="text-sm text-white/70">Call in progress</p>
          </div>
        )}
      </div>

      {/* Call Actions */}
      <div className="w-full max-w-sm">
        {isRinging ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleEnd}
              size="lg"
              className="h-20 rounded-full bg-danger hover:bg-danger/90 text-white shadow-lg"
            >
              <PhoneOff className="w-8 h-8" />
            </Button>
            <Button
              onClick={handleAnswer}
              size="lg"
              className="h-20 rounded-full bg-success hover:bg-success/90 text-white shadow-lg"
            >
              <Phone className="w-8 h-8" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleEnd}
            size="lg"
            className="w-full h-20 rounded-full bg-danger hover:bg-danger/90 text-white shadow-lg"
          >
            <PhoneOff className="w-8 h-8 mr-2" />
            End Call
          </Button>
        )}
        
        {!isRinging && (
          <p className="text-center text-white/60 text-sm mt-4">
            This is a fake call for your safety
          </p>
        )}
      </div>
    </div>
  );
};

export default FakeCall;
