import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, AlertCircle } from "lucide-react";

interface AdminPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ADMIN_PASSWORD = "MIHAJLO-ADMIN";

export function AdminPasswordModal({ open, onOpenChange, onSuccess }: AdminPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setPassword("");
      setError(false);
      setAttempts(0);
      onSuccess();
      onOpenChange(false);
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg border border-slate-600">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Admin Access
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Unesite administratorsku lozinku
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`text-center text-lg tracking-widest ${
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              autoFocus
            />
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Pogrešna lozinka {attempts > 2 && `(${attempts} pokušaja)`}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!password.trim()}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-5"
          >
            <Shield className="w-4 h-4 mr-2" />
            Pristupi
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          🔒 Samo za ovlašćene administratore
        </p>
      </DialogContent>
    </Dialog>
  );
}
