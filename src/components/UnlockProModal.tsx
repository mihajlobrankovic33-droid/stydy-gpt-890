import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Crown, Sparkles, Zap, Shield, Palette, Headphones, CreditCard, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface UnlockProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const benefits = [
  { icon: Zap, text: "Unlimited 'puskice' (no daily limits)" },
  { icon: Palette, text: "Exclusive Dark Mode & Custom Themes" },
  { icon: Headphones, text: "Priority Support" },
];

const pricingPlans = [
  {
    name: "Mjesečno",
    price: "350",
    period: "mjesec",
    highlight: false,
  },
  {
    name: "Godišnje",
    price: "1,200",
    period: "godina",
    highlight: false,
    savings: "Uštedi 71%",
  },
  {
    name: "Lifetime",
    price: "2,600",
    period: "zauvijek",
    highlight: true,
    badge: "Najbolja vrijednost",
  },
];

type ModalView = "plans" | "payment" | "processing" | "success";

export function UnlockProModal({ open, onOpenChange }: UnlockProModalProps) {
  const { setIsPro } = useAuth();
  const [view, setView] = useState<ModalView>("plans");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const handleClose = () => {
    setView("plans");
    setSelectedPlan(null);
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardHolder("");
    onOpenChange(false);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    return cleaned;
  };

  const handlePayNow = () => {
    setView("processing");
    setTimeout(() => {
      setIsPro(true);
      setView("success");
    }, 2000);
  };

  const isFormValid = cardNumber.replace(/\s/g, "").length === 16 && 
                      expiryDate.length === 5 && 
                      cvv.length >= 3 && 
                      cardHolder.trim().length > 0;

  // Success View
  if (view === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25 mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              Pro Features Unlocked. 🎉
            </p>
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold px-8"
            >
              Nastavi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Processing View
  if (view === "processing") {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Obrađujem plaćanje...
            </h2>
            <p className="text-muted-foreground">
              Molimo sačekajte
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment Form View
  if (view === "payment") {
    const plan = pricingPlans.find(p => p.name === selectedPlan);
    
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("plans")}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Plaćanje karticom
                </DialogTitle>
                {plan && (
                  <DialogDescription className="text-muted-foreground">
                    {plan.name}: {plan.price} RSD
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Card Preview */}
            <div className="relative h-44 rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6 text-white shadow-xl overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                  <div className="w-8 h-8 rounded-full bg-orange-400 opacity-80 -ml-4" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-mono text-lg tracking-wider mb-4">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-xs text-white/60 uppercase">Card Holder</div>
                    <div className="font-medium">{cardHolder || "YOUR NAME"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 uppercase">Expires</div>
                    <div className="font-medium">{expiryDate || "MM/YY"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolder">Ime na kartici</Label>
                <Input
                  id="cardHolder"
                  placeholder="MARKO MARKOVIĆ"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Broj kartice</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Datum isteka</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayNow}
            disabled={!isFormValid}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-6 text-lg shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            <Shield className="w-5 h-5 mr-2" />
            Plati {plan?.price} RSD
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            🔒 Sigurno plaćanje sa 256-bit enkripcijom
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  // Plans View (default)
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            Unlock Pro
            <Sparkles className="w-5 h-5 text-amber-400" />
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Dostigao si dnevni limit! Nadogradi na Pro za neograničen pristup.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-3 py-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground font-medium">{benefit.text}</span>
              <Check className="w-4 h-4 text-emerald-400 ml-auto" />
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={`relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                selectedPlan === plan.name
                  ? "ring-2 ring-primary border-primary bg-primary/10"
                  : plan.highlight
                    ? "border-2 border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold py-1 text-center">
                  {plan.badge}
                </div>
              )}
              <CardHeader className={`pb-2 ${plan.badge ? "pt-8" : ""}`}>
                <CardTitle className="text-center">
                  <span className="text-sm font-medium text-muted-foreground block mb-1">
                    {plan.name}
                  </span>
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">RSD</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4 text-center">
                <span className="text-xs text-muted-foreground">/{plan.period}</span>
                {plan.savings && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTAs */}
        <div className="pt-2 space-y-3">
          <Button
            onClick={() => {
              if (selectedPlan) {
                setView("payment");
              }
            }}
            disabled={!selectedPlan}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-6 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Plati karticom
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sigurno plaćanje • Otkaži bilo kada
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
