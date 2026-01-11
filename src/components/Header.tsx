import { useState } from "react";
import { useCustomization } from "@/context/CustomizationContext";
import { InstallPWAButton } from "@/components/InstallPWAButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UnlockProModal } from "@/components/UnlockProModal";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { getAvatarUrl, currentTheme } = useCustomization();
  const [showProModal, setShowProModal] = useState(false);

  // Split app name to highlight last part
  const appName = currentTheme.appName;
  const splitIndex = appName.length > 5 ? appName.length - 2 : Math.floor(appName.length / 2);
  const firstPart = appName.slice(0, splitIndex);
  const secondPart = appName.slice(splitIndex);

  return (
    <>
      <header className="bg-card border-b border-border shadow-soft">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-glow border-2 border-primary/20">
                  <img 
                    src={getAvatarUrl()} 
                    alt={`${currentTheme.appName} Avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {firstPart}<span className="text-primary">{secondPart}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden xs:block">
                  {currentTheme.appTagline}
                </p>
              </div>
              {/* PRO Button */}
              <Button
                onClick={() => setShowProModal(true)}
                size="sm"
                className="ml-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:via-yellow-500 hover:to-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 border-0 px-3"
              >
                <Crown className="w-4 h-4 mr-1" />
                PRO
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <InstallPWAButton />
            </div>
          </div>
        </div>
      </header>

      {/* Pro Modal */}
      <UnlockProModal open={showProModal} onOpenChange={setShowProModal} />
    </>
  );
};
