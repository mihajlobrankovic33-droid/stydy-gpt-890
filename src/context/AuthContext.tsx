import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { 
  validateLicense, 
  checkLicenseStatus, 
  isAdminCode,
  type License,
  type AvatarType 
} from "@/lib/licenseService";
import { useCustomization } from "@/context/CustomizationContext";

const AUTH_STORAGE_KEY = 'study-buddy-auth';

interface AuthState {
  isAuthenticated: boolean;
  licenseKey: string | null;
  userName: string | null;
  avatar: AvatarType | null;
  isAdmin: boolean;
  expiryDate: string | null;
  isExpired: boolean;
  isPro: boolean;
}

interface AuthContextType {
  auth: AuthState;
  login: (key: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearMessages: () => void;
  onClearMessages?: () => void;
  setOnClearMessages: (callback: () => void) => void;
  setIsPro: (isPro: boolean) => void;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  licenseKey: null,
  userName: null,
  avatar: null,
  isAdmin: false,
  expiryDate: null,
  isExpired: false,
  isPro: false,
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
    const loadAuth = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.licenseKey) {
            // Verify the key is still valid
            const status = await checkLicenseStatus(parsed.licenseKey);
            if (status.valid) {
              setAuth(parsed);
              if (parsed.avatar) {
                selectTheme(parsed.avatar);
              }
            } else if (status.expired) {
              // Show expired state
              setAuth({
                ...parsed,
                isAuthenticated: true,
                isExpired: true,
              });
            } else {
              // Key invalid, clear storage
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          }
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    };

    loadAuth();
  }, []);

  // Check auth status periodically (kill switch)
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.licenseKey) return;

    const checkInterval = setInterval(async () => {
      const status = await checkLicenseStatus(auth.licenseKey!);
      if (!status.valid) {
        if (status.expired) {
          setAuth(prev => ({ ...prev, isExpired: true }));
        } else {
          logout();
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [auth.isAuthenticated, auth.licenseKey]);

  const login = useCallback(async (key: string): Promise<{ success: boolean; error?: string }> => {
    const result = await validateLicense(key);
    
    if (!result.valid || !result.license) {
      return { success: false, error: result.error };
    }
    
    const license = result.license;
    const newAuth: AuthState = {
      isAuthenticated: true,
      licenseKey: license.unique_code,
      userName: license.user_name,
      avatar: license.avatar as AvatarType,
      isAdmin: isAdminCode(license.unique_code),
      expiryDate: license.expiry_date,
      isExpired: false,
      isPro: false,
    };
    
    setAuth(newAuth);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuth));
    selectTheme(license.avatar as AvatarType);
    
    return { success: true };
  }, [selectTheme]);

  const logout = useCallback(() => {
    setAuth(defaultAuth);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('studygpt-customization-v2');
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!auth.isAuthenticated || !auth.licenseKey) return false;
    const status = await checkLicenseStatus(auth.licenseKey);
    return status.valid;
  }, [auth]);

  const clearMessages = useCallback(() => {
    if (onClearMessagesCallback) {
      onClearMessagesCallback();
    }
  }, [onClearMessagesCallback]);

  const setOnClearMessages = useCallback((callback: () => void) => {
    setOnClearMessagesCallback(() => callback);
  }, []);

  const setIsPro = useCallback((isPro: boolean) => {
    setAuth(prev => {
      const updated = { ...prev, isPro };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      checkAuth, 
      clearMessages,
      setOnClearMessages,
      setIsPro 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
