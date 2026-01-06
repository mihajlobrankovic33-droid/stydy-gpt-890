import { cn } from "@/lib/utils";
import { useCustomization } from "@/context/CustomizationContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { getAvatarUrl } = useCustomization();
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
          <span className="text-sm font-bold">You</span>
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-glow border-2 border-primary/20">
          <img 
            src={getAvatarUrl()} 
            alt="StudyGPT" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md border border-border"
        )}
      >
        {/* Show image if present */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Shared"
              className="max-w-full max-h-48 rounded-lg"
            />
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
};

export const TypingIndicator = () => {
  const { getAvatarUrl } = useCustomization();

  return (
    <div className="flex gap-3 animate-message-in">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-glow border-2 border-primary/20">
        <img 
          src={getAvatarUrl()} 
          alt="StudyGPT" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: "0s" }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: "0.2s" }} />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
};
