import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions, ActionType } from "@/components/QuickActions";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { LockScreen } from "@/components/LockScreen";
import { ExpiredScreen } from "@/components/ExpiredScreen";
import { AdminPanel } from "@/components/AdminPanel";
import { PanicButton } from "@/components/PanicButton";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PuskiceSection } from "@/components/PuskiceSection";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, FileText } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileType?: "image" | "pdf" | "sticker";
  fileName?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-chat`;

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { auth, setOnClearMessages } = useAuth();
  const isOnline = useOfflineStatus();

  // Register clear messages callback
  useEffect(() => {
    setOnClearMessages(() => setMessages([]));
  }, [setOnClearMessages]);

  // Anti-tamper: Disable right-click and F12
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Admin panel shortcut: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (auth.isAdmin) {
          setShowAdminPanel(prev => !prev);
        }
        return;
      }

      // Close admin panel with Escape
      if (e.key === 'Escape' && showAdminPanel) {
        setShowAdminPanel(false);
        return;
      }

      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [auth.isAdmin, showAdminPanel]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const streamChat = async (newMessages: Message[], actionType?: ActionType) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, actionType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Oops!",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentAction(null);
    }
  };

  const handleSend = async (content: string, fileUrl?: string, fileType?: "image" | "pdf" | "sticker") => {
    const userMessage: Message = { 
      role: "user", 
      content, 
      imageUrl: fileType === "image" ? fileUrl : undefined,
      fileType 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Don't send stickers to AI, they're just visual
    if (fileType !== "sticker") {
      await streamChat(newMessages, currentAction || undefined);
    }
  };

  const handleQuickAction = async (action: ActionType, prompt: string) => {
    setCurrentAction(action);
    toast({
      title: getActionTitle(action),
      description: action === "exam" 
        ? "I'll give you direct answers! Send a question or photo." 
        : "Tell me what topic you'd like help with!",
    });
  };

  const getActionTitle = (action: ActionType): string => {
    switch (action) {
      case "explain":
        return "📖 Explain Mode";
      case "summary":
        return "📝 Summary Mode";
      case "quiz":
        return "❓ Quiz Mode";
      case "homework":
        return "📚 Homework Help";
      case "exam":
        return "🎓 Exam Mode";
      default:
        return "";
    }
  };

  // Show lock screen if not authenticated
  if (!auth.isAuthenticated) {
    return <LockScreen />;
  }

  // Show expired screen if license expired
  if (auth.isExpired) {
    return <ExpiredScreen userName={auth.userName} />;
  }

  return (
    <div className="relative flex flex-col h-screen bg-background select-none">
      <OfflineIndicator isOnline={isOnline} />
      <CustomizationPanel />
      <Header />
      <PanicButton />
      
      {/* Admin Panel */}
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
      
      {/* Main content with tabs */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 bg-muted/50">
                <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="puskice" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  Puškice
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-4">
                  <WelcomeMessage />
                </div>
              ) : (
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.map((message, index) => (
                      <ChatMessage key={index} message={message} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                      <TypingIndicator />
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="puskice" className="flex-1 mt-0 overflow-auto p-4">
              <PuskiceSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Input area - only show for chat */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
        <div className="max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-4 space-y-2 sm:space-y-4">
          {/* Action indicator */}
          {currentAction && (
            <div className="flex items-center justify-center">
              <div className={`text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-full animate-fade-in ${
                currentAction === "exam" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : "bg-primary/10 text-primary border border-primary/30"
              }`}>
                {getActionTitle(currentAction)}
                <span className="hidden sm:inline"> - {currentAction === "exam" ? "Send question or take a photo" : "Type your topic below"}</span>
              </div>
            </div>
          )}
          
          <QuickActions onAction={handleQuickAction} disabled={isLoading} />
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
