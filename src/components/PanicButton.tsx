import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const PanicButton = () => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { logout, clearMessages } = useAuth();
  const { toast } = useToast();

  const HOLD_DURATION = 5000; // 5 seconds
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  const startHold = useCallback(() => {
    setIsHolding(true);
    setHoldProgress(0);

    // Progress animation
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += (100 / (HOLD_DURATION / PROGRESS_INTERVAL));
      setHoldProgress(Math.min(progress, 100));
    }, PROGRESS_INTERVAL);

    // Logout after 5 seconds
    holdTimerRef.current = setTimeout(() => {
      logout();
      toast({
        title: "Odjavljeni ste",
        description: "Sesija je zatvorena.",
      });
    }, HOLD_DURATION);
  }, [logout, toast]);

  const endHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  const handleClick = useCallback(() => {
    // Only clear messages on quick tap (not hold)
    if (!isHolding && holdProgress === 0) {
      clearMessages();
      toast({
        title: "Chat obrisan",
        description: "Svi razgovori su uklonjeni.",
      });
    }
  }, [isHolding, holdProgress, clearMessages, toast]);

  return (
    <button
      onClick={handleClick}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      className="fixed top-3 right-3 z-40 w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition-all"
      style={{
        background: isHolding 
          ? `conic-gradient(from 0deg, rgb(239 68 68 / 0.5) ${holdProgress}%, rgb(15 23 42 / 0.8) ${holdProgress}%)`
          : undefined,
      }}
      title="Tap: Obriši chat | Drži 5s: Odjavi se"
    >
      <X className="w-4 h-4" />
    </button>
  );
};
