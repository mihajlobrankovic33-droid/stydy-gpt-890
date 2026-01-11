import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, KeyRound, Loader2 } from "lucide-react";

export const LockScreen = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(key.trim());
    
    if (!result.success) {
      setError(result.error || "Greška pri prijavljivanju.");
      setKey("");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-black to-accent/5" />
      
      {/* Lock screen content */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-6 shadow-[0_0_40px_hsl(174,100%,50%,0.15)]">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Study Buddy</h1>
          <p className="text-sm text-muted-foreground">Premium pristup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="Unesite licencni ključ"
              className="pl-12 h-14 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-center text-lg tracking-widest font-mono"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive animate-fade-in">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!key.trim() || isLoading}
            className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold text-lg rounded-xl shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Proveravam...
              </>
            ) : (
              "Pristupi"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground/50 mt-8">
          Premium korisnici imaju neograničen pristup
        </p>
      </div>
    </div>
  );
};
