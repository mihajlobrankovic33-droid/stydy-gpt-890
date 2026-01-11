import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Generate a unique 8-character license key
function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let part1 = "";
  let part2 = "";
  
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `BUM-${part1}-${part2}`;
}

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth, setIsPro } = useAuth();
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    // Check if coming from a successful payment
    const sessionId = searchParams.get("session_id");
    
    if (sessionId || true) { // For simulation, always activate
      // Generate license key
      const newKey = generateLicenseKey();
      setLicenseKey(newKey);
      
      // Activate Pro status
      setIsPro(true);
      setIsActivated(true);
      
      // Store the generated license key
      const proLicenses = JSON.parse(localStorage.getItem("pro-licenses") || "[]");
      proLicenses.push({
        key: newKey,
        activatedAt: new Date().toISOString(),
        plan: searchParams.get("plan") || "lifetime",
      });
      localStorage.setItem("pro-licenses", JSON.stringify(proLicenses));
    }
  }, [searchParams, setIsPro]);

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast({
      title: "Kopirano!",
      description: "Licencni ključ je kopiran u clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    navigate("/");
  };

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2 flex items-center justify-center gap-2">
            Plaćanje Uspješno!
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Tvoj Pro pristup je sada aktivan. Sačuvaj licencni ključ!
          </p>

          {/* License Key Display */}
          <div className="bg-muted/50 border-2 border-dashed border-amber-500/30 rounded-xl p-6 mb-6">
            <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider">
              Tvoj Licencni Ključ
            </p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-xl font-mono font-bold text-amber-400 tracking-wider">
                {licenseKey}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 hover:bg-amber-500/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-200 text-center">
              ⚠️ Sačuvaj ovaj ključ! Trebat će ti za aktivaciju na drugim uređajima.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg shadow-amber-500/25"
          >
            Nastavi sa Pro
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 BUM Systems | Developed by Mihajlo
        </p>
      </div>
    </div>
  );
};

export default Success;
