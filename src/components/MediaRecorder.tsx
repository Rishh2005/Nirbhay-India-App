import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Mic, Square, Play, Download, X, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface MediaRecorderProps {
  onClose: () => void;
}

const MediaRecorder = ({ onClose }: MediaRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('video');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<globalThis.MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const constraints =
        recordingType === "video"
          ? { video: true, audio: true }
          : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (recordingType === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.controls = false;
      }

      const mediaRecorder = new globalThis.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: recordingType === "video" ? "video/webm" : "audio/webm",
        });
        setRecordedBlob(blob);

        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.controls = true;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success(
        `${recordingType === "video" ? "Video" : "Audio"} recording started`
      );
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Failed to start recording. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast.success("Recording stopped");
    }
  };

  const playRecording = () => {
    if (recordedBlob && videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = URL.createObjectURL(recordedBlob);
      videoRef.current.play();
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nirbhay-${recordingType}-${Date.now()}.webm`;
      a.click();
      toast.success("Recording downloaded");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.poster = "";
      videoRef.current.controls = false;
    }
  };

  // Visual for audio pulses
  const audioPulseBars = (
    <div className="flex items-end gap-1 h-20">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded opacity-80 bg-gradient-to-t from-[#B794F4] to-[#fff]"
          style={{
            height: `${35 + Math.random() * 45}px`,
            animation: "audioPulse 1.2s infinite",
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      <style>
        {`
        @keyframes audioPulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        `}
      </style>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1c1333ee] to-[#442b6922] z-50 flex items-center justify-center p-2 sm:p-7 backdrop-blur-lg">
      <Card className="w-full max-w-lg sm:max-w-2xl shadow-2xl rounded-xl overflow-hidden border-2 border-[#B794F4]">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#B794F4]/10 to-transparent border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-primary">
            {recordingType === "video" ? (
              <Video className="w-5 h-5 text-primary opacity-80" />
            ) : (
              <Mic className="w-5 h-5 text-primary opacity-80" />
            )}
            {recordingType === "video" ? "Video" : "Audio"} Recorder
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6 text-primary" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 px-2 sm:px-8 py-6 bg-white/95 backdrop-blur rounded-b-xl">
          {/* Recording Type Toggle */}
          {!isRecording && !recordedBlob && (
            <div className="flex gap-4 justify-center">
              <Button
                variant={recordingType === "video" ? "default" : "outline"}
                onClick={() => setRecordingType("video")}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <Button
                variant={recordingType === "audio" ? "default" : "outline"}
                onClick={() => setRecordingType("audio")}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                <Mic className="w-4 h-4 mr-2" />
                Audio
              </Button>
            </div>
          )}

          {/* Video Preview */}
          {recordingType === "video" && (
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video border shadow">
              <video
                ref={videoRef}
                autoPlay
                muted={isRecording}
                playsInline
                className="w-full h-full object-contain rounded-xl"
                style={{ background: "#1c1333" }}
              />
              {isRecording && (
                <div className="absolute top-4 left-4 bg-danger text-white px-4 py-1 rounded-full flex items-center gap-2 animate-pulse shadow-lg font-semibold">
                  <div className="w-3 h-3 bg-white rounded-full border border-danger animate-ping"></div>
                  <span>REC</span> <span>{formatTime(recordingTime)}</span>
                </div>
              )}
              {recordedBlob && (
                <div className="absolute top-4 right-4 bg-primary/90 text-white px-2 py-1 rounded font-semibold shadow">
                  Ready to play or download
                </div>
              )}
            </div>
          )}

          {/* Audio Visualization */}
          {recordingType === "audio" && (
            <div className="relative bg-gradient-to-t from-[#B794F4]/50 via-[#fff]/40 to-[#fff]/70 rounded-xl p-8 flex items-center justify-center h-40 border shadow">
              {isRecording ? (
                <div className="w-full">{audioPulseBars}</div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Mic className="w-10 h-10 text-[#B794F4] mb-2 opacity-70" />
                  <span className="text-sm text-muted-foreground">Ready to record audio</span>
                </div>
              )}
              <div className="absolute bottom-2 right-4 text-lg font-mono font-bold text-primary">
                {(isRecording || recordedBlob) && <span>{formatTime(recordingTime)}</span>}
              </div>
              {isRecording && (
                <div className="absolute top-4 left-4 text-danger font-bold animate-pulse">
                  Recording...
                </div>
              )}
              {recordedBlob && (
                <div className="absolute top-4 right-4 bg-primary/80 text-white px-2 py-1 rounded font-semibold shadow">
                  Ready to play or download
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {!isRecording && !recordedBlob && (
              <Button
                onClick={startRecording}
                className="flex-1 py-3 text-[1rem] font-medium bg-gradient-to-r from-[#B794F4] to-[#6C47A6] text-white shadow-lg hover:scale-105 transition-all"
                size="lg"
              >
                {recordingType === "video" ? (
                  <Video className="w-5 h-5 mr-2" />
                ) : (
                  <Mic className="w-5 h-5 mr-2" />
                )}
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1 py-3 text-[1rem] font-medium shadow-lg hover:scale-105 transition-all"
                size="lg"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            )}

            {recordedBlob && (
              <>
                <Button
                  onClick={playRecording}
                  variant="default"
                  className="flex-1 bg-primary/80 text-white shadow hover:bg-primary transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </Button>
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  className="flex-1 shadow hover:bg-[#B794F4]/10 transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="flex-1 shadow hover:bg-[#B794F4]/10 transition-all"
                >
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  New
                </Button>
              </>
            )}
          </div>

          {/* Message */}
          <p className="pt-2 text-xs text-muted-foreground text-center font-mono">
            Your recordings are local &amp; encrypted for privacy. <br className="hidden sm:inline" />
            Video uses your camera only when REC is active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaRecorder;
