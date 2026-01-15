import { useEffect, useRef } from "react";
import { X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomization } from "@/context/CustomizationContext";

interface SpeakingAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript?: string;
  response?: string;
}

export function SpeakingAvatarModal({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  isProcessing,
  transcript,
  response,
}: SpeakingAvatarModalProps) {
  const { getAvatarUrl, currentTheme } = useCustomization();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Audio visualizer effect
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bars = 20;
    const barWidth = canvas.width / bars;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < bars; i++) {
        const height = isSpeaking || isListening
          ? Math.random() * canvas.height * 0.8 + canvas.height * 0.1
          : canvas.height * 0.1;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, isListening ? "#ef4444" : "#8b5cf6");
        gradient.addColorStop(1, isListening ? "#f87171" : "#a78bfa");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
          i * barWidth + 2,
          canvas.height - height,
          barWidth - 4,
          height
        );
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, isSpeaking, isListening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm mx-4">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Avatar container */}
        <div className="flex flex-col items-center">
          {/* Glowing ring animation */}
          <div className={`relative ${isSpeaking || isListening ? "animate-pulse" : ""}`}>
            {/* Outer glow rings */}
            {(isSpeaking || isListening) && (
              <>
                <div className={`absolute inset-0 rounded-full ${isListening ? "bg-red-500/20" : "bg-primary/20"} blur-xl scale-150 animate-ping`} style={{ animationDuration: "2s" }} />
                <div className={`absolute inset-0 rounded-full ${isListening ? "bg-red-500/30" : "bg-primary/30"} blur-lg scale-125`} />
              </>
            )}
            
            {/* Avatar image */}
            <div className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 ${
              isListening 
                ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]" 
                : isSpeaking 
                  ? "border-primary shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                  : "border-primary/50"
            } transition-all duration-300`}>
              <img
                src={getAvatarUrl()}
                alt={currentTheme.appName}
                className={`w-full h-full object-cover ${isSpeaking ? "animate-subtle-bounce" : ""}`}
              />
              
              {/* Speaking overlay */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              )}
            </div>

            {/* Status indicator */}
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-medium ${
              isListening 
                ? "bg-red-500 text-white" 
                : isSpeaking 
                  ? "bg-primary text-primary-foreground"
                  : isProcessing
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground"
            }`}>
              {isListening ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Slušam...
                </span>
              ) : isSpeaking ? (
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" />
                  Govorim...
                </span>
              ) : isProcessing ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  Razmišljam...
                </span>
              ) : (
                "Spreman"
              )}
            </div>
          </div>

          {/* Audio visualizer */}
          <canvas
            ref={canvasRef}
            width={200}
            height={40}
            className="mt-8 rounded-lg opacity-80"
          />

          {/* Transcript display */}
          {transcript && (
            <div className="mt-6 p-4 bg-white/10 rounded-xl max-w-full">
              <p className="text-xs text-white/50 mb-1">Ti:</p>
              <p className="text-sm text-white/90">{transcript}</p>
            </div>
          )}

          {/* Response display */}
          {response && (
            <div className="mt-3 p-4 bg-primary/20 rounded-xl max-w-full">
              <p className="text-xs text-primary/70 mb-1">{currentTheme.appName}:</p>
              <p className="text-sm text-white/90">{response}</p>
            </div>
          )}

          {/* App name */}
          <p className="mt-6 text-lg font-bold text-white/90">{currentTheme.appName}</p>
          <p className="text-sm text-white/50">{currentTheme.appTagline}</p>
        </div>
      </div>
    </div>
  );
}
