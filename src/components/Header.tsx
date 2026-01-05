import rabbitAvatar from "@/assets/rabbit-avatar.png";

export const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-soft">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-glow border-2 border-primary/20">
              <img 
                src={rabbitAvatar} 
                alt="StudyGPT Rabbit" 
                className="w-full h-full object-cover"
              />
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
