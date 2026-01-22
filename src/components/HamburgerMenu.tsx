import { useState } from "react";
import { Menu, X, Sun, Moon, User, LogOut, Crown, RefreshCw, History, Trash2, Shield, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useLanguage, languageNames, Language } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { ProCodesAdmin } from "@/components/ProCodesAdmin";

const ADMIN_PASSWORD = "MIHE26";

interface HamburgerMenuProps {
  onOpenProfile: () => void;
  onOpenProModal: () => void;
  onOpenChatHistory: () => void;
  onClearHistory: () => void;
}

export function HamburgerMenu({ onOpenProfile, onOpenProModal, onOpenChatHistory, onClearHistory }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showProCodesAdmin, setShowProCodesAdmin] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isPro, isLifetimePro, daysRemaining, signOut } = useSupabaseAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleCheckForUpdates = async () => {
    setIsOpen(false);
    toast({ title: t.checkingUpdates, description: t.pleaseWait });

    try {
      const registrations = await navigator.serviceWorker?.getRegistrations();
      if (registrations && registrations.length > 0) {
        await Promise.all(registrations.map((r) => r.update()));
      }
      await new Promise((r) => setTimeout(r, 600));
      window.location.reload();
    } catch {
      toast({
        title: t.error,
        description: t.cannotCheckUpdate,
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


  const handleAdminLogin = () => {
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setShowAdminLogin(false);
      setAdminPasswordInput("");
      setAdminError("");
      setIsOpen(false);
      setShowProCodesAdmin(true);
    } else {
      setAdminError(t.wrongPassword);
    }
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguages(false);
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
            <h2 className="text-lg font-bold text-foreground">{t.menu}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
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
                  {isLifetimePro ? t.lifetimePro : `Pro (${daysRemaining} ${t.days})`}
                </span>
              </div>
            ) : (
              <button
                onClick={handleOpenProModal}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-left hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
              >
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">{t.upgradeToPro}</span>
              </button>
            )}

            {/* Languages Section */}
            {!showLanguages ? (
              <button
                onClick={() => setShowLanguages(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{t.languages}</span>
                <span className="ml-auto text-xs text-muted-foreground">{languageNames[language]}</span>
              </button>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{t.languages}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLanguages(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleSelectLanguage(lang)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        language === lang
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      <span>{languageNames[lang]}</span>
                      {language === lang && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
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
                {theme === "dark" ? t.lightMode : t.darkMode}
              </span>
            </button>

            {/* Profile / Avatar */}
            <button
              onClick={handleOpenProfile}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <User className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.editProfile}</span>
            </button>

            {/* Chat History */}
            <button
              onClick={handleOpenChatHistory}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <History className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.chatHistory}</span>
            </button>

            {/* Clear Chat History */}
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <Trash2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.clearHistory}</span>
            </button>

            {/* Check for Updates */}
            <button
              onClick={handleCheckForUpdates}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t.checkUpdates}</span>
            </button>

            {/* Admin Login */}
            {!showAdminLogin ? (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
              >
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t.admin}</span>
              </button>
            ) : (
              <div className="px-4 py-3 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{t.admin}</span>
                </div>
                <Input
                  type="password"
                  placeholder={t.password}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                  className="text-center"
                />
                {adminError && (
                  <p className="text-xs text-destructive text-center">{adminError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminPasswordInput("");
                      setAdminError("");
                    }}
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                  <Button size="sm" onClick={handleAdminLogin} className="flex-1">
                    {t.enter}
                  </Button>
                </div>
              </div>
            )}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-left hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">{t.signOut}</span>
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

      {/* Pro Codes Admin Panel */}
      <ProCodesAdmin
        isOpen={showProCodesAdmin}
        onClose={() => setShowProCodesAdmin(false)}
        adminPassword={ADMIN_PASSWORD}
      />
    </>
  );
}
