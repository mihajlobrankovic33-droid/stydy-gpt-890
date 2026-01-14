import { useState } from "react";
import { Menu, X, Sun, Moon, User, LogOut, Crown, RefreshCw, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";

interface HamburgerMenuProps {
  onOpenProfile: () => void;
  onOpenProModal: () => void;
  onOpenChatHistory: () => void;
  onClearHistory: () => void;
}

export function HamburgerMenu({ onOpenProfile, onOpenProModal, onOpenChatHistory, onClearHistory }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isPro, isLifetimePro, daysRemaining, signOut } = useSupabaseAuth();
  const { toast } = useToast();

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

  const handleClearHistory = () => {
    setIsOpen(false);
    onClearHistory();
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

            {/* Clear Chat History */}
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <Trash2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Obriši istoriju</span>
            </button>

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
    </>
  );
}
