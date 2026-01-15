import { useState, useRef, useCallback, useEffect } from "react";
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
type SpeechRecognitionType = typeof window.SpeechRecognition;

const voiceIds: Record<Language, string> = {
  sr: "onwK4e9ZLuTAKqWW03F9", // Daniel
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unlockAudio = useCallback(async () => {
    // Helps iOS/Safari allow later audio playback after a user gesture
    try {
      if (!audioContextRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
        if (Ctx) audioContextRef.current = new Ctx();
      }
      await audioContextRef.current?.resume();
    } catch {
      // ignore
    }
  }, []);

  const speakResponse = useCallback(
    async (text: string) => {
      try {
        setIsSpeaking(true);

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
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
        });

        if (!res.ok) throw new Error("TTS failed");

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) audioRef.current.pause();

        const audio = new Audio(audioUrl);
        // @ts-expect-error - playsInline exists on iOS
        audio.playsInline = true;
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          setTimeout(() => {
            setIsModalOpen(false);
            setCurrentTranscript("");
            setCurrentResponse("");
          }, 800);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (error) {
        console.error("TTS error:", error);
        setIsSpeaking(false);
        toast({
          title: t.error,
          description: "Audio playback failed. Please try again.",
          variant: "destructive",
        });
      }
    },
    [language, t.error, toast],
  );

  const processTranscript = useCallback(
    async (transcript: string) => {
      setIsProcessing(true);
      setCurrentTranscript(transcript);
      onTranscript(transcript);

      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ message: transcript, language }),
        });

        if (!res.ok) throw new Error("Voice chat failed");

        const data = await res.json();
        const answer = data.response as string | undefined;
        if (answer) {
          setCurrentResponse(answer);
          onAIResponse?.(answer);
          await speakResponse(answer);
        }
      } catch (error) {
        console.error("Voice chat error:", error);
        toast({
          title: t.error,
          description: "Voice chat failed. Please try again.",
          variant: "destructive",
        });
        setIsModalOpen(false);
      } finally {
        setIsProcessing(false);
      }
    },
    [language, onTranscript, onAIResponse, speakResponse, t.error, toast],
  );

  const transcribeRecordedAudio = useCallback(
    async (blob: Blob) => {
      const form = new FormData();
      // Most browsers record webm/ogg; ElevenLabs accepts common audio containers
      form.append("audio", blob, "recording.webm");
      form.append("language", language);

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-transcribe`, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Transcription failed");
      }

      const data = await res.json();
      return (data.text as string | undefined) || "";
    },
    [language],
  );

  const stopListening = useCallback(() => {
    // Stop Web Speech API
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    // Stop MediaRecorder fallback
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    await unlockAudio();

    const supportsSpeechRecognition = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

    // Prefer Web Speech API when available
    if (supportsSpeechRecognition) {
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
        await processTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setIsProcessing(false);
        toast({
          title: t.error,
          description: "Speech recognition failed on this device. Using recording mode instead.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error("Recognition start failed:", e);
      }
      return;
    }

    // Fallback for iOS/Safari: record audio and transcribe server-side
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstart = () => {
        setIsListening(true);
      };

      recorder.onstop = async () => {
        setIsListening(false);

        // stop tracks
        try {
          mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        } catch {
          // ignore
        }
        mediaStreamRef.current = null;

        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recordedChunksRef.current = [];

        if (blob.size < 1000) {
          toast({
            title: t.error,
            description: "No audio captured. Try again.",
            variant: "destructive",
          });
          setIsModalOpen(false);
          return;
        }

        setIsProcessing(true);
        try {
          const transcript = await transcribeRecordedAudio(blob);
          if (!transcript.trim()) {
            throw new Error("Empty transcript");
          }
          await processTranscript(transcript);
        } catch (err) {
          console.error("Transcription error:", err);
          toast({
            title: t.error,
            description: "Could not transcribe audio. Please try again.",
            variant: "destructive",
          });
          setIsModalOpen(false);
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();

      // Auto stop after 8s (so one tap works even without pressing stop)
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            // ignore
          }
        }
      }, 8000);
    } catch (err) {
      console.error("Mic permission error:", err);
      toast({
        title: t.error,
        description: "Microphone permission is required.",
        variant: "destructive",
      });
      setIsModalOpen(false);
    }
  }, [language, processTranscript, t.error, toast, transcribeRecordedAudio, unlockAudio]);

  const handleClick = () => {
    console.log("[VoiceChat] click");

    // Open modal immediately
    setIsModalOpen(true);
    setCurrentTranscript("");
    setCurrentResponse("");

    if (isListening) {
      stopListening();
      return;
    }

    void startListening();
  };

  const handleCloseModal = () => {
    stopListening();
    if (audioRef.current) audioRef.current.pause();

    // stop tracks if any
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    mediaStreamRef.current = null;

    setIsModalOpen(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setCurrentTranscript("");
    setCurrentResponse("");
  };

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }

      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }

      try {
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }

      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

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
