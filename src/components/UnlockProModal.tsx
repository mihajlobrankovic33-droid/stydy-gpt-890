import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Zap, Shield, Palette, Headphones } from "lucide-react";

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

export function UnlockProModal({ open, onOpenChange }: UnlockProModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              className={`relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                plan.highlight
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

        {/* CTA */}
        <div className="pt-2">
          <Button
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-6 text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            onClick={() => onOpenChange(false)}
          >
            <Shield className="w-5 h-5 mr-2" />
            Nadogradi Sada
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Sigurno plaćanje • Otkaži bilo kada
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
