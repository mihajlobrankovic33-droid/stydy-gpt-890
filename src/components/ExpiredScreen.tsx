import { Clock, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpiredScreenProps {
  userName: string | null;
}

export const ExpiredScreen = ({ userName }: ExpiredScreenProps) => {
  const handleContact = () => {
    // Open WhatsApp or SMS
    window.open('https://wa.me/381XXXXXXXXX?text=Zdravo%20Mihajlo,%20treba%20mi%20novi%20paket%20za%20Study%20Buddy!', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-black" />
      
      {/* Expired screen content */}
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
          <Clock className="w-10 h-10 text-red-500" />
        </div>
        
        {userName && (
          <p className="text-sm text-muted-foreground mb-2">
            Zdravo, {userName}
          </p>
        )}
        
        <h1 className="text-xl font-bold text-foreground mb-4">
          Vaš paket je istekao
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Kontaktirajte Mihajla za novi paket.
        </p>

        <Button
          onClick={handleContact}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 rounded-xl shadow-lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Kontaktiraj Mihajla
        </Button>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <a 
            href="tel:+381XXXXXXXXX" 
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
            Pozovi
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-8">
          Premium pristup uključuje neograničen AI chat,
          <br />
          OCR kameru i sve premium funkcije.
        </p>
      </div>
    </div>
  );
};
