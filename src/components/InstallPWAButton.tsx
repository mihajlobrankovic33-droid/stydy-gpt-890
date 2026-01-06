import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
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
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Show install button if installable, or show a hint for iOS/unsupported browsers
  if (!isInstallable) {
    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => {
            alert("To install: tap the Share button, then 'Add to Home Screen'");
          }}
        >
          <Smartphone className="h-4 w-4" />
          Install App
        </Button>
      );
    }
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      size="sm"
      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  );
};
