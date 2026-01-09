import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, KeyRound } from "lucide-react";

export const LockScreen = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = login(key.trim());
    
    if (!result.success) {
      setError(result.error || "Greška pri prijavljivanju.");
      setKey("");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-80" />
      
      {/* Lock screen content */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-200 mb-2">Study Buddy</h1>
          <p className="text-sm text-slate-500">Privatni pristup</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="Unesite licencni ključ"
              className="pl-10 bg-slate-900/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600 focus:border-slate-600 focus:ring-slate-600"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="text-center">
              <p className="text-sm text-red-400 animate-fade-in">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={!key.trim() || isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50"
          >
            {isLoading ? "Proveravam..." : "Pristupi"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-8">
          Samo za ovlašćene korisnike
        </p>
      </div>
    </div>
  );
};
