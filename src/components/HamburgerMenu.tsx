import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, User, LogOut, Crown, RefreshCw, History, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface HamburgerMenuProps {
  onOpenProfile: () => void;
  onOpenProModal: () => void;
  onOpenChatHistory: () => void;
}

export function HamburgerMenu({ onOpenProfile, onOpenProModal, onOpenChatHistory }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isPro, isLifetimePro, daysRemaining, signOut } = useSupabaseAuth();
  const { toast } = useToast();

  // Check if on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    
    // Check iOS standalone mode
    if ((navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSDialog(true);
      return;
    }
    
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsOpen(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setIsOpen(false);
    toast({ title: "Provera ažuriranja…", description: "Molimo sačekaj." });

    try {
      const registrations = await navigator.serviceWorker?.getRegistrations();
      if (registrations && registrations.length > 0) {
        await Promise.all(registrations.map((r) => r.update()));
      }
      await new Promise((r) => setTimeout(r, 600));
      window.location.reload();
    } catch {
      toast({
        title: "Greška",
        description: "Nije moguće proveriti ažuriranje.",
        variant: "destructive",
      });
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    // Keep menu open so user sees the change
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  const handleOpenProfile = () => {
    setIsOpen(false);
    onOpenProfile();
  };

  const handleOpenProModal = () => {
    setIsOpen(false);
    onOpenProModal();
  };

  const handleOpenChatHistory = () => {
    setIsOpen(false);
    onOpenChatHistory();
  };

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-9 w-9 rounded-lg hover:bg-muted border border-transparent hover:border-border"
        aria-label="Otvori meni"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Fullscreen Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Meni</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Zatvori meni"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Pro Status */}
            {isPro ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">
                  {isLifetimePro ? "Lifetime Pro" : `Pro (${daysRemaining} dana)`}
                </span>
              </div>
            ) : (
              <button
                onClick={handleOpenProModal}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-left hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
              >
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Nadogradi na Pro</span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
              <span className="text-sm font-medium text-foreground">
                {theme === "dark" ? "Svetli režim" : "Tamni režim"}
              </span>
            </button>

            {/* Profile / Avatar */}
            <button
              onClick={handleOpenProfile}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <User className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Uredi profil / Avatar</span>
            </button>

            {/* Chat History */}
            <button
              onClick={handleOpenChatHistory}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <History className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Istorija ćeta</span>
            </button>

            {/* Install App - show only if not installed */}
            {!isInstalled && (isInstallable || isIOS) && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-left hover:bg-primary/20 transition-colors"
              >
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Instaliraj aplikaciju</span>
              </button>
            )}

            {/* Check for Updates */}
            <button
              onClick={handleCheckForUpdates}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Proveri ažuriranje</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-left hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Odjavi se</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-border text-center">
            <span className="text-[10px] text-muted-foreground">
              © 2026 BUM Systems | Developed by Mihajlo
            </span>
          </div>
        </div>
      )}

      {/* iOS Install Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Instaliraj aplikaciju</DialogTitle>
            <DialogDescription className="text-center">
              Dodaj aplikaciju na početni ekran
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4 p-3 bg-muted rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Pritisni dugme Share</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Na dnu Safari-ja, pritisni <Share className="h-4 w-4 inline" />
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-muted rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Izaberi "Add to Home Screen"</p>
                <p className="text-sm text-muted-foreground">
                  Skroluj dole i pronađi ovu opciju
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-muted rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Pritisni "Add"</p>
                <p className="text-sm text-muted-foreground">
                  Aplikacija će se pojaviti na početnom ekranu!
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Nakon instalacije, otvori aplikaciju sa ikonice - nema više pretraživača! 📱
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
