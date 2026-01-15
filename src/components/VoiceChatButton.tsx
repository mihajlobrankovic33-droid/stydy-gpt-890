import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { useLanguage, Language } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SpeakingAvatarModal } from "./SpeakingAvatarModal";

interface VoiceChatButtonProps {
  onTranscript: (text: string) => void;
  onAIResponse?: (text: string) => void;
  disabled?: boolean;
}

// Language code mapping for speech recognition
const speechLangCodes: Record<Language, string> = {
  sr: "sr-RS",
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ar: "ar-SA",
};

// ElevenLabs voice IDs for different languages
// Type for SpeechRecognition
type SpeechRecognitionType = typeof window.SpeechRecognition;

const voiceIds: Record<Language, string> = {
  sr: "onwK4e9ZLuTAKqWW03F9", // Daniel - good for Slavic
  en: "JBFqnCBsd6RMkjVDRZzb", // George
  de: "onwK4e9ZLuTAKqWW03F9", // Daniel
  fr: "FGY2WhTYpPnrIDTdsKH5", // Laura
  es: "EXAVITQu4vr4xnSDxMaL", // Sarah
  it: "FGY2WhTYpPnrIDTdsKH5", // Laura
  ru: "onwK4e9ZLuTAKqWW03F9", // Daniel
  zh: "Xb7hH8MSUJpSbSDYk0k2", // Alice
  ja: "Xb7hH8MSUJpSbSDYk0k2", // Alice
  ar: "onwK4e9ZLuTAKqWW03F9", // Daniel
};

export function VoiceChatButton({ onTranscript, onAIResponse, disabled }: VoiceChatButtonProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakResponse = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId: voiceIds[language],
            language,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Close modal after speaking ends
        setTimeout(() => {
          setIsModalOpen(false);
          setCurrentTranscript("");
          setCurrentResponse("");
        }, 1500);
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: t.error,
        description: "Speech recognition not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    // Open modal and reset state
    setIsModalOpen(true);
    setCurrentTranscript("");
    setCurrentResponse("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = speechLangCodes[language];
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessing(true);
      setCurrentTranscript(transcript);
      
      // Send transcript to parent
      onTranscript(transcript);
      
      // Get AI response and speak it
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              message: transcript,
              language,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            setCurrentResponse(data.response);
            onAIResponse?.(data.response);
            await speakResponse(data.response);
          }
        }
      } catch (error) {
        console.error("Voice chat error:", error);
        setIsModalOpen(false);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setIsProcessing(false);
      setIsModalOpen(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onTranscript, onAIResponse, speakResponse, t.error, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCloseModal = () => {
    stopListening();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsModalOpen(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setCurrentTranscript("");
    setCurrentResponse("");
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`h-11 w-11 sm:h-[52px] sm:w-[52px] rounded-xl border-2 transition-all flex-shrink-0 ${
          isListening
            ? "border-red-500 bg-red-500/10 animate-pulse"
            : isSpeaking
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }`}
        title={isListening ? t.stopListening : t.tapToSpeak}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin" />
        ) : isSpeaking ? (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        ) : isListening ? (
          <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
        ) : (
          <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        )}
      </Button>

      <SpeakingAvatarModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isProcessing={isProcessing}
        transcript={currentTranscript}
        response={currentResponse}
      />
    </>
  );
}

// Add type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
