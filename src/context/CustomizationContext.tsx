import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import rabbitAvatar from "@/assets/rabbit-avatar.png";

export interface CustomizationSettings {
  backgroundColor: string;
  backgroundGradient: string | null;
  customAvatarUrl: string | null;
}

interface CustomizationContextType {
  settings: CustomizationSettings;
  updateBackground: (color: string, gradient?: string | null) => void;
  updateAvatar: (url: string | null) => void;
  resetToDefault: () => void;
  getAvatarUrl: () => string;
}

const defaultSettings: CustomizationSettings = {
  backgroundColor: "40 33% 98%",
  backgroundGradient: null,
  customAvatarUrl: null,
};

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error("useCustomization must be used within CustomizationProvider");
  }
  return context;
};

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<CustomizationSettings>(() => {
    const saved = localStorage.getItem("studygpt-customization");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("studygpt-customization", JSON.stringify(settings));
    
    // Apply background
    document.documentElement.style.setProperty("--background", settings.backgroundColor);
    
    if (settings.backgroundGradient) {
      document.body.style.background = settings.backgroundGradient;
    } else {
      document.body.style.background = "";
    }
  }, [settings]);

  const updateBackground = (color: string, gradient?: string | null) => {
    setSettings((prev) => ({
      ...prev,
      backgroundColor: color,
      backgroundGradient: gradient ?? null,
    }));
  };

  const updateAvatar = (url: string | null) => {
    setSettings((prev) => ({
      ...prev,
      customAvatarUrl: url,
    }));
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
  };

  const getAvatarUrl = () => {
    return settings.customAvatarUrl || rabbitAvatar;
  };

  return (
    <CustomizationContext.Provider
      value={{ settings, updateBackground, updateAvatar, resetToDefault, getAvatarUrl }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};
