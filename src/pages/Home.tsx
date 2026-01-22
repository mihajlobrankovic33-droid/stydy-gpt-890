import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChatMessage, TypingIndicator } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { QuickActions, ActionType } from "@/components/QuickActions";
import { WelcomeMessage } from "@/components/WelcomeMessage";

import { AdminPanel } from "@/components/AdminPanel";
import { AdminPasswordModal } from "@/components/AdminPasswordModal";

import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PuskiceSection } from "@/components/PuskiceSection";
import { DirectChat } from "@/components/DirectChat";
import { AuthScreen } from "@/components/AuthScreen";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { ProfileSettings } from "@/components/ProfileSettings";
import { ChatHistoryModal, detectSubject, generateTitle } from "@/components/ChatHistoryModal";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle, FileText, Users } from "lucide-react";
import { InstallPWAButton } from "@/components/InstallPWAButton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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
  const [activeTab, setActiveTab] = useState<"chat" | "puskice" | "messages">("chat");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(() => {
    return localStorage.getItem('custom_system_prompt') || '';
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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

  // Auto-scroll to bottom on new messages (robust for streaming + mobile)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => cancelAnimationFrame(id);
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
        body: JSON.stringify({ messages: newMessages, actionType, customSystemPrompt }),
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

  // Save session to database
  const saveSession = async (msgs: Message[]) => {
    if (!user || msgs.length === 0) return;

    const simplifiedMessages = msgs.map(m => ({ role: m.role, content: m.content }));
    const title = generateTitle(simplifiedMessages);
    const subject = detectSubject(simplifiedMessages);

    try {
      if (currentSessionId) {
        // Update existing session
        await supabase
          .from('chat_sessions')
          .update({
            messages: simplifiedMessages,
            title,
            subject,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSessionId);
      } else {
        // Create new session
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: user.id,
            messages: simplifiedMessages,
            title,
            subject
          })
          .select('id')
          .single();

        if (!error && data) {
          setCurrentSessionId(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving session:', error);
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

  // Save session when messages change (debounced effect)
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const timeout = setTimeout(() => {
        saveSession(messages);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [messages, isLoading]);

  const handleLoadSession = (loadedMessages: Array<{ role: "user" | "assistant"; content: string }>, sessionId: string) => {
    setMessages(loadedMessages);
    setCurrentSessionId(sessionId);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
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
      <Header />
      
      {/* Top right: Install + Hamburger only */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <InstallPWAButton />
        <HamburgerMenu
          onOpenProfile={() => setShowProfileSettings(true)}
          onOpenProModal={() => setShowProModal(true)}
          onOpenChatHistory={() => setShowChatHistory(true)}
          onClearHistory={handleNewChat}
          customSystemPrompt={customSystemPrompt}
          onCustomSystemPromptChange={(prompt) => {
            setCustomSystemPrompt(prompt);
            localStorage.setItem('custom_system_prompt', prompt);
          }}
        />
      </div>
      
      {/* Profile Settings Modal */}
      <ProfileSettings isOpen={showProfileSettings} onClose={() => setShowProfileSettings(false)} />
      
      {/* Chat History Modal */}
      <ChatHistoryModal 
        open={showChatHistory}
        onOpenChange={setShowChatHistory}
        onLoadSession={handleLoadSession}
        onNewChat={handleNewChat}
        currentSessionId={currentSessionId}
      />
      
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
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {/* Tab Navigation */}
        <div className="px-4 pt-2 flex-shrink-0">
          <div className="grid w-full max-w-md mx-auto grid-cols-3 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "chat" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">AI </span>Chat
            </button>
            <button
              onClick={() => setActiveTab("puskice")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "puskice" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-4 h-4" />
              Puškice
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "messages" 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              Poruke
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl mx-auto">
                  <WelcomeMessage />
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 min-h-0" ref={scrollRef}>
                <div className="w-full max-w-4xl mx-auto space-y-4 p-4 pb-6">
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <TypingIndicator />
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            )}

            {/* Input area - fixed at bottom, never covers content */}
            <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
              <div className="max-w-4xl mx-auto px-2 py-2 sm:px-4 sm:py-3 space-y-2 sm:space-y-3">
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
        )}

        {activeTab === "puskice" && (
          <div className="flex-1 overflow-auto p-4">
            <PuskiceSection />
          </div>
        )}

        {activeTab === "messages" && (
          <div className="flex-1 min-h-0 overflow-hidden p-4">
            <DirectChat />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
