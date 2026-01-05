import { GraduationCap, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Study<span className="text-primary">GPT</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Your AI Study Buddy 📚
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
