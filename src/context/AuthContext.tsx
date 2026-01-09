import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  validateLicenseKey, 
  isLicenseActive, 
  registerDevice, 
  isAdminKey,
  type DeviceEntry,
  type AvatarType 
} from "@/lib/deviceRegistry";
import { useCustomization } from "@/context/CustomizationContext";

const AUTH_STORAGE_KEY = 'study-buddy-auth';

interface AuthState {
  isAuthenticated: boolean;
  licenseKey: string | null;
  userName: string | null;
  avatar: AvatarType | null;
  isAdmin: boolean;
}

interface AuthContextType {
  auth: AuthState;
  login: (key: string) => { success: boolean; error?: string };
  logout: () => void;
  checkAuth: () => boolean;
  clearMessages: () => void;
  onClearMessages?: () => void;
  setOnClearMessages: (callback: () => void) => void;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  licenseKey: null,
  userName: null,
  avatar: null,
  isAdmin: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);
  const [onClearMessagesCallback, setOnClearMessagesCallback] = useState<(() => void) | undefined>();
  const { selectTheme } = useCustomization();

  // Load auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify the key is still active
        if (parsed.licenseKey && isLicenseActive(parsed.licenseKey)) {
          setAuth(parsed);
          if (parsed.avatar) {
            selectTheme(parsed.avatar);
          }
          registerDevice(parsed.licenseKey);
        } else {
          // Key expired or invalid, clear storage
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Check auth status periodically (kill switch)
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.licenseKey) return;

    const checkInterval = setInterval(() => {
      if (!isLicenseActive(auth.licenseKey!)) {
        logout();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInterval);
  }, [auth.isAuthenticated, auth.licenseKey]);

  const login = useCallback((key: string): { success: boolean; error?: string } => {
    const entry = validateLicenseKey(key);
    
    if (!entry) {
      return { success: false, error: "Neispravan licencni ključ." };
    }
    
    if (entry.status === 'expired') {
      return { success: false, error: "Pristup je istekao. Kontaktiraj admina." };
    }
    
    const newAuth: AuthState = {
      isAuthenticated: true,
      licenseKey: entry.key,
      userName: entry.name,
      avatar: entry.avatar,
      isAdmin: isAdminKey(entry.key),
    };
    
    setAuth(newAuth);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuth));
    selectTheme(entry.avatar);
    registerDevice(entry.key);
    
    return { success: true };
  }, [selectTheme]);

  const logout = useCallback(() => {
    setAuth(defaultAuth);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('studygpt-customization-v2');
  }, []);

  const checkAuth = useCallback((): boolean => {
    if (!auth.isAuthenticated || !auth.licenseKey) return false;
    return isLicenseActive(auth.licenseKey);
  }, [auth]);

  const clearMessages = useCallback(() => {
    if (onClearMessagesCallback) {
      onClearMessagesCallback();
    }
  }, [onClearMessagesCallback]);

  const setOnClearMessages = useCallback((callback: () => void) => {
    setOnClearMessagesCallback(() => callback);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      checkAuth, 
      clearMessages,
      setOnClearMessages 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
