import { useCustomization } from "@/context/CustomizationContext";
import { InstallPWAButton } from "@/components/InstallPWAButton";

export const Header = () => {
  const { getAvatarUrl, currentTheme } = useCustomization();

  // Split app name to highlight last part
  const appName = currentTheme.appName;
  const splitIndex = appName.length > 5 ? appName.length - 2 : Math.floor(appName.length / 2);
  const firstPart = appName.slice(0, splitIndex);
  const secondPart = appName.slice(splitIndex);

  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-glow border-2 border-primary/20">
                <img 
                  src={getAvatarUrl()} 
                  alt={`${currentTheme.appName} Avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {firstPart}<span className="text-primary">{secondPart}</span>
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {currentTheme.appTagline}
              </p>
            </div>
          </div>
          <InstallPWAButton />
        </div>
      </div>
    </header>
  );
};
