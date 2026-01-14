import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type FullscreenModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function FullscreenModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
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

  return (
    <div className="fixed inset-0 z-[110] bg-background">
      <div className="h-full w-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
              {description ? (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
              aria-label="Zatvori"
              title="Zatvori"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">{children}</main>

        {footer ? (
          <footer className="border-t border-border bg-background/80 backdrop-blur-sm safe-area-bottom">
            <div className="px-4 py-3">{footer}</div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
