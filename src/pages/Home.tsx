import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions, ActionType } from "@/components/QuickActions";
import { WelcomeMessage } from "@/components/WelcomeMessage";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminPasswordModal } from "@/components/AdminPasswordModal";
import { PanicButton } from "@/components/PanicButton";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PuskiceSection } from "@/components/PuskiceSection";
import { AuthScreen } from "@/components/AuthScreen";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";
import { ProfileSettings } from "@/components/ProfileSettings";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, FileText, Crown, LogOut, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  fileType?: "image" | "pdf" | "sticker";
  fileName?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-chat`;

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "puskice">("chat");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading, isPro, isLifetimePro, daysRemaining, signOut } = useSupabaseAuth();
  const isOnline = useOfflineStatus();

  // Anti-tamper: Disable right-click and F12
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Admin panel shortcut: Ctrl+A (secret shortcut)
      if (e.ctrlKey && !e.shiftKey && !e.metaKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminAuthenticated) {
          setShowAdminPanel(prev => !prev);
        } else {
          setShowAdminPassword(true);
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
  }, [isAdminAuthenticated, showAdminPanel]);

  const handleAdminPasswordSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminPanel(true);
  };

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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="relative flex flex-col h-screen bg-background select-none">
      <OfflineIndicator isOnline={isOnline} />
      <CustomizationPanel />
      <Header />
      <PanicButton />
      
      {/* Pro Status Badge */}
      <div className="absolute top-4 right-16 z-40 flex items-center gap-2">
        {isPro ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              {isLifetimePro ? "Lifetime Pro" : `Pro (${daysRemaining} dana)`}
            </span>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProModal(true)}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          >
            <Crown className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowProfileSettings(true)}
          className="text-muted-foreground hover:text-foreground"
          title="Uredi profil"
        >
          <User className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground"
          title="Odjavi se"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Profile Settings Modal */}
      <ProfileSettings isOpen={showProfileSettings} onClose={() => setShowProfileSettings(false)} />
      
      {/* Pro Upgrade Modal */}
      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
      
      {/* Admin Password Modal */}
      <AdminPasswordModal 
        open={showAdminPassword} 
        onOpenChange={setShowAdminPassword}
        onSuccess={handleAdminPasswordSuccess}
      />
      
      {/* Admin Panel */}
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
      
      {/* Main content with tabs */}
      <div className="flex-1 overflow-hidden">
        <div className={`${activeTab === "puskice" ? "w-full" : "max-w-4xl mx-auto"} h-full flex flex-col`}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "puskice")} className="flex-1 flex flex-col">
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
            </TabsContent>

            <TabsContent value="puskice" className="flex-1 mt-0 overflow-auto p-4 pb-8">
              <PuskiceSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <span className="text-[10px] font-medium text-muted-foreground/60 tracking-wide">
          © 2026 BUM Systems | Developed by Mihajlo
        </span>
      </div>
    </div>
  );
};

export default Home;
