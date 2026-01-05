import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your studies..."
          className="min-h-[52px] max-h-[120px] resize-none pr-4 rounded-xl border-2 border-border bg-card focus:border-primary transition-colors"
          disabled={disabled}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        size="icon"
        className="h-[52px] w-[52px] rounded-xl gradient-hero hover:opacity-90 transition-opacity shadow-medium"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};
