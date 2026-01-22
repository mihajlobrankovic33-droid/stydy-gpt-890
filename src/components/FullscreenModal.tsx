import { useEffect } from "react";
import { X, BookOpen, Calculator, FlaskConical, Globe, Languages, History, Dna, Atom, Monitor, Music, Palette, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";

type FullscreenModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  subject?: string;
};

// Clean markdown symbols from text
const cleanText = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/`/g, '')
    .trim();
};

// Get icon for subject
const getSubjectIcon = (subject: string) => {
  const s = subject.toUpperCase();
  
  if (s.includes("MATEMAT")) return <Calculator className="w-6 h-6" />;
  if (s.includes("FIZIK")) return <Atom className="w-6 h-6" />;
  if (s.includes("HEMIJ") || s.includes("KEMIJ")) return <FlaskConical className="w-6 h-6" />;
  if (s.includes("BIOLOG")) return <Dna className="w-6 h-6" />;
  if (s.includes("GEOGRAF")) return <Globe className="w-6 h-6" />;
  if (s.includes("ISTORIJ") || s.includes("POVIJEST")) return <History className="w-6 h-6" />;
  if (s.includes("SRPSKI") || s.includes("HRVAT") || s.includes("BOSANS") || s.includes("JEZIK")) return <BookOpen className="w-6 h-6" />;
  if (s.includes("ENGLESK") || s.includes("ENGLISH") || s.includes("NEMAČ") || s.includes("FRANC")) return <Languages className="w-6 h-6" />;
  if (s.includes("INFORMAT") || s.includes("RAČUNAR") || s.includes("PROGRAM")) return <Monitor className="w-6 h-6" />;
  if (s.includes("MUZIK") || s.includes("GLAZB")) return <Music className="w-6 h-6" />;
  if (s.includes("LIKOVN") || s.includes("UMJET")) return <Palette className="w-6 h-6" />;
  if (s.includes("FIZIČK") || s.includes("SPORT") || s.includes("TJELESN")) return <Dumbbell className="w-6 h-6" />;
  
  return <BookOpen className="w-6 h-6" />;
};

export function FullscreenModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  subject,
}: FullscreenModalProps) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Use subject first, then title - clean all markdown
  const displayTitle = cleanText(subject || title).toUpperCase();
  const subjectIcon = getSubjectIcon(displayTitle);

  return (
    <div className="fixed inset-0 z-[110] bg-background flex flex-col">
      {/* Close button only - top right corner */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 h-8 w-8 bg-background/80 backdrop-blur-sm"
        aria-label="Zatvori"
        title="Zatvori"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Content - full screen, no header */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pt-14">
        <div className="w-full max-w-2xl mx-auto">{children}</div>
      </main>

      {/* Footer - fixed at bottom */}
      {footer ? (
        <footer className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm safe-area-bottom">
          <div className="px-4 py-3 max-w-2xl mx-auto w-full">{footer}</div>
        </footer>
      ) : null}
    </div>
  );
}

export { cleanText };
