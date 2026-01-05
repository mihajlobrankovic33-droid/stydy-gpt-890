import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Upload, Palette, RotateCcw, Check, ImageIcon } from "lucide-react";
import { useCustomization } from "@/context/CustomizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const backgroundPresets = [
  { name: "Cream", color: "40 33% 98%", gradient: null },
  { name: "Sky Blue", color: "200 80% 96%", gradient: null },
  { name: "Mint", color: "160 50% 95%", gradient: null },
  { name: "Lavender", color: "270 50% 96%", gradient: null },
  { name: "Peach", color: "20 70% 95%", gradient: null },
  { name: "Ocean", color: "200 60% 94%", gradient: "linear-gradient(180deg, hsl(200 80% 96%) 0%, hsl(180 60% 90%) 100%)" },
  { name: "Sunset", color: "30 80% 95%", gradient: "linear-gradient(180deg, hsl(40 70% 96%) 0%, hsl(15 60% 92%) 100%)" },
  { name: "Forest", color: "140 40% 94%", gradient: "linear-gradient(180deg, hsl(120 30% 95%) 0%, hsl(160 40% 90%) 100%)" },
];

const avatarPresets = [
  { name: "Default Rabbit", url: null },
];

export const CustomizationPanel = () => {
  const { settings, updateBackground, updateAvatar, resetToDefault, getAvatarUrl } = useCustomization();
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split(".").pop()}`;
      
      const { data, error } = await supabase.storage
        .from("custom-avatars")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("custom-avatars")
        .getPublicUrl(data.path);

      updateAvatar(urlData.publicUrl);
      toast({
        title: "Avatar updated! 🎉",
        description: "Your custom avatar is now set",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Customize StudyGPT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              StudyGPT Avatar
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 shadow-medium">
                <img
                  src={getAvatarUrl()}
                  alt="Current avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Custom Avatar"}
                </Button>
                {settings.customAvatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateAvatar(null)}
                    className="w-full text-muted-foreground"
                  >
                    Use Default Rabbit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Background Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Background Theme
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {backgroundPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateBackground(preset.color, preset.gradient)}
                  className={cn(
                    "relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105",
                    settings.backgroundColor === preset.color
                      ? "border-primary shadow-glow"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{
                    background: preset.gradient || `hsl(${preset.color})`,
                  }}
                  title={preset.name}
                >
                  {settings.backgroundColor === preset.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {backgroundPresets.find((p) => p.color === settings.backgroundColor)?.name || "Custom"}
            </p>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
