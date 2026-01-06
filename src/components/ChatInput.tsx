import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Camera, Image, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || imageBase64) && !disabled) {
      onSend(input.trim() || "What's in this image?", imageBase64 || undefined);
      setInput("");
      setImagePreview(null);
      setImageBase64(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = "";
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
  };

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Selected"
            className="h-20 w-auto rounded-lg border-2 border-primary/20 shadow-soft"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Camera Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => cameraInputRef.current?.click()}
          disabled={disabled}
          className="h-[52px] w-[52px] rounded-xl border-2 border-border hover:border-primary/50 transition-colors"
          title="Take Photo"
        >
          <Camera className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Gallery Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => galleryInputRef.current?.click()}
          disabled={disabled}
          className="h-[52px] w-[52px] rounded-xl border-2 border-border hover:border-primary/50 transition-colors"
          title="Choose from Gallery"
        >
          <Image className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageBase64 ? "Ask about this image..." : "Ask me anything about your studies..."}
            className="min-h-[52px] max-h-[120px] resize-none pr-4 rounded-xl border-2 border-border bg-card focus:border-primary transition-colors"
            disabled={disabled}
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={(!input.trim() && !imageBase64) || disabled}
          size="icon"
          className="h-[52px] w-[52px] rounded-xl gradient-hero hover:opacity-90 transition-opacity shadow-medium"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
